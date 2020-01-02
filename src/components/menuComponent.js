/*
  System Panel
  File | Edit | XXX | YYY        x
*/
import React, {Component} from 'react';
import {withRouter} from 'react-router-dom';
import Mousetrap from 'mousetrap';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';

import routes from 'globals/routes';
import {withSceneContext} from 'globals/contexts/sceneContext';
import {LanguageContextConsumer, getLocalizedMessage} from 'globals/contexts/locale/languageContext';

import ipcHelper from 'utils/ipc/ipcHelper';
import {invokeIfIsFunction} from 'utils/variableType/isFunction';
import isNonEmptyArray from 'utils/variableType/isNonEmptyArray';

import appIcon from 'app_icon.png';

import config, {languages} from 'globals/config';

import './menuComponent.css';


class MenuComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      menuOpen: -1,
      hoverItem: -1,
      isWindowMaximized: false
    };

    // constants
    this.langBtns = {
      labelId: "Menu.LanguageLabel",
      children: [
        {
          labelId: "Menu.Language.English",
          languageCodeToChangeTo: languages.english.code,
        },
        {
          labelId: "Menu.Language.TraditionalChinese",
          languageCodeToChangeTo: languages.traditionalChinese.code,
        }
      ]
    };

    [
      // event handlers
      'handleClick',
      'handleBtnMinAppClick',
      'handleBtnMaxAppClick',
      'handleBtnCloseAppClick',

      // public methods
      'goToHomePage',
      'closeApp',
      
      // private methods      
      'confirmLeave',
    ].forEach(methodName => {
      this[methodName] = this[methodName].bind(this);
    });
  }


  /* react lifecycles */

  componentDidMount() {
    document.addEventListener('click', this.handleClick);
    const self = this;
    Mousetrap.bind('alt', (e) => {
      e.preventDefault();
      self.setState((currentState) => {
        const isAnyMenuOpened = currentState.menuOpen !== -1;
        return {
          // hoverItem: 0,
          menuOpen: isAnyMenuOpened ? -1 : currentState.hoverItem
        }
      });
    });
    Mousetrap.bind('ctrl+z', (e) => {
      e.preventDefault();
      self.props.sceneContext.undo()
    });
    Mousetrap.bind('ctrl+y', (e) => {
      e.preventDefault();
      self.props.sceneContext.redo()
    });
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.handleClick);
    Mousetrap.reset();
  }

  /* end react lifecycles */  


  /* event handlers */

  handleClick(event) {
    this.setState({
      menuOpen: -1
    });
  }

  handleBtnMinAppClick(event) {
    ipcHelper.minimizeWindow();
  }

  handleBtnMaxAppClick(event) {    
    ipcHelper.toggleMaximizeWindow((_, data) => {      
      this.setState({
        isWindowMaximized: data.isMaximized
      });
    });
  }

  handleBtnCloseAppClick(event) {    
    this.closeApp();
  }

  /* end of event handlers */  


  /* public methods */

  goToHomePage() {
    this.props.history.push(routes.home);
  }
  
  closeApp() {
    if (this.confirmLeave()) {
      ipcHelper.closeWindow();
    }
  }

  /* end of public methods */


  /* private methods */

  confirmLeave() {
    let isConfirmCloseApp = false;
    const { history, sceneContext } = this.props;    
    switch (history.location.pathname) {
      case routes.editor:
        isConfirmCloseApp = sceneContext.isProjectSaved || window.confirm(getLocalizedMessage('Prompt.UnsavedWorkMessage'));
        break;
      case routes.presenter:
        isConfirmCloseApp = !sceneContext.isInPresentationRecording || window.confirm(getLocalizedMessage('Prompt.IncompleteRecordingMessage'));
        break;
      default:
        isConfirmCloseApp = true;
        break;
    }
    return isConfirmCloseApp;
  }

  /* end of private methods */

  
  render() {
    const props = this.props;
    const state = this.state;    
    const sceneContext = props.sceneContext;
    const projectName = sceneContext.getProjectName();
    const appName = config.appName;
    // console.log(props.menuButtons);
        
    return (
      <div id="system-panel">
        <div id="app-icon">
          <img src={appIcon} />
        </div>
        {/* <div id="app-name">School VR</div> */}        
        <div id="app-buttons">
          {props.menuButtons.concat(this.langBtns).map((rootBtn, idx) => {
            const isDisabled = rootBtn.disabled === true;
            const isAnyMenuOpened = state.menuOpen !== -1;
            const isMenuOpened = state.menuOpen === idx;
            const isHovered = state.hoverItem === idx;
            const shouldBeHighlighted = isHovered || isMenuOpened;
            const children = rootBtn.children;
            return <div className={`menu-group${isDisabled ? ' disabled': ''}${shouldBeHighlighted ? ' hover': ''}`} key={idx}>
              <LanguageContextConsumer render={
                ({ messages }) => (
                  <button
                    onMouseEnter={_ => {                              
                      if (!isDisabled) {
                        this.setState((currentState) => ({
                          hoverItem: idx,
                          menuOpen: isAnyMenuOpened ? idx : currentState.menuOpen
                        }));
                      }
                    }}
                    onMouseLeave={_ => {                  
                      this.setState({
                        hoverItem: -1
                      });
                    }}
                    onClick={(e) => {
                      e.nativeEvent.stopImmediatePropagation();
                      if (!isDisabled) {
                        invokeIfIsFunction(rootBtn.onClick);                    
                        this.setState({
                          menuOpen: isMenuOpened ? -1 : idx 
                        });
                      }
                    }}
                  >
                    {messages[rootBtn.labelId]}
                  </button>
                )
              } />                
              {isNonEmptyArray(children) && isMenuOpened && 
                <div className="menu-list" onClick={(e) => {
                  e.nativeEvent.stopImmediatePropagation(); 
                }} >
                  {children.map((childBtn, childIdx) => {
                    if (childBtn.labelId === '-') {
                      return <div className={`seperator${childBtn.disabled? ' disabled': ''}`} key={childIdx} />;
                    } else {
                      return (
                        <LanguageContextConsumer render={
                          ({ messages, changeLanguagePromises }) => (

                            <div className={`menu-item${childBtn.disabled? ' disabled': ''}`} key={childIdx} onClick={async (e) => {
                              if (!childBtn.disabled) {
                                invokeIfIsFunction(childBtn.onClick);
                                invokeIfIsFunction(this[childBtn.methodNameToInvoke]);                                

                                this.setState({
                                  menuOpen: -1
                                });

                                if (childBtn.languageCodeToChangeTo) {
                                  await changeLanguagePromises[childBtn.languageCodeToChangeTo]();
                                }
                              }
                            }}>
                              {messages[childBtn.labelId]}
                            </div>
                          )
                        } />
                      );
                    }
                  })}
                </div>
              }
            </div>
          })}
        </div>
        <div id="app-name" title={`${projectName? projectName + ' - ': ''}${appName}`}>
          {projectName && <div className="project-name" onClick={_ => {
            let newProjectName = prompt('Enter New Project Name', projectName);
            if (newProjectName) {
              sceneContext.setProjectName(newProjectName);
            }
          }}>{projectName}</div>
          }
          {projectName && <div className="hyphen">-</div>}
          <div className="app-name">{appName}</div>
        </div>
        <div id="system-buttons">
          <button id="btn-min-app" onClick={this.handleBtnMinAppClick}>
            <FontAwesomeIcon icon="window-minimize" />
          </button>
          <button id="btn-max-app" onClick={this.handleBtnMaxAppClick}>
            {
              state.isWindowMaximized ?
              <FontAwesomeIcon icon="window-restore" />
              :
              <FontAwesomeIcon icon="window-maximize" />
            }            
          </button>
          <button id="btn-close-app" onClick={this.handleBtnCloseAppClick}>
            <FontAwesomeIcon icon="window-close" />
          </button>
        </div>
      </div>
    );
  }
}

export default withSceneContext(withRouter(MenuComponent));