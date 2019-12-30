import React, {Component} from 'react';
// import SystemPanel from 'containers/aframeEditor/homePage/systemPanel';
import {withRouter, Link, Prompt} from 'react-router-dom';

import {withSceneContext} from 'globals/contexts/sceneContext';
import {LanguageContextConsumer, LanguageContextMessagesConsumer, getLocalizedMessage} from 'globals/contexts/locale/languageContext';
import {languages} from 'globals/config';

import MenuComponent from 'components/menuComponent';
import Mousetrap from 'mousetrap';

//import ButtonsPanel from 'containers/aframeEditor/homePage/buttonsPanel';
import AFramePanel from 'containers/aframeEditor/homePage/aFramePanel';
//import InfoPanel from 'containers/aframeEditor/homePage/infoPanel';
import SlidesPanel from 'containers/aframeEditor/homePage/slidesPanel';
//import TimelinePanel from 'containers/aframeEditor/homePage/timelinePanel';
// import AssetsPanel from 'containers/aframeEditor/homePage/assetsPanel';

import TwinklingContainer from 'components/twinklingContainer';
import PulsatingContainer from 'components/pulsatingContainer';

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
import config from 'globals/config';

import {getSearchObjectFromHistory} from 'utils/queryString/getSearchObject';
import getProjectFilePathFromSearchObject from 'utils/queryString/getProjectFilePathFromSearchObject';

import saveAs from 'utils/fileSaver/saveAs';

import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
//import iconViewer from 'media/icons/viewer.svg';

import './presenterPage.css';
const Events = require('vendor/Events.js');
//const uuid = require('uuid/v1');

// const jsonSchemaValidator = require('jsonschema').Validator;
// const validator = new jsonSchemaValidator();
// const schema = require('schema/aframe_schema_20181108.json');

function PresenterPageMenu(props) {
  const {
    messages,
    changeLanguagePromises,

    handleHomeButtonClick,
    handleOpenProjectButtonClick,
    handleExitButtonClick
  } = props;

  async function handleBtnEnglishClickPromise() {
    await changeLanguagePromises[languages.english.code]();
  }

  async function handleBtnTraditionalChineseClickPromise() {
    await changeLanguagePromises[languages.traditionalChinese.code]();
  }

  return (
    <MenuComponent
      // projectName="Untitled_1"
      menuButtons={[
        {
          label: messages['Menu.FileLabel'],
          // onClick: _=> { console.log('file') },
          children: [
            {
              label: messages['Menu.File.HomeLabel'],
              disabled: false,
              onClick: handleHomeButtonClick
            },
            {
              label: '-'
            },
            {
              label: messages['Menu.File.OpenLabel'],
              disabled: false,
              onClick: handleOpenProjectButtonClick
            },
            {
              label: '-'
            },
            {
              label: messages['Menu.File.ExitLabel'],
              disabled: false,
              onClick: handleExitButtonClick
            }
          ]
        },
        {
          label: messages["Menu.LanguageLabel"],
          children: [
            {
              label: messages["Menu.Language.English"],
              onClick: handleBtnEnglishClickPromise
            },
            {
              label: messages["Menu.Language.TraditionalChinese"],
              onClick: handleBtnTraditionalChineseClickPromise
            }
          ]
        }
      ]}
    />
  );
}

