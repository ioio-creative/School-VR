import React from 'react';

import config, {languages, getLanguageFromLanguageCode} from 'globals/config';
import {setCustomizedAppDataLangCodePromise} from 'globals/customizedAppData/customizedAppData';
/**
  Our translated strings
  !!! Important !!!
  Somehow, have to use relative path here...
 */
import localizedData from './localizedData.js';


/* language settings */

// set default for non-electron environment
let globalLanguage = config.defaultLanguage;

// this is for setting language specific css
const htmlElement = document.querySelector('html');
const changeHtmlLang = (newCode) => {
  htmlElement.setAttribute('lang', newCode);
}

const changeGlobalLanguagePromise = async (newLanguage, isRequireSaveLanguageToLocalFile = true) => {
  globalLanguage = newLanguage;
  changeHtmlLang(newLanguage.code);
  if (isRequireSaveLanguageToLocalFile) {
    await setCustomizedAppDataLangCodePromise(newLanguage.code);
  }
};

const changeGlobalLanguageByCodePromise = async (newLanguageCode, isRequireSaveLanguageToLocalFile = true) => {
  await changeGlobalLanguagePromise(getLanguageFromLanguageCode(newLanguageCode), isRequireSaveLanguageToLocalFile);
};

const getLocalizedMessage = messageId => {
  return localizedData[globalLanguage.code][messageId];
};

/* end of language settings */


const LanguageContext = React.createContext();


class LanguageContextProvider extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      language: globalLanguage
    };

    this.changeLanguagePromises = {};
    [languages.english, languages.traditionalChinese].forEach(lang => {
      this.changeLanguagePromises[lang.code] = async _ => await this.changeLanguageContextPromise(lang, true);
    });
  }

  changeLanguageContextPromise = async (newLanguage, isRequireSaveLanguageToLocalFile = true) => {
    if (this.state.language.code !== newLanguage.code) {
      //loadGlobalLanugageFont();

      if (isRequireSaveLanguageToLocalFile) {
        await changeGlobalLanguagePromise(newLanguage);
      }

      this.setState({
        language: globalLanguage
      });
    }
  }

  render() {
    const {
      children
    } = this.props;
    const {
      language
    } = this.state;
    return (
      <LanguageContext.Provider
        value={{
          language: language,
          messages: localizedData[language.code],
          changeLanguagePromises: this.changeLanguagePromises
        }}>
        {children}
      </LanguageContext.Provider>
    );
  }
}

function LanguageContextConsumer(props) {
  return (
    <LanguageContext.Consumer>
      {value => {
        return props.render({
          language: value.language,
          messages: value.messages,
          changeLanguagePromises: value.changeLanguagePromises
        });
      }}
    </LanguageContext.Consumer>
  );
}

function LanguageContextMessagesConsumer(props) {
  const { messageId } = props;  
  return (
    <LanguageContextConsumer render={
      ({ messages }) => (
        <>{messages[messageId]}</>
      )
    } />
  );
}

function withLanguageContext(Component) {
  return function WrapperComponent(props) {
    return (
      <LanguageContextConsumer render={
        ({ language, messages }) => (
          <Component language={language} messages={messages}
            {...props}
          />
        )
      } />
    );
  };
}

export {
  changeGlobalLanguagePromise,
  changeGlobalLanguageByCodePromise,
  getLocalizedMessage,
  LanguageContextProvider,
  LanguageContextConsumer,
  LanguageContextMessagesConsumer,
  withLanguageContext,
};