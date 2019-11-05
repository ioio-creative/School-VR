import React from 'react';

import config, {getLanguageFromBrowserLangIdCode, getLanguageFromLanguageCode} from 'globals/config';
import getSearchObjectFromLocation from 'utils/queryString/getSearchObjectFromLocation';
/**
  Our translated strings
  !!! Important !!!
  Somehow, have to use relative path here...
 */
import localeData from '../../locales/data.json';


/* language settings */

function getNavigatorLanguageWithRegionCode() {
  // Define user's language. Different browsers have the user locale defined
  // on different fields on the `navigator` object, so we make sure to account
  // for these different by checking all of them
  const language = (navigator.languages && navigator.languages[0]) ||
    navigator.language ||
    navigator.userLanguage;

  return language.toLowerCase();
}

function getNavigatorLanguageWithoutRegionCode() {
  const language = getNavigatorLanguageWithRegionCode();

  // Split locales with a region code
  const languageWithoutRegionCode = language.split(/[_-]+/)[0];

  return languageWithoutRegionCode;
}

const browserLangIdCode = getNavigatorLanguageWithRegionCode();
// browserLangIdCode = 'asdg';
// console.log('language: ' + getLanguageFromBrowserLangIdCode(browserLangIdCode));
const languageCodeFromQuery = getSearchObjectFromLocation(window.location).lang;
let globalLanguage = getLanguageFromLanguageCode(languageCodeFromQuery)
 || getLanguageFromBrowserLangIdCode(browserLangIdCode)
 || config.defaultLanguage;
// let globalLanguage = config.defaultLanguage;

// this is for setting language specific css
const htmlElement = document.querySelector('html');
const changeHtmlLang = (newCode) => {
  htmlElement.setAttribute('lang', newCode);
}
changeHtmlLang(globalLanguage.code);

/* end of language settings */


const LanguageContext = React.createContext();

// To force remount of React element by setting the key prop
// https://stackoverflow.com/questions/45332611/react-force-re-mount-component-on-route-change/45333138
// https://stackoverflow.com/questions/28329382/understanding-unique-keys-for-array-children-in-react-js/43892905#43892905
function passLanguageToAsyncLoadingComponentFunc(languageCode, messages, Component) {
  return (props) => <Component key={Component.displayName + '-' + languageCode} languageCode={languageCode} 
  messages={messages} {...props} />
}

class LanguageContextProvider extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      language: config.defaultLanguage
    };
    [
      'changeLanguageContext'
    ].forEach(methodName => {
      this[methodName] = this[methodName].bind(this);
    });
  }

  changeLanguageContext(newLanguage) {
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
          messages: localeData[state.language.locale],
          changeLanguageContextFunc: this.changeLanguageContext
        }}>
        {props.children}
      </LanguageContext.Provider>
    );
  }
}

export {
  LanguageContext,
  LanguageContextProvider,
  passLanguageToAsyncLoadingComponentFunc
};

