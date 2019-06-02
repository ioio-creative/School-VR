/*
  System Panel
  File | Edit | XXX | YYY        x
*/
import React, {Component} from 'react';

import './systemPanel.css';

// import consts from 'globals/consts';
const appName = require('globals/consts').default.appName;

const Events = require('vendor/Events.js');

class SystemPanel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      menuOpen: false,
      hoverItem: null,
      snapshot: []
    };
  }
  componentDidMount() {
  }
  componentWillUnmount() {
  }
  render() {
    return (
      <div id="system-panel">
        <div id="app-icon"></div>
        {/* <div id="app-name">School VR</div> */}
        <div id="app-buttons">
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
              }}>Toggle Debug</div>
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
export default SystemPanel;