/*
  System Panel
  File | Edit | XXX | YYY        x
*/
import React, {Component} from 'react';

import {withSceneContext} from 'globals/contexts/sceneContext';

import './menuComponent.css';

const Mousetrap = require('mousetrap');

const Events = require('vendor/Events.js');

const appName = 'School VR';

class MenuComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      menuOpen: false,
      hoverItem: null,
    };
    this.buttons = [];

    this.onClick = this.onClick.bind(this);
  }
  componentDidMount() {
    document.addEventListener('click', this.onClick);
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
  onClick(e) {
    this.setState({
      menuOpen: false
    })
  }
  componentWillUnmount() {
    document.removeEventListener('click', this.onClick);
    Mousetrap.reset();
  }
  render() {
    const props = this.props;
    const state = this.state;
    this.buttons.length = 0;
    const projectName = '';//props.sceneContext.getProjectName();
    const appName = '';//props.sceneContext.getAppName();
    return (
      <div id="system-panel">
        <div id="app-icon"></div>
        {/* <div id="app-name">School VR</div> */}
        <div id="app-buttons">
          {props.menuButtons.map((rootBtn, idx) => {
            return <div className={`menu-group${rootBtn.disabled? ' disabled': ''}${state.menuOpen && state.hoverItem === idx? ' hover': ''}`} key={idx}>
              <button
                onMouseEnter={()=> {
                  if (!rootBtn.disabled) {
                    this.setState({
                      hoverItem: idx
                    })
                  }
                }}
                onClick={(e) => {
                  e.nativeEvent.stopImmediatePropagation();
                  if (!rootBtn.disabled) {
                    if (typeof(rootBtn.onClick) === 'function') {
                      rootBtn.onClick();
                    }
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
              {rootBtn.children && rootBtn.children.length && state.menuOpen && state.hoverItem === idx &&
                <div className="menu-list" onClick={(e) => {
                  e.nativeEvent.stopImmediatePropagation(); 
                }} >
                  {rootBtn.children.map((childBtn, childIdx) => {
                    if (childBtn.label === '-') {
                      return <div className={`seperator${childBtn.disabled? ' disabled': ''}`} key={childIdx} />;
                    } else {
                      return <div className={`menu-item${childBtn.disabled? ' disabled': ''}`} key={childIdx} onClick={(e) => {
                        if (!childBtn.disabled) {
                          if (typeof(childBtn.onClick) === 'function') {
                            childBtn.onClick();
                          }
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
          <button id="btn-min-app"></button>
          <button id="btn-max-app" onClick={()=>{
            Events.emit('toggleMaximize');
          }}></button>
          <button id="btn-close-app"></button>
        </div>
      </div>
    );
  }
}
export default withSceneContext(MenuComponent);