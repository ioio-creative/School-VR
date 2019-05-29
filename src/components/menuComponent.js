/*
  System Panel
  File | Edit | XXX | YYY        x
*/
import React, {Component} from 'react';

import Mousetrap from 'mousetrap';
import Events from 'vendor/Events.js';

import config from 'globals/config';
import ipcHelper from 'utils/ipcHelper';
import {invokeIfIsFunction} from 'utils/variableType/isFunction';

import './menuComponent.css';

const electron = window.require('electron');
const ipcRenderer = electron.ipcRenderer;


const appName = config.appName;


class MenuComponent extends Component {
  constructor(props) {
    super(props);
    
    // state
    this.state = {
      menuOpen: false,
      hoverItem: null,
    };
    
    // variables
    this.buttons = [];    
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
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.handleClick);
    
    Mousetrap.reset();
  }

  /* end of react lifecycles */


  /* event handlers */

  handleClick = (e) => {
    this.setState({
      menuOpen: false
    })
  }

  handleBtnMinAppClick = (e) => {
    ipcHelper.minimizeWindow();
  }

  handleBtnMaxAppClick = (e) => {
    ipcHelper.toggleMaximizeWindow();
  }

  handleBtnCloseAppClick = (e) => {
    ipcHelper.closeWindow();
  }

  /* end of event handlers */

  
  render() {
    const props = this.props;
    const state = this.state;
    this.buttons.length = 0;
    return (
      <div id="system-panel">
        <div id="app-icon"></div>
        {/* <div id="app-name">School VR</div> */}
        <div id="app-buttons">
          {props.menuButtons.map((rootBtn, idx) => {
            return <div className={`menu-group${state.menuOpen && state.hoverItem === idx? ' hover': ''}`} key={idx}>
              <button
                onMouseEnter={_ => {
                  this.setState({
                    hoverItem: idx
                  })
                }}
                onClick={(e) => {
                  e.nativeEvent.stopImmediatePropagation();
                  invokeIfIsFunction(rootBtn.onClick);                    
                  this.setState((currentState) => {
                    return {
                      menuOpen: !currentState.menuOpen
                    }
                  })
                }}
              >
                {rootBtn.text}
              </button>
              {rootBtn.children && rootBtn.children.length && state.menuOpen && state.hoverItem === idx &&
                <div className="menu-list">
                  {rootBtn.children.map((childBtn, childIdx) => {
                    if (childBtn.text === '-') {
                      return <div className="seperator" key={childIdx}></div>;
                    } else {
                      return <div className="menu-item" key={childIdx} onClick={_ => {
                        invokeIfIsFunction(childBtn.onClick);                        
                        this.setState({
                          menuOpen: false
                        });
                      }}>
                        {childBtn.text}
                      </div>
                    }
                  })}
                </div>
              }
            </div>
          })}
        </div>
        <div id="app-name" title={this.props.projectName + ' - ' + appName}>
          <div className="project-name" onClick={_ => {
            let newProjectName = prompt('Enter New Project Name');
            if (newProjectName) {
              Events.emit('setProjectName', newProjectName, 'testing');
            }
          }}>{this.props.projectName}</div>
          <div className="hyphen">-</div>
          <div className="app-name">{appName}</div>
        </div>
        <div id="system-buttons">
          <button id="btn-min-app" onClick={this.handleBtnMinAppClick} />
          <button id="btn-max-app" onClick={this.handleBtnMaxAppClick} />
          <button id="btn-close-app" onClick={this.handleBtnCloseAppClick} />
        </div>
      </div>
    );
  }
}
export default MenuComponent;