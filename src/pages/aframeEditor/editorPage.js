import React, { Component } from 'react';
// import SystemPanel from 'containers/aframeEditor/homePage/systemPanel';
import { withRouter, Prompt } from 'react-router-dom';

import saveAs from 'utils/fileSaver/saveAs';
import { formatDateTimeForFileName } from 'utils/dateTime/formatDateTime';

import {
  withSceneContext,
  capture360OutputResolutionTypes
} from 'globals/contexts/sceneContext';
import {
  LanguageContextConsumer,
  getLocalizedMessage
} from 'globals/contexts/locale/languageContext';
import config from 'globals/config';

import MenuComponent from 'components/menuComponent';
import DefaultLoading from 'components/loading/defaultLoading';

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
// import {addEntityAutoType} from 'utils/aframeEditor/aFrameEntities';
// import {roundTo, jsonCopy} from 'utils/aframeEditor/helperfunctions';
// import {TweenMax, TimelineMax, Linear} from 'gsap';

import isNonEmptyArray from 'utils/variableType/isNonEmptyArray';
import dataUrlToBlob from 'utils/blobs/dataUrlToBlob';

import handleErrorWithUiDefault from 'utils/errorHandling/handleErrorWithUiDefault';
import ipcHelper from 'utils/ipc/ipcHelper';

import { getSearchObjectFromHistory } from 'utils/queryString/getSearchObject';
import getProjectFilePathFromSearchObject from 'utils/queryString/getProjectFilePathFromSearchObject';

import './editorPage.css';
import fileHelper from 'utils/fileHelper/fileHelper';
import PreviewPanel from 'containers/aframeEditor/homePage/previewPanel';

const Events = require('vendor/Events.js');
const uuid = require('uuid/v1');

// const jsonSchemaValidator = require('jsonschema').Validator;
// const validator = new jsonSchemaValidator();
// const schema = require('schema/aframe_schema_20181108.json');

function EditorPageMenu(props) {
  const {
    sceneContext,

    handleNewProjectButtonClick,
    handleOpenProjectButtonClick,
    handleSaveProjectButtonClick,
    handleSaveAsProjectButtonClick,
    handleUndoButtonClick,
    handleRedoButtonClick,

    handleCaptureNormalImageClick,
    handleCapture360_2kImageClick,
    handleCapture360_4kImageClick,
    handleCapture360_2kVideoClick,
    handleCapture360_4kVideoClick
  } = props;

  const isEditorOpened = sceneContext.getIsEditorOpened();

  const menuButtons = [
    {
      labelId: 'Menu.FileLabel',
      // onClick: _=> { console.log('file') },
      children: [
        {
          labelId: 'Menu.File.HomeLabel',
          disabled: false,
          methodNameToInvoke: 'goToHomePage'
        },
        {
          labelId: '-'
        },
        {
          labelId: 'Menu.File.NewLabel',
          disabled: false,
          onClick: handleNewProjectButtonClick
        },
        {
          labelId: '-'
        },
        {
          labelId: 'Menu.File.OpenLabel',
          disabled: false,
          onClick: handleOpenProjectButtonClick
        },
        {
          labelId: 'Menu.File.SaveLabel',
          disabled: false,
          onClick: handleSaveProjectButtonClick
        },
        {
          labelId: 'Menu.File.SaveAsLabel',
          disabled: false,
          onClick: handleSaveAsProjectButtonClick
        },
        {
          labelId: '-'
        },
        {
          labelId: 'Menu.File.ExitLabel',
          disabled: false,
          methodNameToInvoke: 'closeApp'
        }
      ]
    }
  ];

  if (isEditorOpened) {
    menuButtons.push({
      labelId: 'Menu.EditLabel',
      children: [
        {
          labelId: 'Menu.Edit.UndoLabel',
          disabled: !sceneContext.getUndoQueueLength(),
          onClick: handleUndoButtonClick
        },
        {
          labelId: 'Menu.Edit.RedoLabel',
          disabled: !sceneContext.getRedoQueueLength(),
          onClick: handleRedoButtonClick
        }
      ]
    });
  }

  if (isEditorOpened) {
    menuButtons.push({
      labelId: 'Menu.CaptureImageLabel',
      children: [
        {
          labelId: 'Menu.CaptureImage.Normal',
          onClick: handleCaptureNormalImageClick
        },
        {
          labelId: 'Menu.CaptureImage.360_2k',
          onClick: handleCapture360_2kImageClick
        },
        {
          labelId: 'Menu.CaptureImage.360_4k',
          onClick: handleCapture360_4kImageClick
        }
      ]
    });

    menuButtons.push({
      labelId: 'Menu.CaptureVideoLabel',
      children: [
        {
          labelId: 'Menu.CaptureVideo.360_2k',
          onClick: handleCapture360_2kVideoClick
        }
        // {
        //   labelId: "Menu.CaptureVideo.360_4k",
        //   onClick: handleCapture360_4kVideoClick
        // }
      ]
    });
  }
  return (
    <MenuComponent
      // projectName="Untitled_1"
      menuButtons={menuButtons}
    />
  );
}