class PresenterPage extends Component {
  constructor(props) {
    super(props);

    // constants
    this.recordingTimerIntervalInMillis = 1000;

    this.state = {
      socket: null,
      localIps: [],
      viewerCount: 0,
      loadedProjectFilePath: '',
      showUi: true,

      isInRecording: false,

      recordingTimerInfo: null
    };

    [
      // event handlers
      'onEditorLoad',
      'handleRecordingTimerEvent',
      'handleButtonRecordSlideClick',
      'handleButtonPrevSlideClick',
      'handleButtonPlaySlideClick',
      'handleButtonNextSlideClick',

      // menu buttons
      'handleHomeButtonClick',
      'handleOpenProjectButtonClick',
      'handleExitButtonClick',      

      // methods
      'loadProject',
      'getNewSceneDataWithAssetsListChangedToUsingRelativePaths',
      'showUi',
      'hideUi',
      'saveRecording',
      'startRecording',
      'stopRecording',
    ].forEach(methodName => {
      this[methodName] = this[methodName].bind(this);
    });
    this.hideUiTimer = null;
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
      const { socket } = this.state;
      if (prevSlide) {
        sceneContext.selectSlide(prevSlide);
        if (socket) {
          socket.emit('updateSceneStatus', {
            action: 'selectSlide',
            details: {
              slideId: prevSlide
            }
          });
        }
      }
      return false;
    });

    Mousetrap.bind('right', (e) => {
      e.preventDefault();
      const slidesList = sceneContext.getSlidesList();
      const currentSlide = sceneContext.getCurrentSlideId();
      const currentSlideIdx = slidesList.findIndex(slide => slide.id === currentSlide);
      const nextSlide = (currentSlideIdx > slidesList.length - 2? null: slidesList[currentSlideIdx + 1]['id']);
      const { socket } = this.state;
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
    });

    this.hideUi();
  }

  componentWillUnmount() {
    this.editor = null;
    // ipcHelper.closeWebServer((err) => {
    //   if (err) {
    //     handleErrorWithUiDefault(err);
    //     return;
    //   }
    // });

    const { sceneContext } = this.props;
    sceneContext.setProjectName('');
    Events.removeListener('editor-load', this.onEditorLoad);

    this.stopRecording(false);
  }

  /* end of react lifecycles */


  /* event handlers */

  // event handlers

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

  handleRecordingTimerEvent(recordingTimerInfo) {
    this.setState({
      recordingTimerInfo: recordingTimerInfo
    });
  }
  handleButtonRecordSlideClick(event) {
    const { isInRecording } = this.state;

    if (!isInRecording) {
      this.startRecording();
    } else {
      this.stopRecording(true);
    }    
  }

  handleButtonPrevSlideClick(event) {   
    const { sceneContext } = this.props;
    const { socket } = this.state;
    const slidesList = sceneContext.getSlidesList();
    const currentSlide = sceneContext.getCurrentSlideId();    
    const currentSlideIdx = slidesList.findIndex(slide => slide.id === currentSlide);
    const prevSlide = (currentSlideIdx < 1? null: slidesList[currentSlideIdx - 1]['id']);
    if (prevSlide) {
      sceneContext.selectSlide(prevSlide);
      if (socket) {
        socket.emit('updateSceneStatus', {
          action: 'selectSlide',
          details: {
            slideId: prevSlide,
            autoPlay: false
          }
        })
      }
    }
  }

  handleButtonPlaySlideClick(event) {
    const { sceneContext } = this.props;
    const { socket } = this.state;
    sceneContext.playSlide();
    if (socket) {
      socket.emit('updateSceneStatus', {
        action: 'playSlide'
      });
    }
  }

  handleButtonNextSlideClick(event) {
    const { sceneContext } = this.props;
    const { socket } = this.state;
    const slidesList = sceneContext.getSlidesList();
    const currentSlide = sceneContext.getCurrentSlideId();    
    const currentSlideIdx = slidesList.findIndex(slide => slide.id === currentSlide);    
    const nextSlide = (currentSlideIdx > slidesList.length - 2? null: slidesList[currentSlideIdx + 1]['id']);
    if (nextSlide) {
      sceneContext.selectSlide(nextSlide);
      if (socket) {
        socket.emit('updateSceneStatus', {
          action: 'selectSlide',
          details: {
            slideId: nextSlide,
            autoPlay: false
          }
        })
      }
    }
  }

  // menu buttons

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
    const { socket } = this.state;
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
      if (socket) {
        // for the following projectJsonData, the assetsList's paths all are changed to web server relative path
        const newProjectJsonData = this.getNewSceneDataWithAssetsListChangedToUsingRelativePaths(projectJsonData);
        socket.emit('useSceneData', newProjectJsonData);
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

  showUi() {
    if (this.hideUiTimer) {
      clearTimeout(this.hideUiTimer);
    }
    this.setState({
      showUi: true
    })
  }

  hideUi() {
    if (this.hideUiTimer) {
      clearTimeout(this.hideUiTimer);
    }
    this.hideUiTimer = setTimeout(()=>{
      this.setState({
        showUi: false
      })
    }, 2500);
  }

  saveRecording(mediaObjToSave) {
    const tempMediaFileName = `sharingRecording-${Date.now()}${config.presentationRecordingVideoExtension}`;
    saveAs(mediaObjToSave, tempMediaFileName);
  }

  startRecording() {
    const { isInRecording } = this.state;
    if (!isInRecording) {
      const { sceneContext } = this.props;    
      const fps = config.presentationRecordingVideoFps;
      const handleRecordingErrorCallback = err => {
        console.error('mediaRecorder.onerror', err);
        alert('mediaRecorder.onerror', err);
      };
      sceneContext.startRecording(fps, this.recordingTimerIntervalInMillis, this.handleRecordingTimerEvent, handleRecordingErrorCallback);
      this.setState({
        isInRecording: true
      });
    }
  }

  stopRecording(isDownloadVideo) {
    const { isInRecording } = this.state;
    if (isInRecording) {
      const { sceneContext } = this.props;
      const videoOutputExtensionWithDot = config.presentationRecordingVideoExtension;    
      const handleRecordingAvailableCallback = isDownloadVideo ? this.saveRecording : null;  
      sceneContext.stopRecording(videoOutputExtensionWithDot, handleRecordingAvailableCallback);
      this.setState({
        isInRecording: false,
        recordingTimerInfo: null
      });
    }    
  }

  /* end of methods */


  render() {    
    const { sceneContext } = this.props;
    const {
      localIps, port, viewerCount, loadedProjectFilePath: projectFilePathToLoad, showUi, socket, isInRecording, recordingTimerInfo
    } = this.state;
    
    const slidesList = sceneContext.getSlidesList();
    const currentSlide = sceneContext.getCurrentSlideId();    
    const currentSlideIdx = slidesList.findIndex(slide => slide.id === currentSlide);    
    
    // for exit button
    // const searchObj = getSearchObjectFromHistory(this.props.history);    
    //console.log(loadedProjectFilePath);

    return (
      <div id="presenter" className={showUi? 'show-ui': 'hide-ui'}>
        <LanguageContextConsumer render={
            ({ messages }) => (
              <Prompt
                when={isInRecording}
                message={messages['Prompt.IncompleteRecordingMessage']}
              />
            )
          }
        />
        {/* <SystemPanel projectName={this.projectName} /> */}
        <LanguageContextConsumer render={
          ({ messages, changeLanguagePromises }) => (
            <PresenterPageMenu
              messages={messages}
              changeLanguagePromises={changeLanguagePromises}

              handleHomeButtonClick={this.handleHomeButtonClick}
              handleOpenProjectButtonClick={this.handleOpenProjectButtonClick}
              handleExitButtonClick={this.handleExitButtonClick}
            />
          )
        } />
        {/* <ButtonsPanel /> */}
        <AFramePanel disableVR={true} socket={socket} user-mode="presenter" />
        <SlidesPanel isEditing={false} socket={socket} />
        {/* <TimelinePanel /> */}
        {/* <InfoPanel /> */}
        <div className="interfaceIp-panel"
          onMouseEnter={this.showUi}
          onMouseLeave={this.hideUi}
        >
          {localIps.map(localIp => {
            return <div className="interfaceIp-data" key={localIp.ip}>
              <div className="interface">{localIp.interface}</div>
              <div className="ip">{localIp.ip}:{port}</div>
            </div>;
          })}
        </div>
        <div className="viewerCount-panel"
          onMouseEnter={this.showUi}
          onMouseLeave={this.hideUi}
        >
          <svg viewBox="0 0 27.43 30.17" xmlSpace="preserve">
            <g transform="translate(-380.000000, -1646.000000)">
              <g transform="translate(0.000000, 1519.000000)">
                <g transform="translate(380.000000, 127.371429)">
                  <path style={{
                    fillRule: 'evenodd',
                    clipRule: 'evenodd',
                    fill: 'currentColor'
                  }}
                  d="M6.49,18.13c0.63,0,1.15,0.52,1.15,1.16c0,0.41-0.2,0.76-0.52,0.97c-2.65,1.9-4.49,4.91-4.82,8.37
                    c0,0,0,0,0,0c0,0.64-0.51,1.16-1.15,1.16c-0.63,0-1.15-0.52-1.15-1.16L0,28.64c0.34-4.25,2.55-7.95,5.8-10.27
                    C5.99,18.22,6.23,18.13,6.49,18.13 M27.41,28.64l0.02,0.21c-0.01-0.06-0.02-0.13-0.02-0.19c-0.01,0.63-0.52,1.15-1.14,1.15
                    c-0.63,0-1.15-0.52-1.15-1.16h0c-0.57-5.9-5.46-10.51-11.4-10.51l-0.01,0c-0.01,0-0.02,0-0.03,0c-5.02,0-9.09-4.14-9.09-9.25
                    s4.07-9.25,9.09-9.25c0.01,0,0.01,0,0.02,0c0.01,0,0.01,0,0.02,0c5.02,0,9.09,4.14,9.09,9.24c0,1.91-0.58,3.67-1.56,5.14
                    c-0.01,0.02-0.02,0.03-0.03,0.04c-0.14,0.21-0.29,0.42-0.45,0.62c-0.05,0.07-0.11,0.14-0.17,0.2c-0.15,0.17-0.29,0.34-0.45,0.5
                    c-0.11,0.12-0.24,0.23-0.36,0.34c-0.18,0.16-0.36,0.32-0.55,0.47c-0.19,0.15-0.38,0.29-0.59,0.43c-0.04,0.02-0.07,0.05-0.1,0.08
                    c4.8,1.83,8.32,6.31,8.85,11.68C27.4,28.46,27.41,28.55,27.41,28.64 M13.71,15.79c0.23,0,0.46-0.01,0.68-0.04
                    c3.42-0.36,6.09-3.3,6.09-6.88c0-3.82-3.04-6.91-6.8-6.91C13.45,1.96,13.22,1.97,13,2C9.58,2.36,6.91,5.3,6.91,8.87
                    C6.91,12.69,9.95,15.79,13.71,15.79"/>
                </g>
              </g>
            </g>
          </svg>
          <div className="viewCount-text">{viewerCount}</div>
        </div>                  
        <div className="slideFunctions-panel"
          onMouseEnter={this.showUi}
          onMouseLeave={this.hideUi}
        >
          <div className="buttons-group">
            <div className={`button-prevSlide${currentSlideIdx === 0 ? ' disabled' : ''}`}
              onClick={this.handleButtonPrevSlideClick}
            >
              <FontAwesomeIcon icon="angle-left"/>
            </div>
            <div className="button-playSlide"
              onClick={this.handleButtonPlaySlideClick}
            >
              <FontAwesomeIcon icon="play"/>
            </div>
            <div className={`button-nextSlide${currentSlideIdx === slidesList.length - 1? ' disabled': ''}`} onClick={this.handleButtonNextSlideClick}
            >
              <FontAwesomeIcon icon="angle-right"/>
            </div>
          </div>
          <div className="buttons-group">
            <div className={`button-recordSlide`} onClick={this.handleButtonRecordSlideClick}>
              {isInRecording?
                <FontAwesomeIcon icon="video-slash"/>
                :
                <FontAwesomeIcon icon="video"/>
              }
            </div>
          </div>
          <div className="buttons-group">
            <LanguageContextConsumer render={
              ({ messages }) => (
                <select value={currentSlide}
                  onChange={e => {
                    sceneContext.selectSlide(e.currentTarget.value);
                    if (socket) {
                      socket.emit('updateSceneStatus', {
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
                      return <option key={slide.id} value={slide.id}>{`${messages['Navigation.SlideSelect.SlideIndexPrefix']} ${idx + 1}`}</option>
                    })
                  }
                </select>
              )
            } />
          </div>
          <div className="buttons-group">
            <Link to={routes.editorWithProjectFilePathQuery(projectFilePathToLoad)}>
              <LanguageContextMessagesConsumer messageId='PresentationPanel.ExitLabel' />
            </Link>
          </div>
        </div>
        <div className="show-ui-hints"
          onMouseEnter={this.showUi}
        />
        {
          isInRecording &&
          <div className="recordingInfo-panel">
            <TwinklingContainer
              animationDurationInSecs={1}
              minOpacity={0.2}
              maxOpacity={1}
            >
              <PulsatingContainer
                animationDurationInSecs={1}
                minScale={0.95}
                maxScale={1.05}
              >
                <div className="is-recording-hint"><FontAwesomeIcon icon="video"/></div>
              </PulsatingContainer>
            </TwinklingContainer>
            {
              <div className="is-recording-timer">
              {
                (
                  recordingTimerInfo ?  
                  [
                    recordingTimerInfo.hours,
                    recordingTimerInfo.minutes,
                    recordingTimerInfo.seconds
                  ]
                  :
                  [0, 0, 0]
                )
                  .map(num => String(num).padStart(2, '0')).join(':')                
              }
            </div>
            }            
          </div>
        }
      </div>
    );
  }
}

export default withSceneContext(withRouter(PresenterPage));