import React, {Component} from 'react';
// import SystemPanel from 'containers/aframeEditor/homePage/systemPanel';
import {withRouter, Prompt} from 'react-router-dom';

import {withSceneContext, SceneContextProvider} from 'globals/contexts/sceneContext';

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
import {addEntityAutoType} from 'utils/aframeEditor/aFrameEntities';
import {roundTo, jsonCopy} from 'utils/aframeEditor/helperfunctions';
import {TweenMax, TimelineMax, Linear} from 'gsap';

import isStrAnInt from 'utils/number/isStrAnInt';
import stricterParseInt from 'utils/number/stricterParseInt';
import isNonEmptyArray from 'utils/variableType/isNonEmptyArray';

import handleErrorWithUiDefault from 'utils/errorHandling/handleErrorWithUiDefault';
import ipcHelper from 'utils/ipc/ipcHelper';

import routes from 'globals/routes';

import getSearchObjectFromHistory from 'utils/queryString/getSearchObjectFromHistory';
import getProjectFilePathFromSearchObject from 'utils/queryString/getProjectFilePathFromSearchObject';

import './editorPage.css';
const Events = require('vendor/Events.js');
const uuid = require('uuid/v1');

// const jsonSchemaValidator = require('jsonschema').Validator;
// const validator = new jsonSchemaValidator();
// const schema = require('schema/aframe_schema_20181108.json');

class EditorPage extends Component {
  constructor(props) {
    super(props);
    this.inited = false;
    this.state = {
      entitiesList: []
    };

    // bind methods
    this.newProject = this.newProject.bind(this);
    this.loadProject = this.loadProject.bind(this);
    
    // bind event handlers
    this.handleHomeButtonClick = this.handleHomeButtonClick.bind(this);
    this.handleNewProjectButtonClick = this.handleNewProjectButtonClick.bind(this);
    this.handleOpenProjectButtonClick = this.handleOpenProjectButtonClick.bind(this);
    this.handleSaveProjectButtonClick = this.handleSaveProjectButtonClick.bind(this);
    this.handleExitButtonClick = this.handleExitButtonClick.bind(this);      
    this.handleUndoButtonClick = this.handleUndoButtonClick.bind(this);
    this.handleRedoButtonClick = this.handleRedoButtonClick.bind(this);      
  }


  /* react lifecycles */

  componentDidMount() {
    this.editor = new Editor();
    this.inited = true;
    // 
    // window.onbeforeunload = function() {
    //   return 'hello?';
    // };
    Events.on('editor-load', (editor) => {
      if (this.props.match.params.projectId === undefined) {
        this.newProject();
      } else {
        // load project
        const searchObj = getSearchObjectFromHistory(this.props.history);
        const projectFilePathToLoad = getProjectFilePathFromSearchObject(searchObj);
  
        //console.log("project path to load: " + projectFilePathToLoad);
  
        if (!projectFilePathToLoad) {
          return;
        }
        
        this.loadProject(projectFilePathToLoad);
      }
    })
  }

  componentWillUnmount() {
    this.editor = null;
  }

  /* end of react lifecycles */

  
  /* methods */

  newProject() {
    //console.log('new');
                    
    // test open file with user defined extension
    // const fileDialog = document.createElement('input');
    // fileDialog.type = 'file';
    // fileDialog.multiple = true;
    // fileDialog.accept = ['image/x-png','image/gif'];
    // fileDialog.click();

    this.props.sceneContext.newProject();
  }

  loadProject(projectFilePath) {
    ipcHelper.loadProjectByProjectFilePath(projectFilePath, (err, data) => {
      if (err) {
        handleErrorWithUiDefault(err);
        return;                         
      }
      
      const projectJsonData = data.projectJson;
      console.log(projectJsonData);
      this.props.sceneContext.loadProject(projectJsonData);   
    });
  }

  /* end of methods */


  /* event handlers */

  handleHomeButtonClick(event) {
    this.props.history.push(routes.home);
  }

  handleNewProjectButtonClick(event) {
    this.newProject();             
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
  
  handleSaveProjectButtonClick(event) {
    const sceneContext = this.props.sceneContext;
    const {projectName, entitiesList, assetsList} = sceneContext.saveProject();
    console.log(projectName, entitiesList, assetsList);
    ipcHelper.saveProject(projectName, entitiesList, assetsList, (err) => {
      if (err) {
        handleErrorWithUiDefault(err);
      }
    });
  }

  handleExitButtonClick(event) {
    ipcHelper.closeWindow();
  }

  handleUndoButtonClick(event) {
    this.props.sceneContext.undo();
  }

  handleRedoButtonClick(event) {
    this.props.sceneContext.redo();
  }

  /* end of event handlers */


  render() {
    const props = this.props;
    //const state = this.state;
    const sceneContext = this.props.sceneContext;
    // if (!sceneContext) {
    //   console.log('no context');
    //   return null;
    // } else {
    //   console.log('context');

    // }
    return (
      // <SceneContextProvider>
        <div id="editor">
          <Prompt
            when={true}
            message='You have unsaved changes, are you sure you want to leave?'
          />
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
                    label: 'New',
                    disabled: false,
                    onClick: this.handleNewButtonClick
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
                    label: 'Save',
                    disabled: false,
                    onClick: this.handleSaveProjectButtonClick
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
              }, 
              {
                label: 'Edit',
                children: [
                  {
                    label: 'Undo',
                    disabled: !sceneContext.getUndoQueueLength(),
                    onClick: this.handleUndoButtonClick
                  },
                  {
                    label: 'Redo',
                    disabled: !sceneContext.getRedoQueueLength(),
                    onClick: this.handleRedoButtonClick
                  }
                ]
              }, 
              {
                label: 'Disabled',
                disabled: true,
                children: [
                  {
                    label: 'Undo',
                    disabled: true,
                  },
                  {
                    label: 'Redo',
                    disabled: true,
                  }
                ]
              }
            ]}
          />
          <ButtonsPanel />
          <AFramePanel />
          <SlidesPanel />
          <TimelinePanel />
          <InfoPanel />
        </div>
      // </SceneContextProvider>
    );
  }
}

export default withSceneContext(withRouter(EditorPage));