class EditorPage extends Component {
  constructor(props) {
    super(props);

    // variables
    this.inited = false;

    // state
    this.state = {
      entitiesList: [],
      loadedProjectFilePath: '',
      isLoading: false
    };

    // bind methods
    [
      'setLoading',
      'unsetLoading',
      'confirmLeaveProject',
      'onEditorLoad',
      'newProject',
      'loadProject',
      'saveProject',
      'saveProjectAs',
      'capture360Image',
      'capture360Video',

      'handleNewProjectButtonClick',
      'handleOpenProjectButtonClick',
      'handleSaveProjectButtonClick',
      'handleSaveAsProjectButtonClick',
      'handleUndoButtonClick',
      'handleRedoButtonClick',

      'handleCaptureNormalImageClick',
      'handleCapture360_2kImageClick',
      'handleCapture360_4kImageClick',
      'handleCapture360_2kVideoClick',
      'handleCapture360_4kVideoClick'
    ].forEach(methodName => {
      this[methodName] = this[methodName].bind(this);
    });
  }

  /* react lifecycles */

  componentDidMount() {
    Events.on('editor-load', this.onEditorLoad);
    this.editor = new Editor();
    this.inited = true;
    //
    // window.onbeforeunload = function() {
    //   return 'hello?';
    // };
  }

  componentWillUnmount() {
    const sceneContext = this.props.sceneContext;
    sceneContext.setProjectName('');
    Events.removeListener('editor-load', this.onEditorLoad);
    this.editor = null;
  }

  /* end of react lifecycles */

  /* methods */

  setLoading() {
    this.setState({
      isLoading: true
    });
  }

  unsetLoading() {
    this.setState({
      isLoading: false
    });
  }

  confirmLeaveProject() {
    const { sceneContext } = this.props;
    return (
      sceneContext.isProjectSaved ||
      window.confirm(getLocalizedMessage('Prompt.UnsavedWorkMessage'))
    );
  }

  onEditorLoad(editor) {
    // load project
    const searchObj = getSearchObjectFromHistory(this.props.history);
    const projectFilePathToLoad = getProjectFilePathFromSearchObject(searchObj);

    console.log('project path to load:', projectFilePathToLoad);

    if (!projectFilePathToLoad) {
      this.newProject();
    } else {
      this.loadProject(projectFilePathToLoad);
    }
  }

  newProject() {
    // test open file with user defined extension
    // const fileDialog = document.createElement('input');
    // fileDialog.type = 'file';
    // fileDialog.multiple = true;
    // fileDialog.accept = ['image/x-png','image/gif'];
    // fileDialog.click();

    const { sceneContext } = this.props;

    this.setState({
      loadedProjectFilePath: ''
    });

    sceneContext.newProject();
  }

