import React from 'react';

import config, {languages} from 'globals/config';
/**
  Our translated strings
  !!! Important !!!
  Somehow, have to use relative path here...
 */
import localizedData from './localizedData.js';


/* language settings */

let globalLanguage;

// this is for setting language specific css
const htmlElement = document.querySelector('html');
const changeHtmlLang = (newCode) => {
  htmlElement.setAttribute('lang', newCode);
}

const changeGloballanguage = (newLanguage) => {
  globalLanguage = newLanguage;
  changeHtmlLang(newLanguage.code);
}

changeGloballanguage(config.defaultLanguage);

const getLocalizedDataSet = _ => {
  return localizedData[globalLanguage.code];
};

/* end of language settings */


const LanguageContext = React.createContext();


class LanguageContextProvider extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      language: globalLanguage
    };
    [
      'changeLanguageContext',
    ].forEach(methodName => {
      this[methodName] = this[methodName].bind(this);
    });

    this.changeLanguageFuncs = {};
    [languages.english, languages.traditionalChinese].forEach(lang => {
      this.changeLanguageFuncs[lang.code] = _ => this.changeLanguageContext(lang);
    });
  }

  changeLanguageContext(newLanguage) {
    if (this.state.language.code !== newLanguage.code) {
      changeGloballanguage(newLanguage);
      //loadGlobalLanugageFont();

      this.setState({
        language: globalLanguage
      });
    }
  }

  render() {
    const props = this.props;
    const state = this.state;
    return (
      <LanguageContext.Provider
        value={{
          language: state.language,
          messages: localizedData[state.language.code],
          changeLanguageFuncs: this.changeLanguageFuncs
        }}>
        {props.children}
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
          changeLanguageFuncs: value.changeLanguageFuncs
        });
      }}
    </LanguageContext.Consumer>
  );
}

function LanguageContextMessagesConsumer(props) {
  return (
    <LanguageContextConsumer render={
      ({ messages }) => (
        <>{messages[props.messageId]}</>
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
  getLocalizedDataSet,
  LanguageContextProvider,
  LanguageContextConsumer,
  LanguageContextMessagesConsumer,
  withLanguageContext,
};