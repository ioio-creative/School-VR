import React, {Component} from 'react';
// import SystemPanel from 'containers/aframeEditor/homePage/systemPanel';
import {withRouter, Prompt} from 'react-router-dom';

import {withSceneContext, SceneContextProvider} from 'globals/contexts/sceneContext';
import {LanguageContextConsumer, LanguageContextMessagesConsumer} from 'globals/contexts/locale/languageContext';
import {languages} from 'globals/config';

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
import fileHelper from 'utils/fileHelper/fileHelper';
import PreviewPanel from 'containers/aframeEditor/homePage/previewPanel';
const Events = require('vendor/Events.js');
//const uuid = require('uuid/v1');

// const jsonSchemaValidator = require('jsonschema').Validator;
// const validator = new jsonSchemaValidator();
// const schema = require('schema/aframe_schema_20181108.json');


function EditorPageMenu(props) {
  const {
    sceneContext,

    messages,
    changeLanguageFuncs,

    handleHomeButtonClick,
    handleNewProjectButtonClick,
    handleOpenProjectButtonClick,
    handleSaveProjectButtonClick,
    handleSaveAsProjectButtonClick,
    handleExitButtonClick,
    handleUndoButtonClick,
    handleRedoButtonClick
  } = props;

  function handleBtnEnglishClick() {
    changeLanguageFuncs[languages.english.code]();
  }

  function handleBtnTraditionalChineseClick() {
    changeLanguageFuncs[languages.traditionalChinese.code]();
  } 

  const menuButtons = [
    {
      label: messages["Menu.FileLabel"],
      // onClick: _=> { console.log('file') },
      children: [
        {
          label: messages["Menu.File.HomeLabel"],
          disabled: false,
          onClick: handleHomeButtonClick                                      
        },
        {
          label: '-'
        },
        {
          label: messages["Menu.File.NewLabel"],
          disabled: false,
          onClick: handleNewProjectButtonClick
        },
        {
          label: '-'
        },
        {
          label: messages["Menu.File.OpenLabel"],
          disabled: false,
          onClick: handleOpenProjectButtonClick
        },
        {
          label: messages["Menu.File.SaveLabel"],
          disabled: false,
          onClick: handleSaveProjectButtonClick
        },
        {
          label: messages["Menu.File.SaveAsLabel"],
          disabled: false,
          onClick: handleSaveAsProjectButtonClick
        },
        {
          label: '-'
        },
        {
          label: messages["Menu.File.ExitLabel"],
          disabled: false,
          onClick: handleExitButtonClick
        }
      ]
    }
  ];
  if (sceneContext.editor && sceneContext.editor.opened) {
    menuButtons.push({
      label: messages["Menu.EditLabel"],
      children: [
        {
          label: messages["Menu.Edit.UndoLabel"],
          disabled: !sceneContext.getUndoQueueLength(),
          onClick: handleUndoButtonClick
        },
        {
          label: messages["Menu.Edit.RedoLabel"],
          disabled: !sceneContext.getRedoQueueLength(),
          onClick: handleRedoButtonClick
        }
      ]
    });
  }
  menuButtons.push(
    {
      label: messages["Menu.LanguageLabel"],
      children: [
        {
          label: messages["Menu.Language.English"],
          onClick: handleBtnEnglishClick
        },
        {
          label: messages["Menu.Language.TraditionalChinese"],
          onClick: handleBtnTraditionalChineseClick
        }
      ]
    }
  );
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
      loadedProjectFilePath: ''
    };

    // bind methods    
    [
      'newProject',
      'loadProject',
      'saveProject',
      'saveProjectAs',

      'handleHomeButtonClick',
      'handleNewProjectButtonClick',
      'handleOpenProjectButtonClick',
      'handleSaveProjectButtonClick',
      'handleSaveAsProjectButtonClick',
      'handleExitButtonClick',
      'handleUndoButtonClick',
      'handleRedoButtonClick',
      'onEditorLoad'
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

  onEditorLoad(editor) {
    // load project
    const searchObj = getSearchObjectFromHistory(this.props.history);
    const projectFilePathToLoad = getProjectFilePathFromSearchObject(searchObj);

    console.log("project path to load:", projectFilePathToLoad);

    if (!projectFilePathToLoad) {
      this.newProject();
    } else {
      this.loadProject(projectFilePathToLoad);      
    }    
  }

  newProject() {
    //console.log('new');
                    
    // test open file with user defined extension
    // const fileDialog = document.createElement('input');
    // fileDialog.type = 'file';
    // fileDialog.multiple = true;
    // fileDialog.accept = ['image/x-png','image/gif'];
    // fileDialog.click();
    
    this.setState({
      loadedProjectFilePath: ''
    });

    this.props.sceneContext.newProject();
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
    let {entitiesList, assetsList} = sceneContext.saveProject();    
    //const projectName = fileHelper.getFileNameWithoutExtension(projectFilePath);
    //console.log(projectName, entitiesList, assetsList);
    // TODO:
    //entitiesList.projectName = projectName;    
    ipcHelper.saveProject(projectFilePath, entitiesList, assetsList, (err) => {
      if (err) {
        handleErrorWithUiDefault(err);
        return;
      }

      const state = this.state;

      if (state.loadedProjectFilePath !== projectFilePath) {  // save as case
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

        const projectName = fileHelper.getFileNameWithoutExtension(projectFilePath);
        sceneContext.setProjectName(projectName);
      }
      
      const projectName = fileHelper.getFileNameWithoutExtension(projectFilePath);
      alert(`Project ${projectName} saved!`);
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
    ipcHelper.isCurrentLoadedProject(this.state.loadedProjectFilePath, (err, data) => {
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
    });    
  }
  
  handleSaveAsProjectButtonClick(event) {
    this.saveProjectAs();
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
    const state = this.state;
    const sceneContext = props.sceneContext;
    
    return (
      // <SceneContextProvider>
        <div id="editor" className={sceneContext.editor && sceneContext.editor.opened? 'editing': 'viewing'}>
          <LanguageContextConsumer render={
            ({ language, messages }) => (
              <Prompt
                when={true}
                message={messages['Prompt.UnsavedWorkMessage']}
              />
            )
          } />          
          {/* <SystemPanel projectName={this.projectName} /> */}
          <LanguageContextConsumer render={
            ({ messages, changeLanguageFuncs }) => (
               <EditorPageMenu
                sceneContext={sceneContext}

                messages={messages}
                changeLanguageFuncs={changeLanguageFuncs}

                handleHomeButtonClick={this.handleHomeButtonClick}
                handleNewProjectButtonClick={this.handleNewProjectButtonClick}
                handleOpenProjectButtonClick={this.handleOpenProjectButtonClick}
                handleSaveProjectButtonClick={this.handleSaveProjectButtonClick}
                handleSaveAsProjectButtonClick={this.handleSaveAsProjectButtonClick}
                handleExitButtonClick={this.handleExitButtonClick}
                handleUndoButtonClick={this.handleUndoButtonClick}
                handleRedoButtonClick={this.handleRedoButtonClick}
              />
            )
          } />         
          <ButtonsPanel currentLoadedProjectPath={state.loadedProjectFilePath} />
          <AFramePanel user-mode="editor" />
          <SlidesPanel isEditing={sceneContext.editor && sceneContext.editor.opened} />
          <TimelinePanel />
          <InfoPanel />
          <PreviewPanel />
        </div>
      // </SceneContextProvider>
    );
  }
}


export default withSceneContext(withRouter(EditorPage));