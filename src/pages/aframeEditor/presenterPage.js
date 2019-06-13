import React, {Component} from 'react';
// import SystemPanel from 'containers/aframeEditor/homePage/systemPanel';
import {withRouter, Link} from 'react-router-dom';

import {withSceneContext} from 'globals/contexts/sceneContext';

import MenuComponent from 'components/menuComponent';
import Mousetrap from 'mousetrap';

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
import {jsonCopy} from "globals/helperfunctions";
import routes from 'globals/routes';

import getSearchObjectFromHistory from 'utils/queryString/getSearchObjectFromHistory';
import getProjectFilePathFromSearchObject from 'utils/queryString/getProjectFilePathFromSearchObject';

import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';

import './presenterPage.css';
const Events = require('vendor/Events.js');
const uuid = require('uuid/v1');

// const jsonSchemaValidator = require('jsonschema').Validator;
// const validator = new jsonSchemaValidator();
// const schema = require('schema/aframe_schema_20181108.json');


class PresenterPage extends Component {
  constructor(props) {
    super(props);
    
    this.state = {
      socket: null,
      localIps: [],
      viewerCount: 0,
      loadedProjectFilePath: ''
    };
    
    [
      'onEditorLoad',
      'handleHomeButtonClick',
      'handleOpenProjectButtonClick',
      'handleExitButtonClick',

      'loadProject',
      'getNewSceneDataWithAssetsListChangedToUsingRelativePaths',
    ].forEach(methodName => {
      this[methodName] = this[methodName].bind(this);
    });    
  }


  /* react lifecycles */

  componentDidMount() {
    const props = this.props;
    const sceneContext = props.sceneContext;
    this.editor = new Editor();
    Events.on('editor-load', this.onEditorLoad)
    sceneContext.updateEditor(this.editor);    
    
    ipcHelper.getPresentationServerInfo((err, data) => {
      if (err) {
        handleErrorWithUiDefault(err);
        return;
      }

      const presentationServerPort = data.port;
      // get the ip and port from ipc
      // const socket = io(window.location.origin);
      const presentationUrl = `http://localhost:${presentationServerPort}`;
      const socket = io(presentationUrl);
      socket.on('connect', () => {
        console.log('connected!!!'); // socket.connected); // true
        // ipcHelper.shellOpenExternal(presentationUrl);
        socket.emit('registerPresenter');
      });
      socket.on('serverMsg', (msg) => {
        console.log('message from server: ', msg);
      })
      socket.on('updateViewerCount', (count) => {
        this.setState({
          viewerCount: count
        })
      })
      // document.addEventListener('dblclick', this.sendMessage);
      const interfaceIpArr = Object.keys(data.interfaceIpMap).map(interfaceName => {
        return {
          interface: interfaceName,
          ip: data.interfaceIpMap[interfaceName]
        }
      });      
      this.setState({
        localIps: interfaceIpArr,
        port: presentationServerPort,
        socket: socket
      });
    });
    
    Mousetrap.bind('left', (e) => {
      e.preventDefault();
      // get current slide
      const slidesList = sceneContext.getSlidesList();
      const currentSlide = sceneContext.getCurrentSlideId();
      const currentSlideIdx = slidesList.findIndex(slide => slide.id === currentSlide);
      const prevSlide = (currentSlideIdx < 1? null: slidesList[currentSlideIdx - 1]['id']);
      const socket = this.state.socket;
      if (prevSlide) {
        sceneContext.selectSlide(prevSlide);
        if (socket) {
          socket.emit('updateSceneStatus', {
            action: 'selectSlide',
            details: {
              slideId: prevSlide
            }
          })
        }
      }
      return false;
    })
    Mousetrap.bind('right', (e) => {
      e.preventDefault();
      const slidesList = sceneContext.getSlidesList();
      const currentSlide = sceneContext.getCurrentSlideId();
      const currentSlideIdx = slidesList.findIndex(slide => slide.id === currentSlide);
      const nextSlide = (currentSlideIdx > slidesList.length - 2? null: slidesList[currentSlideIdx + 1]['id']);
      const socket = this.state.socket;
      if (nextSlide) {
        sceneContext.selectSlide(nextSlide);
        if (socket) {
          socket.emit('updateSceneStatus', {
            action: 'selectSlide',
            details: {
              slideId: nextSlide
            }
          })
        }
      }
      return false;
    })
  }

  componentWillUnmount() {
    this.editor = null;
    // ipcHelper.closeWebServer((err) => {    
    //   if (err) {
    //     handleErrorWithUiDefault(err);
    //     return;
    //   }      
    // });
    
    const sceneContext = this.props.sceneContext;
    sceneContext.setProjectName('');
    Events.removeListener('editor-load', this.onEditorLoad)
  }

  /* end of react lifecycles */


  /* event handlers */

  onEditorLoad(editor) {
    const props = this.props;

    editor.close();

    // load project
    const searchObj = getSearchObjectFromHistory(props.history);
    const projectFilePathToLoad = getProjectFilePathFromSearchObject(searchObj);

    console.log("project path to load: " + projectFilePathToLoad);

    if (projectFilePathToLoad) {
      this.loadProject(projectFilePathToLoad);
    }
  }

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

