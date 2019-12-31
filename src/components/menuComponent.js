/*
  System Panel
  File | Edit | XXX | YYY        x
*/
import React, {Component} from 'react';

import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';

import {withSceneContext} from 'globals/contexts/sceneContext';
import Mousetrap from 'mousetrap';

import ipcHelper from 'utils/ipc/ipcHelper';
import {invokeIfIsFunction} from 'utils/variableType/isFunction';

import appIcon from 'app_icon.png';

import config from 'globals/config';

import './menuComponent.css';


class MenuComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      menuOpen: false,
      hoverItem: null,
      isWindowMaximized: false
    };
    this.buttons = [];

    // bind event handlers
    [
      'handleClick',
      'handleBtnMinAppClick',
      'handleBtnMaxAppClick',
      'handleBtnCloseAppClick'
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
        return {
          // hoverItem: 0,
          menuOpen: !currentState.menuOpen
        }
      })
    })
    Mousetrap.bind('ctrl+z', (e) => {
      e.preventDefault();
      self.props.sceneContext.undo()
    })
    Mousetrap.bind('ctrl+y', (e) => {
      e.preventDefault();
      self.props.sceneContext.redo()
    })
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.handleClick);
    Mousetrap.reset();
  }

  /* end react lifecycles */


  /* event handlers */

  handleClick(event) {
    this.setState({
      menuOpen: false
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
    ipcHelper.closeWindow();
  }  

  /* end of event handlers */

  
  render() {
    const props = this.props;
    const state = this.state;
    this.buttons.length = 0;
    const projectName = props.sceneContext.getProjectName();
    const appName = config.appName;
    // console.log(props.menuButtons);
    return (
      <div id="system-panel">
        <div id="app-icon">
          <img src={appIcon} />
        </div>
        {/* <div id="app-name">School VR</div> */}
        <div id="app-buttons">
          {props.menuButtons.map((rootBtn, idx) => {
            const isDisabled = rootBtn.disabled === true;
            const isMenuOpened = state.menuOpen;
            const isHovered = state.hoverItem === idx;
            return <div className={`menu-group${isDisabled ? ' disabled': ''}${isHovered ? ' hover': ''}`} key={idx}>
              <button
                onMouseEnter={_ => {                              
                  if (!isDisabled) {
                    this.setState({
                      hoverItem: idx
                    });
                  }
                }}
                onMouseExit={_ => {
                  this.setState({
                    hoverItem: -1
                  });
                }}
                onClick={(e) => {
                  e.nativeEvent.stopImmediatePropagation();
                  if (!isDisabled) {
                    invokeIfIsFunction(rootBtn.onClick);                    
                    this.setState((currentState) => {
                      return {
                        menuOpen: !currentState.menuOpen
                      }
                    })
                  }
                }}
              >
                {rootBtn.label}
              </button>
              {rootBtn.children && rootBtn.children.length && isMenuOpened && isHovered &&
                <div className="menu-list" onClick={(e) => {
                  e.nativeEvent.stopImmediatePropagation(); 
                }} >
                  {rootBtn.children.map((childBtn, childIdx) => {
                    if (childBtn.label === '-') {
                      return <div className={`seperator${childBtn.disabled? ' disabled': ''}`} key={childIdx} />;
                    } else {
                      return <div className={`menu-item${childBtn.disabled? ' disabled': ''}`} key={childIdx} onClick={(e) => {
                        if (!childBtn.disabled) {
                          invokeIfIsFunction(childBtn.onClick);                          
                          this.setState({
                            menuOpen: false
                          });
                        }
                      }}>
                        {childBtn.label}
                      </div>
                    }
                  })}
                </div>
              }
            </div>
          })}
        </div>
        <div id="app-name" title={`${projectName? projectName + ' - ': ''}${appName}`}>
          {projectName && <div className="project-name" onClick={()=>{
            let newProjectName = prompt('Enter New Project Name', projectName);
            if (newProjectName) {
              props.sceneContext.setProjectName(newProjectName);
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
export default withSceneContext(MenuComponent);