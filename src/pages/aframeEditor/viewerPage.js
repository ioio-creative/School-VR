import React, {Component} from 'react';

import {withSceneContext} from 'globals/contexts/sceneContext';

import MenuComponent from 'components/menuComponent';

import ButtonsPanel from 'containers/aframeEditor/homePage/buttonsPanel';
import AFramePanel from 'containers/aframeEditor/homePage/aFramePanel';
import InfoPanel from 'containers/aframeEditor/homePage/infoPanel';
import SlidesPanel from 'containers/aframeEditor/homePage/slidesPanel';
import TimelinePanel from 'containers/aframeEditor/homePage/timelinePanel';
// import AssetsPanel from 'containers/aframeEditor/homePage/assetsPanel';
import io from 'socket.io-client';
import Editor from 'vendor/editor.js';

// import Editor from 'vendor/editor.js';
// import {addEntityAutoType} from 'utils/aFrameEntities';
// import {roundTo, jsonCopy} from 'globals/helperfunctions';
// import {TweenMax, TimelineMax, Linear} from 'gsap';

import './viewerPage.css';
const Events = require('vendor/Events.js');

// const io = require('socket.io-client');
// or with import syntax
// const jsonSchemaValidator = require('jsonschema').Validator;
// const validator = new jsonSchemaValidator();
// const schema = require('schema/aframe_schema_20181108.json');

class ViewerPage extends Component {
  constructor(props) {
    super(props);
    this.inited = false;
    this.state = {
      socket: null
    }
    // this.onEditorLoad = this.onEditorLoad.bind(this);
    // Events.on('editor-load', this.onEditorLoad);

  }
  componentDidMount() {
    const props = this.props;
    const sceneContext = props.sceneContext;
    this.editor = new Editor();
    Events.on('editor-load', (editor) => {
      editor.close();
      editor.currentCameraEl.removeAttribute('wasd-controls');
    })
    sceneContext.updateEditor(this.editor);
    // TODO
    // need to get the current machine ip and port from ipc
    const socket = io(window.location.origin);
    // const socket = io('http://10.0.1.111:1413');
    socket.on('connect', () => {
      console.log('connected!!!'); // socket.connected); // true
      socket.emit('registerViewer');
    });
    socket.on('serverMsg', (msg) => {
      console.log('message from server: ', msg);
    })
    socket.on('updateSceneData', (sceneData) => {
      console.log('sceneData recieved');
      const autoInit = setInterval(() => {
        if (sceneContext.editor) {
          sceneContext.loadProject(sceneData);
          clearInterval(autoInit);
        }
      }, 100)
    })
    socket.on('updateSceneStatus', (statusMsg) => {
      console.log('sceneStatus recieved: ', statusMsg);
      /** 
       * statusMsg
       *   action
       *   details
       *     slideId ?
      */
      const autoPlay = true;
      switch (statusMsg.action) {
        case 'selectSlide': {
          sceneContext.selectSlide(
            statusMsg.details.slideId,
            statusMsg.details.autoPlay
          );
          break;
        }
        case 'playSlide': {
          sceneContext.playSlide()
          break;
        }
      }
    })
    this.setState({
      socket: socket
    })
  }
  componentWillUnmount() {
    if (this.state.socket) {
      this.state.socket.close();
    }
  }
  
  // onClick() {
  //   // socket.emit('roomCreate', 'room A')
  // }
  render() {
    const state = this.state;
    const sceneContext = this.props.sceneContext;    
    return (
      <div id="viewer">
        {/* <LanguageContextConsumer render={
            ({ language, messages }) => (
              <Prompt
                when={true}
                message={messages['Prompt.UnsavedWorkMessage']}
              />
            )
          } /> */}
        {/* <SystemPanel projectName={this.projectName} /> */}
        {/* <MenuComponent 
          // projectName="Untitled_1"
          menuButtons={[
            {
              label: 'File',
              // onClick: _=> { console.log('file') },
              children: [
                {
                  label: 'New',
                  disabled: false,
                  onClick: _=> { 
                    console.log('new');
                    // test open file with user defined extension
                    // const fileDialog = document.createElement('input');
                    // fileDialog.type = 'file';
                    // fileDialog.multiple = true;
                    // fileDialog.accept = ['image/x-png','image/gif'];
                    // fileDialog.click();
                  }
                },
                {
                  label: 'Open',
                  disabled: false,
                  onClick: _=> { console.log('open') }
                },
                {
                  label: '-'
                },
                {
                  label: 'Exit',
                  disabled: false,
                  onClick: _=> { console.log('exit') }
                }
              ]
            }
          ]}
        /> */}
        {/* <ButtonsPanel /> */}
        <AFramePanel disableVR={false} user-mode="viewer" />
        {/* <SlidesPanel isEditing={false} /> */}
        {/* <TimelinePanel /> */}
        {/* <InfoPanel /> */}
      </div>
    );
  }
}

export default withSceneContext(ViewerPage);
