import React from 'react';

import config, {languages} from 'globals/config';
import getSearchObjectFromLocation from 'utils/queryString/getSearchObjectFromLocation';
/**
  Our translated strings
  !!! Important !!!
  Somehow, have to use relative path here...
 */
import localizedData from 'locales/data.js';


/* language settings */

let globalLanguage = config.defaultLanguage;
// let globalLanguage = config.defaultLanguage;

// this is for setting language specific css
const htmlElement = document.querySelector('html');
const changeHtmlLang = (newCode) => {
  htmlElement.setAttribute('lang', newCode);
}
changeHtmlLang(globalLanguage.code);

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
    console.log(newLanguage)
    if (this.state.language.code !== newLanguage.code) {
      globalLanguage = newLanguage;
      changeHtmlLang(newLanguage.code);
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
      ({ language, messages }) => (        
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
  globalLanguage,
  LanguageContextProvider,
  LanguageContextConsumer,
  LanguageContextMessagesConsumer,
  withLanguageContext
};