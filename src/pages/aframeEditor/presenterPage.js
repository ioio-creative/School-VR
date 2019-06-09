import React, {Component, Fragment} from 'react';
// import SystemPanel from 'containers/aframeEditor/homePage/systemPanel';
import {withRouter, Prompt} from 'react-router-dom';

import {withSceneContext} from 'globals/contexts/sceneContext';

import MenuComponent from 'components/menuComponent';

import ButtonsPanel from 'containers/aframeEditor/homePage/buttonsPanel';
import AFramePanel from 'containers/aframeEditor/homePage/aFramePanel';
import InfoPanel from 'containers/aframeEditor/homePage/infoPanel';
import SlidesPanel from 'containers/aframeEditor/homePage/slidesPanel';
import TimelinePanel from 'containers/aframeEditor/homePage/timelinePanel';
// import AssetsPanel from 'containers/aframeEditor/homePage/assetsPanel';

import Editor from 'vendor/editor.js';
// import {addEntityAutoType} from 'utils/aFrameEntities';
// import {roundTo, jsonCopy} from 'globals/helperfunctions';
// import {TweenMax, TimelineMax, Linear} from 'gsap';
import io from 'socket.io-client';

import isNonEmptyArray from 'utils/variableType/isNonEmptyArray';
import handleErrorWithUiDefault from 'utils/errorHandling/handleErrorWithUiDefault';
import ipcHelper from 'utils/ipc/ipcHelper';
import routes from 'globals/routes';

import './presenterPage.css';
const Events = require('vendor/Events.js');
const uuid = require('uuid/v1');

// const jsonSchemaValidator = require('jsonschema').Validator;
// const validator = new jsonSchemaValidator();
// const schema = require('schema/aframe_schema_20181108.json');

let loadedProjectFilePath = '';

class PresenterPage extends Component {
  constructor(props) {
    super(props);
    this.inited = false;
    this.state = {
      socket: null
    }
    // this.onEditorLoad = this.onEditorLoad.bind(this);
    // Events.on('editor-load', this.onEditorLoad);
    this.handleHomeButtonClick = this.handleHomeButtonClick.bind(this);
    this.handleOpenProjectButtonClick = this.handleOpenProjectButtonClick.bind(this);
    this.handleExitButtonClick = this.handleExitButtonClick.bind(this);
    this.loadProject = this.loadProject.bind(this);
  }
  componentDidMount() {
    const props = this.props;
    const sceneContext = props.sceneContext;
    this.editor = new Editor();
    Events.on('editor-load', (editor) => {
      editor.close();
    })
    sceneContext.updateEditor(this.editor);
    // this.props.sceneContext
    this.inited = true;
    const socket = io('http://localhost:1413');
    socket.on('connect', () => {
      console.log('connected!!!'); // socket.connected); // true
      socket.emit('registerPresenter');
    });
    socket.on('serverMsg', (msg) => {
      console.log('message from server: ', msg);
    })
    // document.addEventListener('dblclick', this.sendMessage);
    this.setState({
      socket: socket
    })
  }
  // onEditorLoad(editor) {
  //   const props = this.props;
  //   const savedProjectStr = localStorage.getItem('schoolVRSave');
  //   if (props.match.params.projectId === undefined || !savedProjectStr) {
  //     props.sceneContext.newProject();
  //   } else {
  //     props.sceneContext.loadProject(JSON.parse(savedProjectStr));
  //   }
  //   editor.close();
  // }
  componentDidUpdate() {
  }
  componentWillUnmount() {
    // Events.removeListener('editor-load', this.onEditorLoad);
    this.editor = null;
    // document.removeEventListener('dblclick', this.sendMessage);
  }
  // sendMessage(msg) {
  //   this.state.socket.emit('test', 'hello');
  // }

  handleHomeButtonClick(event) {
    this.props.history.push(routes.home);
  }

  handleOpenProjectButtonClick(event) {
    ipcHelper.openSchoolVrFileDialog((err, data) => {
      if (err) {
        handleErrorWithUiDefault(err);
        return;
      }

      const filePaths = data.filePaths;

      if (!isNonEmptyArray(filePaths)) {
        return;
      }
      
      this.loadProject(filePaths[0]);
    });
  }
  
  handleExitButtonClick(event) {
    ipcHelper.closeWindow();
  }

  loadProject(projectFilePath) {
    const state = this.state;
    const sceneContext = this.props.sceneContext;
    ipcHelper.loadProjectByProjectFilePath(projectFilePath, (err, data) => {
      if (err) {
        handleErrorWithUiDefault(err);
        return;                         
      }

      // TODO: ask hung to put into sceneContext
      loadedProjectFilePath = projectFilePath;
      
      const projectJsonData = data.projectJson;
      //console.log(projectJsonData);
      // send a copy to server
      state.socket.emit('useSceneData', projectJsonData);
      sceneContext.loadProject(projectJsonData);   
    });
  }
  render() {
    const state = this.state;
    const sceneContext = this.props.sceneContext;
    return (
      <div id="presenter">
        {/* <Prompt
          when={true}
          message='You have unsaved changes, are you sure you want to leave?'
        /> */}
        {/* <SystemPanel projectName={this.projectName} /> */}
        <MenuComponent 
          // projectName="Untitled_1"
          menuButtons={[
            {
              label: 'File',
              // onClick: _=> { console.log('file') },
              children: [
                {
                    label: 'Home',
                    disabled: false,
                    onClick: this.handleHomeButtonClick                                      
                  },
                  {
                    label: '-'
                  },
                  {
                    label: 'Open',
                    disabled: false,
                    onClick: this.handleOpenProjectButtonClick
                  },
                  {
                    label: '-'
                  },
                  {
                    label: 'Exit',
                    disabled: false,
                    onClick: this.handleExitButtonClick
                  }
              ]
            }
          ]}
        />
        {/* <ButtonsPanel /> */}
        <AFramePanel />
        <SlidesPanel isEditing={false} />
        {/* <TimelinePanel /> */}
        {/* <InfoPanel /> */}
      </div>
    );
  }
}

export default withSceneContext(withRouter(PresenterPage));
