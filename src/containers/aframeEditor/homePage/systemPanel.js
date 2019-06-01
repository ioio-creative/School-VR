/*
  System Panel
  File | Edit | XXX | YYY        x
*/
import React, {Component} from 'react';
import {Link} from 'react-router-dom';

import routes from 'globals/routes';
import ipcHelper from 'utils/ipcHelper';

import isNonEmptyArray from 'utils/variableType/isNonEmptyArray';

import './systemPanel.css';
import handleErrorWithUiDefault from 'utils/errorHandling/handleErrorWithUiDefault';

const appName = require('globals/config').default.appName;

const Events = require('vendor/Events.js');

const smalltalk = require('smalltalk');


class SystemPanel extends Component {
  constructor(props) {
    super(props);
    
    this.state = {
      menuOpen: false,
      hoverItem: null,
      snapshot: []
    };

    this.clickEvent = this.clickEvent.bind(this);
    this.handleWindowMaximize = this.handleWindowMaximize;
    this.handleWindowUnmaximize = this.handleWindowUnmaximize;
  }


  /* react lifecycles */

  componentDidMount() {
    ipcHelper.addListener('maximize', this.handleWindowMaximize);      
    ipcHelper.addListener('unmaximize', this.handleWindowUnmaximize);
    document.addEventListener('click', this.clickEvent);
  }

  componentWillUnmount() {
    ipcHelper.removeListener('maximize', this.handleWindowMaximize);      
    ipcHelper.removeListener('unmaximize', this.handleWindowUnmaximize);
    document.removeEventListener('click', this.clickEvent);
  }

  /* end of react lifecycles */


  /* event handlers */

  clickEvent(event) {
    if (!this.menuWrap.contains(event.target)) {
      this.setState({
        menuOpen: false
      });
    }
  }

  handleWindowMaximize(event, arg) {
    const bodyClassList = document.body.classList;
    bodyClassList.add("maximized");
  }

  handleWindowUnmaximize(event, arg) {
    const bodyClassList = document.body.classList;
    bodyClassList.remove("maximized");
  }

  /* end of event handlers */
  
  render() {
    return (
      <div id="system-panel">
        <div className="window-resizer border-top"></div>
        <div id="app-icon"></div>
        {/* <div id="app-name">School VR</div> */}
        <div id="app-buttons" ref={ref=>this.menuWrap = ref}>
          <div className="menu-group">
            <button
              onMouseEnter={()=> {
              this.setState({
                'hoverItem': 'file'
              })
              }}
              onClick={() => this.setState((currentState) => {
                return {menuOpen: !currentState.menuOpen}
              })}
            >
              File
            </button>
            {this.state.hoverItem === 'file' && this.state.menuOpen &&
              <div className="menu-list list-file">
                {/* added by chris, to be removed */}
                <div className="menu-item">
                  <Link to={routes.home}>Home</Link>
                </div>
                <div className="menu-item" onClick={() => {
                  Events.emit('newProject');
                  this.setState({
                    menuOpen: false
                  });
                }}>New Project</div>
                <div className="seperator"></div>
                <div className="menu-item" onClick={() => {
                  Events.emit('saveProject');
                  this.setState({
                    menuOpen: false
                  });
                }}>Save</div>
                <div className="menu-item" onClick={() => {
                  {/* navigator.clipboard.readText().then(text => {
                    Events.emit('loadProject', text);
                    this.setState({
                      menuOpen: false
                    });
                  }); */}

                  ipcHelper.openSchoolVrFileDialog((err, data) => {
                    if (err) {
                      handleErrorWithUiDefault(err);
                      return;
                    }

                    const filePaths = data;
                    if (isNonEmptyArray(filePaths)) {
                      ipcHelper.loadProjectByProjectFilePath(filePaths[0], (err, data) => {
                        if (err) {
                          handleErrorWithUiDefault(err);                          
                        } else {
                          const projectJson = data.projectJson;
                          Events.emit('loadProject', projectJson);
                        }
                        
                        this.setState({
                          menuOpen: false
                        });
                      });
                    } else {                      
                      //alert('No files are selected!');
                    }
                  });   
                }}>Load</div>
                <div className="seperator"></div>
                <div className="menu-item" onClick={() => {
                  alert('Bye');
                }}>Exit</div>
              </div>
            }
            </div>
            <div className="menu-group">
            <button
              onMouseEnter={()=> {
                this.setState({
                  'hoverItem': 'edit'
                })
              }}
              onClick={() => this.setState((currentState) => {
                return {menuOpen: !currentState.menuOpen}
              })}
            >
              Edit
            </button>
            {this.state.hoverItem === 'edit' && this.state.menuOpen &&
            <div className="menu-list list-edit">
                <div className="menu-item" onClick={() => {
                  {/* alert('developing') */}
                  Events.emit('undo');
                  this.setState({
                    menuOpen: false
                  });
                }}>Undo</div>
                <div className="menu-item" onClick={() => {
                  {/* alert('developing') */}
                  Events.emit('redo');
                  this.setState({
                    menuOpen: false
                  });
                }}>Redo</div>
              </div>
            }
            </div>
            <div className="menu-group">
            <button
              onMouseEnter={()=> {
                this.setState({
                  'hoverItem': 'debug'
                })
              }}
              onClick={() => this.setState((currentState) => {
                return {menuOpen: !currentState.menuOpen}
              })}
            >
              Debug
            </button>
            {this.state.hoverItem === 'debug' && this.state.menuOpen &&
            <div className="menu-list list-debug">
                <div className="menu-item" onClick={() => {
                  Events.emit('toggleDebug');
                  this.setState({
                    menuOpen: false
                  });
                }}>
                  Toggle S/L Debug
                </div>
                <div className="menu-item" onClick={() => {
                  ipcHelper.toggleDevTools();
                  this.setState({
                    menuOpen: false
                  });
                }}>
                  Toggle DevTools
                </div>
              </div>
            }
          </div>
        </div>
        <div id="app-name" title={this.props.projectName + ' - ' + appName}>
          <div className="project-name" onClick={()=>{
            smalltalk.prompt('Enter New Project Name', 'Enter New Project Name', this.props.projectName)
              .then((value) => {
                if (value) {
                  Events.emit('setProjectName', value);
                }
              });            
          }}>{this.props.projectName}</div>
          <div className="hyphen">-</div>
          <div className="app-name">{appName}</div>
        </div>
        <div id="system-buttons">
          <button id="btn-min-app" onClick={() => {
            ipcHelper.minimizeWindow();
          }} />
          <button id="btn-max-app" onClick={()=>{
            ipcHelper.toggleMaximizeWindow();
          }} />
          <button id="btn-close-app" onClick={()=>{
            ipcHelper.closeWindow();
          }} />
        </div>
      </div>
    );
  }
}
export default SystemPanel;