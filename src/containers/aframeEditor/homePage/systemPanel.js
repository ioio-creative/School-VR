/*
  System Panel
  File | Edit | XXX | YYY        x
*/
import React, {Component} from 'react';

import IPCKeys from 'globals/ipcKeys';

import './systemPanel.css';

const appName = require('globals/config').default.appName;

const Events = require('vendor/Events.js');

const remote = window.require('electron').remote;

const ipcRenderer = window.require('electron').ipcRenderer;

class SystemPanel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      menuOpen: false,
      hoverItem: null,
      snapshot: []
    };
    const self = this;
    this.clickEvent = function(event) {
      if (!self.menuWrap.contains(event.target)) {
        self.setState({
          menuOpen: false
        });
      }
    }
  }
  componentDidMount() {
    ipcRenderer.on('maximize', () => {
      const bodyClassList = document.body.classList;
      bodyClassList.add("maximized");
    })
    ipcRenderer.on('unmaximize', () => {
      const bodyClassList = document.body.classList;
      bodyClassList.remove("maximized");
    })
    document.addEventListener('click', this.clickEvent);
  }
  componentWillUnmount() {
    document.removeEventListener('click', this.clickEvent);
  }
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
                  navigator.clipboard.readText().then(text => {
                    Events.emit('loadProject', text);
                    this.setState({
                      menuOpen: false
                  });
                  })
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
                  alert('developing')
                }}>Undo</div>
                <div className="menu-item" onClick={() => {
                  alert('developing')
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
                  ipcRenderer.send(IPCKeys.toggleDevTools);
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
            let newProjectName = prompt('Enter New Project Name');
            if (newProjectName) {
              Events.emit('setProjectName', newProjectName, 'testing');
            }
          }}>{this.props.projectName}</div>
          <div className="hyphen">-</div>
          <div className="app-name">{appName}</div>
        </div>
        <div id="system-buttons">
          <button id="btn-min-app" onClick={() => {
            const win = remote.getCurrentWindow();
            win.minimize();
          }} />
          <button id="btn-max-app" onClick={()=>{
            ipcRenderer.send(IPCKeys.toggleMaximize);
          }} />
          <button id="btn-close-app" onClick={()=>{
            const win = remote.getCurrentWindow();
            win.close();
          }} />
        </div>
      </div>
    );
  }
}
export default SystemPanel;