  loadProject(projectFilePath) {
    ipcHelper.loadProjectByProjectFilePath(projectFilePath, (err, data) => {
      if (err) {
        handleErrorWithUiDefault(err);
        return;
      }
      this.setState({
        loadedProjectFilePath: projectFilePath
      });
      const projectJsonData = data.projectJson;
      //console.log(projectJsonData);
      this.props.sceneContext.loadProject(projectJsonData);
    });
  }

  saveProject(projectFilePath) {
    if (!projectFilePath) {
      return;
    }

    const sceneContext = this.props.sceneContext;
    let { entitiesList, assetsList } = sceneContext.saveProject();
    //const projectName = fileHelper.getFileNameWithoutExtension(projectFilePath);
    //console.log(projectName, entitiesList, assetsList);
    // TODO:
    //entitiesList.projectName = projectName;
    ipcHelper.saveProject(projectFilePath, entitiesList, assetsList, err => {
      if (err) {
        handleErrorWithUiDefault(err);
        return;
      }

      const { loadedProjectFilePath } = this.state;

      if (loadedProjectFilePath !== projectFilePath) {
        // save as case
        // TODO: is the following good enough?

        /**
         * !!!Important!!!:
         * we run setState({loadedProjectFilePath}) and sceneContext.setProjectName()
         * instead of loadProject() because loadProject takes time
         *
         * also using loadProject() would produce errors in sceneContext's addAsset() method,
         * which would not update assetsList items (src, etc.) if asset has same id
         */

        //this.loadProject(projectFilePath);

        this.setState({
          loadedProjectFilePath: projectFilePath
        });

        const projectName = fileHelper.getFileNameWithoutExtension(
          projectFilePath
        );
        sceneContext.setProjectName(projectName);
      }

      const projectName = fileHelper.getFileNameWithoutExtension(
        projectFilePath
      );
      alert(
        `${getLocalizedMessage('Alert.ProjectSavedMessage')}\n${projectName}`
      );
    });
  }

  saveProjectAs() {
    ipcHelper.saveSchoolVrFileDialog((err, data) => {
      if (err) {
        handleErrorWithUiDefault(err);
        return;
      }

      const filePath = data.filePath;
      this.saveProject(filePath);
    });
  }

  capture360Image(resolutionType) {
    this.setLoading();
    const imgBase64Str = this.props.sceneContext.captureEquirectangularImage(
      resolutionType
    );
    ipcHelper.saveRaw360Capture(imgBase64Str, (err, data) => {
      this.unsetLoading();
      if (err) {
        handleErrorWithUiDefault(err);
        return;
      }
      if (data && data.filePath) {
        alert(
          `${getLocalizedMessage('Alert.CaptureSavedMessage')}\n${
            data.filePath
          }`
        );
      }
    });
  }

  capture360Video(resolutionType, fps) {
    const vidoeUuid = uuid();
    this.props.sceneContext.captureEquirectangularVideo(
      resolutionType,
      fps,
      (currentFrame, totalFrame, imgBase64Str) => {
        ipcHelper.saveRaw360CaptureForVideo(
          vidoeUuid,
          fps,
          currentFrame,
          totalFrame,
          imgBase64Str,
          (err, data) => {
            if (err) {
              handleErrorWithUiDefault(err);
              return;
            }
            if (data && data.filePath) {
              // last frame
              if (currentFrame === totalFrame) {
                alert(
                  `${getLocalizedMessage('Alert.CaptureSavedMessage')}\n${
                    data.filePath
                  }`
                );
              }
            }
          }
        );
      },
      config.capture360VideoRenderFrameIntervalInMillis
    );
  }

  /* end of methods */

  /* event handlers */

  handleNewProjectButtonClick(event) {
    if (this.confirmLeaveProject()) {
      this.newProject();
    }
  }