  /* end of event handlers */


  /* methods */

  loadProject(projectFilePath) {
    const state = this.state;
    const sceneContext = this.props.sceneContext;    
  
    this.setState({
      loadedProjectFilePath: projectFilePath
    });
    
    ipcHelper.openWebServerAndLoadProject(projectFilePath, (err, data) => {
      // ipcHelper.loadProjectByProjectFilePath(projectFilePath, (err, data) => {
      if (err) {
        handleErrorWithUiDefault(err);
        return;                         
      }      
      
      const projectJsonData = data.projectJson;      
      //console.log(projectJsonData);

      // send a copy to server
      if (state.socket) {
        // for the following projectJsonData, the assetsList's paths all are changed to web server relative path
        const newProjectJsonData = this.getNewSceneDataWithAssetsListChangedToUsingRelativePaths(projectJsonData);        
        state.socket.emit('useSceneData', newProjectJsonData);
      }
      sceneContext.loadProject(projectJsonData);   
    });
  }

  // TODO: poorly written (too many cross-references to ProjectFile class)
  // for web server presentation, use asset's relativeSrc to replace src
  getNewSceneDataWithAssetsListChangedToUsingRelativePaths(sceneData) {
    const projectJson = jsonCopy(sceneData);           
    const assetsList = projectJson.assetsList;
    assetsList.forEach(asset => {
      asset.src = asset.relativeSrc;
    });
    return projectJson;
  }

  // disableEditor(editor) {
  //   editor.close();
  // }  

  // sendMessage(msg) {
  //   this.state.socket.emit('test', 'hello');
  // }

  /* end of methods */


  render() {
    const state = this.state;
    const sceneContext = this.props.sceneContext;
    const localIps = state.localIps;
    const port = state.port;
    const viewerCount = state.viewerCount;
    const slidesList = sceneContext.getSlidesList();
    const currentSlide = sceneContext.getCurrentSlideId();
    const currentSlideIdx = slidesList.findIndex(slide => slide.id === currentSlide);
    const prevSlide = (currentSlideIdx < 1? null: slidesList[currentSlideIdx - 1]['id']);
    const nextSlide = (currentSlideIdx > slidesList.length - 2? null: slidesList[currentSlideIdx + 1]['id']);
    // for exit button
    // const searchObj = getSearchObjectFromHistory(this.props.history);
    const projectFilePathToLoad = state.loadedProjectFilePath;
    //console.log(projectFilePathToLoad);
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
        <AFramePanel disableVR={true}/>
        <SlidesPanel isEditing={false} socket={state.socket} />
        {/* <TimelinePanel /> */}
        {/* <InfoPanel /> */}
        <div className="interfaceIp-panel">
          {localIps.map(localIp => {
            return <div className="interfaceIp-data" key={localIp.ip}>
              <div className="interface">{localIp.interface}</div>
              <div className="ip">{localIp.ip}:{port}</div>
            </div>;
          })}
        </div>
        <div className="viewerCount-panel">{viewerCount}</div>
        <div className="slideFunctions-panel">
          <div className="buttons-group">
            <div className={`button-prevSlide${currentSlideIdx === 0? ' disabled': ''}`}
              onClick={() => {
                if (prevSlide) {
                  sceneContext.selectSlide(prevSlide);
                  if (state.socket) {
                    state.socket.emit('updateSceneStatus', {
                      action: 'selectSlide',
                      details: {
                        slideId: prevSlide,
                        autoPlay: false
                      }
                    })
                  }
                }
              }}
            >
              <FontAwesomeIcon icon="angle-left"/>
            </div>
            <div className="button-playSlide"
              onClick={() => {
                sceneContext.playSlide();
                if (state.socket) {
                  state.socket.emit('updateSceneStatus', {
                    action: 'playSlide'
                  })
                }
              }}
            >
              <FontAwesomeIcon icon="play"/>              
            </div>
            <div className={`button-nextSlide${currentSlideIdx === slidesList.length - 1? ' disabled': ''}`} onClick={() => {
                if (nextSlide) {
                  sceneContext.selectSlide(nextSlide);
                  if (state.socket) {
                    state.socket.emit('updateSceneStatus', {
                      action: 'selectSlide',
                      details: {
                        slideId: nextSlide,
                        autoPlay: false
                      }
                    })
                  }
                }
              }}>
              <FontAwesomeIcon icon="angle-right"/>            
            </div>
          </div>
          <div className="buttons-group">
            <select value={currentSlide}
              onChange={e => {
                sceneContext.selectSlide(e.currentTarget.value);
                if (state.socket) {
                  state.socket.emit('updateSceneStatus', {
                    action: 'selectSlide',
                    details: {
                      slideId: e.currentTarget.value,
                      autoPlay: false
                    }
                  })
                }
              }}
            >
              {
                slidesList.map((slide, idx) => {
                  return <option key={slide.id} value={slide.id}>Slide {idx + 1}</option>
                })
              }
            </select>
          </div>
          <div className="buttons-group">
            <Link to={routes.editorWithProjectFilePathQuery(projectFilePathToLoad)}>Exit</Link>
          </div>
        </div>
      </div>
    );
  }
}

export default withSceneContext(withRouter(PresenterPage));