  handleOpenProjectButtonClick(event) {
    if (this.confirmLeaveProject()) {
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
  }

  handleSaveProjectButtonClick(event) {
    ipcHelper.isCurrentLoadedProject(
      this.state.loadedProjectFilePath,
      (err, data) => {
        if (err) {
          handleErrorWithUiDefault(err);
          return;
        }

        const isCurrentLoadedProject = data.isCurrentLoadedProject;
        if (isCurrentLoadedProject) {
          this.saveProject(this.state.loadedProjectFilePath);
        } else {
          this.saveProjectAs();
        }
      }
    );
  }

  handleSaveAsProjectButtonClick(event) {
    this.saveProjectAs();
  }

  handleUndoButtonClick(event) {
    this.props.sceneContext.undo();
  }

  handleRedoButtonClick(event) {
    this.props.sceneContext.redo();
  }

  handleCaptureNormalImageClick(event) {
    const snapshotDataUrl = this.props.sceneContext.takeSnapshot();
    const snapshotBlob = dataUrlToBlob(snapshotDataUrl);
    saveAs(
      snapshotBlob,
      `snapShot_${formatDateTimeForFileName(Date.now())}${
        config.captured360ImageExtension
      }`
    );
  }

  handleCapture360_2kImageClick(event) {
    this.capture360Image(capture360OutputResolutionTypes['2k']);
  }

  handleCapture360_4kImageClick(event) {
    this.capture360Image(capture360OutputResolutionTypes['4k']);
  }

  handleCapture360_2kVideoClick(event) {
    this.capture360Video(
      capture360OutputResolutionTypes['2k'],
      config.captured360VideoFps
    );
  }

  handleCapture360_4kVideoClick(event) {
    this.capture360Video(
      capture360OutputResolutionTypes['4k'],
      config.captured360VideoFps
    );
  }

  /* end of event handlers */

  render() {
    const { sceneContext } = this.props;
    const { loadedProjectFilePath, isLoading } = this.state;

    //console.log('sceneContext.isProjectSaved:', sceneContext.isProjectSaved);

    return (
      // <SceneContextProvider>
      <div
        id='editor'
        className={
          sceneContext.editor && sceneContext.editor.opened
            ? 'editing'
            : 'viewing'
        }
      >
        <div
          className={`${isLoading ? 'show' : 'hide'} editor-loading-container`}
        >
          <DefaultLoading />
        </div>
        <div className={`${isLoading ? 'hide' : 'show'}`}>
          <LanguageContextConsumer
            render={({ messages }) => (
              <Prompt
                when={!sceneContext.isProjectSaved}
                message={messages['Prompt.UnsavedWorkMessage']}
              />
            )}
          />
          {/* <SystemPanel projectName={this.projectName} /> */}
          <EditorPageMenu
            sceneContext={sceneContext}
            handleNewProjectButtonClick={this.handleNewProjectButtonClick}
            handleOpenProjectButtonClick={this.handleOpenProjectButtonClick}
            handleSaveProjectButtonClick={this.handleSaveProjectButtonClick}
            handleSaveAsProjectButtonClick={this.handleSaveAsProjectButtonClick}
            handleUndoButtonClick={this.handleUndoButtonClick}
            handleRedoButtonClick={this.handleRedoButtonClick}
            handleCaptureNormalImageClick={this.handleCaptureNormalImageClick}
            handleCapture360_2kImageClick={this.handleCapture360_2kImageClick}
            handleCapture360_4kImageClick={this.handleCapture360_4kImageClick}
            handleCapture360_2kVideoClick={this.handleCapture360_2kVideoClick}
            handleCapture360_4kVideoClick={this.handleCapture360_4kVideoClick}
          />
          <ButtonsPanel currentLoadedProjectPath={loadedProjectFilePath} />
          <AFramePanel user-mode='editor' />
          <SlidesPanel
            isEditing={sceneContext.editor && sceneContext.editor.opened}
          />
          <TimelinePanel />
          <InfoPanel />
          <PreviewPanel />
        </div>
      </div>
      // </SceneContextProvider>
    );
  }
}

export default withSceneContext(withRouter(EditorPage));
