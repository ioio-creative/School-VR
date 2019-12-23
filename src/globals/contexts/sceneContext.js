import React, {Component} from 'react';

import {jsonCopy} from 'globals/helperfunctions'
import ABox from 'utils/aframeEditor/aBox';
import ASphere from 'utils/aframeEditor/aSphere';
import ATetrahedron from 'utils/aframeEditor/aTetrahedron';
import ACone from 'utils/aframeEditor/aCone';
import APyramid from 'utils/aframeEditor/aPyramid';
import ACylinder from 'utils/aframeEditor/aCylinder';
import ANavigation from 'utils/aframeEditor/aNavigation';
import APlane from 'utils/aframeEditor/aPlane';
import AText from 'utils/aframeEditor/aText';
import ASky from 'utils/aframeEditor/aSky';
import AVideo from 'utils/aframeEditor/aVideo';
import ACamera from 'utils/aframeEditor/aCamera';
import {TimelineMax, TweenMax, Power0} from 'gsap';

import {mediaType} from 'globals/config';
import {getLocalizedMessage} from 'globals/contexts/locale/languageContext';

//import bytesToBase64 from 'utils/js/uint8ToBase64';
// This pixel-wise implementation is not as efficient as SceneContextProvider.convertEquirectangularImageDataToBase64Str

const CubemapToEquirectangular = require('three.cubemap-to-equirectangular');
const mergeJSON = require('deepmerge').default;
const Events = require('vendor/Events.js');
const uuid_v1 = require('uuid/v1');
const uuid = _=> 'uuid_' + uuid_v1().replace(/-/g, '_');

const entityModel = {
  'a-box': ABox,
  'a-text': AText,
  'a-cone': ACone, //InfoTypeCone,
  'a-cylinder': ACylinder, //InfoTypeCylinder,
  'a-tetrahedron': ATetrahedron,
  'a-pyramid': APyramid,
  'a-sphere': ASphere,
  'a-plane': APlane, //InfoTypePlane,
  'a-image': APlane, //InfoTypePlane,
  'a-triangle': ABox, //InfoTypeTriangle,
  // 'a-image': ABox, //InfoTypeImage
  'a-video': AVideo,
  'a-camera': ACamera,
  'a-sky': ASky,
  'a-navigation': ANavigation,
};

const capture360OutputResolutionTypeToWidthMap = {
  '2k': 2048,
  '4k': 4096
};

const capture360OutputResolutionTypes = {};
Object.keys(capture360OutputResolutionTypeToWidthMap).forEach(type => {
  capture360OutputResolutionTypes[type] = type;
});

//
const SceneContext = React.createContext();
// const jsonCopy = (json) => JSON.parse(JSON.stringify(json));
/** seems all SceneData class data will be duplicate once in the contextProvider
 *  so put the data in contextProvider
*/
// class SceneData {
//   constructor(srcData) {
//     if (srcData instanceof SceneData) {
//       // copy the data in srcData to new
//       this._slides = srcData.slides;
//     }
//   }
//   get slides() {
//     return jsonCopy(this._slides);
//   }
//   get slide(slideId) {
//     if (slideId)
//     return jsonCopy(this._slides);
//   }
//   set slide(slideId) {}
// }

class SceneContextProvider extends Component {
  constructor(props) {
    window.jsonCopy = jsonCopy;

    super(props);
    this.state = {
      loaded: false,
      sceneData: [],
      assetsData: [],
      slideId: undefined,
      entityId: undefined,
      timelineId: undefined,

      timelinePosition: undefined,

      currentTime: 0,

      slideIsPlaying: false,
      // animationTimeline: null,

      appName: 'School VR',
      projectName: '',
      undoQueue: [],
      redoQueue: [],
      editor: null
    }
    this.editor = null;

    [
      'setAppName',
      'getAppName',
      'setProjectName',
      'getProjectName',
      'newProject',
      'saveProject',
      'loadProject',

      'getSlidesList',
      'getCurrentSlide',
      'getCurrentSlideId',

      'addSlide',
      'deleteSlide',
      'selectSlide',
      'sortSlide',
      'getSlideTotalTime',

      'getEntitiesList',
      'getCurrentEntity',
      'getCurrentEntityId',
      'copyEntity',

      'addEntity',
      'deleteEntity',
      'selectEntity',
      'updateEntity',

      'getTimelinesList',
      'getCurrentTimeline',
      'getCurrentTimelineId',

      'addTimeline',
      'deleteTimeline',
      'selectTimeline',
      'updateTimeline',

      'selectTimelinePosition',
      'getCurrentTimelinePosition',

      'updateTimelinePositionAttributes',

      'updateDefaultAttributes',

      'getCurrentTime',
      'updateCurrentTime',

      'addNewEntity',

      'undo',
      'redo',

      'getUndoQueueLength',
      'getRedoQueueLength',

      'playSlide',
      'seekSlide',
      'stopSlide',

      'addAsset',

      'resetView',

      'toggleEditor',

      'takeSnapshot',

      'renderByEditorCamera',
      'hideEditorCameraModel',
      'showEditorCameraModel',
      'hideEditorHelpers',
      'setEditorHelpersVisible',
      'convertEquirectangularImageDataToBase64Str',
      'captureEquirectangularImageInternal',
      'captureEquirectangularImage',
      'captureEquirectangularVideo',
      'getIsRecording',
      'toggleRecording',
    ].forEach(methodName => {
      this[methodName] = this[methodName].bind(this);
    });

    this.events = {
      'editor-load': obj => {
        //console.log('editor-load');
        this.editor = obj;
        // try add an id to the scene
        const sceneId = uuid();
        obj.sceneEl.id = sceneId;
        this.setState({
          loaded: true,
          editor: obj
        })
        // const cameraId = uuid();
        // obj.currentCameraEl.id = cameraId;
        // this.updateCameraEl(obj.currentCameraEl);
      },
      'objectselected': obj => {
        // console.log(obj);
        if (obj) {
          const currentEntity = this.getCurrentEntity();
          if (!currentEntity || currentEntity.el !== obj.el) {
            this.setState({
              entityId: obj.el.id,
              timelineId: null
            })
          }
        } else {
          this.setState({
            entityId: null,
            timelineId: null
          })
        }
      },
      'editormodechanged': () => {
        this.forceUpdate();
      }
    }
  }
  componentDidMount() {
    //const self = this;
    // init the data
    this.startEventListener('editor-load');
    this.startEventListener('objectselected');
    this.startEventListener('editormodechanged');
    // in case the editor loaded before context load
    // const autoInit = setInterval(() => {
    //   Events.emit('getEditorInstance', (o) => {
    //     console.log('hihi getEditorInstance');
    //     clearInterval(autoInit);
    //     debugger;
    //     this.events['editor-load'](o);
    //   });
    // }, 200);
    // the event emits when click on canvas
  }
  startEventListener(eventName) {
    Events.on(eventName, this.events[eventName]);
  }
  stopEventListener(eventName) {
    Events.removeListener(eventName, this.events[eventName]);
  }
  setAppName(newAppName) {
    this.setState({
      appName: newAppName
    });
  }
  getAppName() {
    return this.state.appName;
  }
  setProjectName(newProjectName) {
    this.setState((prevState) => {
      const newSceneData = jsonCopy(prevState.sceneData);
      newSceneData['projectName'] = newProjectName;
      return {
        sceneData: newSceneData
      }
    })
  }
  getProjectName() {
    return this.state.sceneData.projectName;
  }
  newProject(newProjectIdx = 1) {
    // const cameraId = uuid();
    // obj.currentCameraEl.id = cameraId;
    // this.updateCameraEl(obj.currentCameraEl);
    const slideId = uuid();
    const cameraId = uuid();
    const entityId = uuid();
    const timelineId = uuid();
    const projectName = `untitled_${newProjectIdx}`;
    const cameraEl = document.querySelector('a-camera[el-defaultCamera="true"]');
    if (cameraEl) {
      cameraEl.setAttribute('id', cameraId);
    }
    const cameraModel = new entityModel['a-camera'];
    const data = {
      projectName: projectName,
      slides: [
        {
          id: slideId,
          entities: [
            {
              type: "a-camera",
              id: cameraId,
              el: cameraEl,
              name: getLocalizedMessage(cameraModel._messageId),  //"Camera",
              timelines: [],
              components: {
                id: cameraId,
                ...cameraModel.animatableAttributesValues,
                ...cameraModel.fixedAttributes
              }
            }
          ]
        }
      ],
      // assets: []
    };
    // this.setProjectName(projectName);
    this.loadProject({
      projectName: projectName,
      entitiesList: data,
      assetsList: []
    });
    // this.setState({
    //   entityId: entityId,
    //   timelineId: timelineId
    // });
  }
  saveProject() {
    const state = this.state;
    const sceneData = jsonCopy(state.sceneData);
    let assetsData = jsonCopy(state.assetsData);
    const assetsList = {};
    sceneData.slides.forEach(slide => {
      slide.entities.forEach(entity => {
        // remove circular ref
        delete entity['el'];
        // try to remove unwant assets
        if (entity['components'] && entity['components']['material']) { // if (entity['type'] !== 'a-camera')
          const assetId = entity['components']['material']['src'];
          if (assetId) {
            assetsList[assetId.substr(1)] = true;
          }
        }
      });
    });
    assetsData = assetsData.filter(assetData => assetsList[assetData['id']]);
    // debugger;
    return {
      projectName: sceneData.projectName,
      entitiesList: sceneData,
      assetsList: assetsData
    }
  }
  loadProject(projectData) {
    // empty current scene
    const currentSlide = this.getCurrentSlide();
    if (currentSlide) {
      currentSlide.entities.forEach(entity => {
        if (entity.type !== 'a-camera') {
          this.editor.removeObject(entity.el.object3D);
        }
      })
    }
    // need to parse camera data inside data
    const projectName = projectData['projectName'];
    const sceneData = projectData['entitiesList'];
    const assetsData = projectData['assetsList'];
    sceneData['projectName'] = projectName;
    // items in assetData need to add element to the sceneEl
    assetsData.forEach(assetData => {
      this.addAsset(assetData);
    })
    this.setState({
      sceneData: sceneData,
      slideId: undefined,
    }, _=> {
      const cameraEl = document.querySelector('a-camera[el-defaultCamera="true"]');
      this.updateCameraEl(cameraEl);
      this.selectSlide(sceneData.slides[0].id);
    })
  }
  updateCameraEl(cameraEl) {
    this.setState((prevState) => {
      const currentCameraId = cameraEl.getAttribute('id') || uuid();
      cameraEl.setAttribute('id', currentCameraId);
      const newSceneData = jsonCopy(prevState.sceneData);
      newSceneData.slides.forEach(slide => {
        const cameraData = slide.entities.find(entity => entity.type='a-camera');
        // console.log(cameraEl.getAttribute('id'));
        cameraData.el = cameraEl;
        cameraData.id = currentCameraId;
      })
      return {
        sceneData: newSceneData
      }
    })
  }
  addSlide(copyFromSlideId) {
    if (this.state.sceneData.slides && copyFromSlideId) {
      const oldIdx = this.state.sceneData.slides.findIndex(slide=>slide.id===copyFromSlideId);
      const newSlide = jsonCopy(this.state.sceneData.slides.find(slide=>slide.id===copyFromSlideId));
      newSlide.id = uuid();
      // idx field is for debug only
      // newSlide.idx = (newSlide.idx.toString().split('>').slice(-1)[0]) + '>' + this.state.sceneData.slides.length;
      newSlide.entities.forEach(el => {
        el.id = uuid();
        if (el.type !== 'a-camera') {
          el.components.id = el.id;
        }
        // not cloning the animations
        el.timelines.length = 0;
        // el.timelines.forEach(tl => {
        //   tl.id = uuid()
        // })
      })
      this.setState((prevState) => {
        const newSceneData = jsonCopy(prevState.sceneData);
        const newUndoQueue = jsonCopy(prevState.undoQueue);
        newUndoQueue.push({
          sceneData: jsonCopy(prevState.sceneData),
          slideId: prevState.slideId,
          entityId: prevState.entityId,
          timelineId: prevState.timelineId,
          timelinePosition: prevState.timelinePosition,
          currentTime: prevState.currentTime,
        });
        newSceneData.slides.splice(oldIdx + 1, 0, newSlide);
        return {
          sceneData: newSceneData,
          // slideId: newSlide.id,
          entityId: undefined,
          timelineId: undefined,
          undoQueue: newUndoQueue,
          redoQueue: [],
        }
      }, _=> {
        this.selectSlide(newSlide.id);
      })
      // this.forceUpdate();
    } else {
      const cameraEl = this.editor.currentCameraEl;
      const cameraId = cameraEl.getAttribute('id');
      const newSlide = {
        id: uuid(),
        entities: [
          {
            type: "a-camera",
            id: cameraId,
            el: cameraEl,
            name: "Camera",
            timelines: []
          }
        ]
      }
      this.setState((prevState) => {
        const newSceneData = jsonCopy(prevState.sceneData);
        const newUndoQueue = jsonCopy(prevState.undoQueue);
        newUndoQueue.push({
          sceneData: jsonCopy(prevState.sceneData),
          slideId: prevState.slideId,
          entityId: prevState.entityId,
          timelineId: prevState.timelineId,
          timelinePosition: prevState.timelinePosition,
          currentTime: prevState.currentTime,
        });
        newSceneData.slides.splice(newSceneData.slides.length, 0, newSlide);
        return {
          sceneData: newSceneData,
          // slideId: newSlide.id,
          entityId: undefined,
          timelineId: undefined,
          undoQueue: newUndoQueue,
          redoQueue: [],
        }
      }, _=> {
        this.selectSlide(newSlide.id);
      })
    }
  }
  sortSlide(oldIdx, newIdx) {
    if (oldIdx !== newIdx) {
      this.setState((prevState) => {
        const newSceneData = jsonCopy(prevState.sceneData);
        // https://stackoverflow.com/questions/5306680/move-an-array-element-from-one-array-position-to-another
        newSceneData.slides.splice(newIdx, 0, newSceneData.slides.splice(oldIdx, 1)[0])
        const newUndoQueue = jsonCopy(prevState.undoQueue);
        newUndoQueue.push({
          sceneData: jsonCopy(prevState.sceneData),
          slideId: prevState.slideId,
          entityId: prevState.entityId,
          timelineId: prevState.timelineId,
          timelinePosition: prevState.timelinePosition,
          currentTime: prevState.currentTime,
        });
        return {
          sceneData: newSceneData,
          undoQueue: newUndoQueue,
          redoQueue: [],
        }
      })
    } else {
      this.selectSlide(this.state.sceneData.slides[oldIdx]['id']);
    }
  }
  deleteSlide(slideIdx) {
    if (this.state.sceneData.slides.length > 1) {
      this.setState((prevState) => {
        const newSceneData = prevState.sceneData;
        const currentSlide = newSceneData.slides[slideIdx];
        if (currentSlide.id === prevState.slideId) {
          currentSlide.entities.forEach(entity => {
            if (entity.type !== 'a-camera') {
              this.editor.removeObject(entity.el.object3D);
            }
          })
        }
        newSceneData.slides.splice(slideIdx, 1);
        const newUndoQueue = jsonCopy(prevState.undoQueue);
        newUndoQueue.push({
          sceneData: jsonCopy(prevState.sceneData),
          slideId: prevState.slideId,
          entityId: prevState.entityId,
          timelineId: prevState.timelineId,
          timelinePosition: prevState.timelinePosition,
          currentTime: prevState.currentTime,
        });
        return {
          sceneData: newSceneData,
          slideId: (currentSlide.id === prevState.slideId? newSceneData.slides[0].id: prevState.slideId),
          undoQueue: newUndoQueue,
          redoQueue: [],
        }
      },_=> {
        const sceneData = this.state.sceneData;
        const selectedSlide = sceneData.slides.find(slide => slide.id === this.state.slideId);
        this.selectSlide(selectedSlide.id);
      })
    }
  }
  getSlidesList() {
    if (this.state.sceneData.slides) {
      return this.state.sceneData.slides;
    } else {
      return [];
    }
  }
  getCurrentSlide() {
    const state = this.state;
    const sceneData = state.sceneData;
    const slides = sceneData.slides;
    if (!slides) return null;
    const currentSlide = slides.find(el => el.id === state.slideId);
    return currentSlide;
  }
  getCurrentSlideId() {
    return this.state.slideId;
  }

  selectSlide(slideId, autoPlay) {
    const editor = this.editor;
    this.setState((prevState) => {
      const sceneData = prevState.sceneData;
      if (prevState.slideId) {
        const currentSlide = sceneData.slides.find(slide => slide.id === prevState.slideId);
        if (currentSlide) {
          currentSlide.entities.forEach(entity => {
            if (entity.type !== 'a-camera') {
              editor.removeObject(entity.el.object3D);
            }
          })
        }
      }
      const newSceneData = jsonCopy(prevState.sceneData);
      const newSlide = newSceneData.slides.find(slide => slide.id === slideId);
      newSlide.entities.forEach(entity => {
        if (entity.type !== 'a-camera') {
          entity.el = editor.createNewEntity(entity);
          const objectModel = new entityModel[entity.type];
          objectModel.setEl(entity.el);
          if (entity.type === 'a-text') {
            // seems the custom component need setAttribute to trigger init
            const currentFontSize = entity.components.ttfFont.fontSize;
            // console.log(entity.el, entity.el.hasLoaded);
            if (!currentFontSize) {
              entity.el.addEventListener('loaded', function elOnLoad() {
                // console.log('elOnLoad');
                // entity.el.setAttribute('ttfFont','fontSize:2');
                entity.el.setAttribute('ttfFont','fontSize:1');
                entity.el.removeEventListener('loaded', elOnLoad);
              })
            } else {
              entity.el.addEventListener('loaded', function elOnLoad() {
                // console.log('elOnLoad');
                // entity.el.setAttribute('ttfFont','fontSize:' + (currentFontSize + 1));
                entity.el.setAttribute('ttfFont','fontSize:' + currentFontSize);
                entity.el.removeEventListener('loaded', elOnLoad);
              })
            }
          }
        }
      })
      return {
        sceneData: newSceneData,
        entityId: null,
        timelineId: null,
        timelinePosition: null,
        // animationTimeline: null,
        currentTime: 0,
        slideId: slideId
      }
    }, _=> {
      // console.log(this.editor);
      // debugger;
      this.editor && this.editor.selectEntity(null);
      const newTl = this.rebuildTimeline(false);
      if (autoPlay) {
        newTl.then(tl => tl.play(0));
      }
    })
  }
  getSlideTotalTime(slideId = this.state.slideId) {
    // loop through all entities and timelines to get the max total time
    const entities = this.getEntitiesList(slideId);
    let maxTime = 0;
    entities.forEach(entity => {
      entity.timelines.forEach(timeline => {
        if (timeline.start + timeline.duration > maxTime) {
          maxTime = timeline.start + timeline.duration;
        }
      })
    })
    return maxTime;
  }

  getEntitiesList(slideId = this.state.slideId) {
    const state = this.state;
    const slides = state.sceneData.slides;
    if (slides) {
      const currentSlide = slides.find(el => el.id === slideId);
      if (currentSlide) {
        return currentSlide['entities'];
      }
    }
    // should be somethings wrong
    return [];
  }
  addEntity() {
    // what ??
  }
  deleteEntity(entityId) {
    this.setState((prevState) => {
      const newSceneData = jsonCopy(prevState.sceneData);
      const slides = newSceneData.slides;
      const currentSlide = slides.find(el => el.id === prevState.slideId);
      const deleteEntityIdx = currentSlide.entities.findIndex(el => el.id === entityId);
      const deletedEntity = currentSlide.entities.splice(deleteEntityIdx, 1)[0];
      this.editor.removeObject(deletedEntity.el.object3D);
      const newUndoQueue = jsonCopy(prevState.undoQueue);
      newUndoQueue.push({
        sceneData: jsonCopy(prevState.sceneData),
        slideId: prevState.slideId,
        entityId: prevState.entityId,
        timelineId: prevState.timelineId,
        timelinePosition: prevState.timelinePosition,
        currentTime: prevState.currentTime,
      });
      return {
        sceneData: newSceneData,
        entityId: undefined,
        undoQueue: newUndoQueue,
        redoQueue: [],
      }
    }, _=> {
      this.rebuildTimeline()
    })
  }
  selectEntity(entityId) {
    // pass back to editor to select?
    const state = this.state;
    const sceneData = state.sceneData;
    const slides = sceneData.slides;
    if (!slides) return null;
    const currentSlide = slides.find(el => el.id === state.slideId);
    if (!currentSlide) return null;
    const selectedEntity = currentSlide.entities.find(el => el.id === entityId);

    this.editor.selectEntity(selectedEntity.el);
    // after editor select, an event will be emit and state will update there
    // this.setState({
    //   entityId: entityId
    // })
  }
  getCurrentEntity(entityId = this.state.entityId) {
    const state = this.state;
    const sceneData = state.sceneData;
    const slides = sceneData.slides;
    if (!slides) return null;
    const currentSlide = slides.find(el => el.id === state.slideId);
    if (!currentSlide) return null;
    const selectedEntity = currentSlide.entities.find(el => el.id === entityId);
    // if (!selectedEntity) return null;
    return selectedEntity;
  }
  getCurrentEntityId() {
    return this.state.entityId;
  }
  copyEntity(entityId = this.state.entityId) {
    const state = this.state;
    const copyFromEntity = this.getCurrentEntity(entityId);
    const type = copyFromEntity.type;
    const objectModel = new entityModel[type];
    const elementId = uuid();
    const newElement = {
      type: type,
      id: elementId,
      name: ('copy of ' + copyFromEntity.name).substr(0, 10),
      element: 'a-entity',
      timelines: []
    };
    newElement['components'] = mergeJSON(
      objectModel.animatableAttributesValues,
      objectModel.fixedAttributes
    );
    newElement['components'] = mergeJSON(
      newElement['components'],
      copyFromEntity['components']
    );
    newElement['components']['id'] = elementId;

    const newEl = this.editor.createNewEntity(newElement);
    // need a setAttribute to trigger the ttfFont init
    if (newElement['components']['ttfFont'] && newElement['components']['ttfFont']['opacity']) {
      // console.log('sdfsaf');
      newEl.setAttribute('ttfFont', 'opacity', !newElement['components']['ttfFont']['opacity']);
      newEl.setAttribute('ttfFont', 'opacity', newElement['components']['ttfFont']['opacity']);
    }
    // newEl.removeAttribute('something');
    newElement['el'] = newEl;
    objectModel.setEl(newEl);
    this.setState((prevState) => {
      const newSceneData = jsonCopy(prevState.sceneData);
      const newUndoQueue = jsonCopy(prevState.undoQueue);
      const currentSlide = newSceneData.slides.find(slide => slide.id === prevState.slideId);
      currentSlide.entities.push(newElement);
      newUndoQueue.push({
        sceneData: jsonCopy(prevState.sceneData),
        slideId: prevState.slideId,
        entityId: prevState.entityId,
        timelineId: prevState.timelineId,
        timelinePosition: prevState.timelinePosition,
        currentTime: prevState.currentTime,
      });
      // prevState.undoQueue.push(jsonCopy(prevState.sceneData));
      return {
        sceneData: newSceneData,
        entityId: elementId,
        undoQueue: newUndoQueue,
        redoQueue: [],
      }
    }, _=> {
      this.rebuildTimeline().then(tl => tl.seek(this.state.currentTime, false));
    })
  }
  updateEntity(newAttrs, entityId) {
    this.setState((prevState) => {
      // console.log('updateEntity');
      const newSceneData = jsonCopy(prevState.sceneData);
      const slides = newSceneData.slides;
      const currentSlide = slides.find(el => el.id === prevState.slideId);
      const currentEntity = currentSlide.entities.find(el => el.id === entityId);
      // currentEntity.name = newAttrs;
      Object.keys(newAttrs).forEach(key => {
        if (currentEntity['components'] && currentEntity['components'].hasOwnProperty(key)) {
          if (typeof(newAttrs[key]) === "object") {
            currentEntity['components'][key] = {
              ...currentEntity['components'][key],
              ...newAttrs[key]
            }
          } else {
            currentEntity['components'][key] = newAttrs[key]; //currentEntity
          }
        } else {
          currentEntity[key] = newAttrs[key];
        }
      })
      // currentEntity = {...currentEntity, ...newAttrs};
      // console.log(currentEntity);
      const newUndoQueue = jsonCopy(prevState.undoQueue);
      newUndoQueue.push({
        sceneData: jsonCopy(prevState.sceneData),
        slideId: prevState.slideId,
        entityId: prevState.entityId,
        timelineId: prevState.timelineId,
        timelinePosition: prevState.timelinePosition,
        currentTime: prevState.currentTime,
      });
      return {
        sceneData: newSceneData,
        undoQueue: newUndoQueue,
        redoQueue: [],
       // slideId: newSceneData.slides[0].id
      }
    }, _=> {
      this.rebuildTimeline()
    })
  }


  getTimelinesList(entityId) {
    const state = this.state;
    const sceneData = state.sceneData;
    const slides = sceneData.slides;
    const currentSlide = slides.find(el => el.id === state.slideId);
    const currentEntity = currentSlide.entities.find(el => el.id === entityId);
    return currentEntity['timelines'];
  }
  getCurrentTimeline() {
    const state = this.state;
    const sceneData = state.sceneData;
    const slides = sceneData.slides;
    if (!slides) return null;
    const currentSlide = slides.find(el => el.id === state.slideId);
    if (!currentSlide) return null;
    const selectedEntity = currentSlide.entities.find(el => el.id === state.entityId);
    if (!selectedEntity) return null;
    const selectedTimeline = selectedEntity.timelines.find(tl => tl.id === state.timelineId);
    return selectedTimeline;
  }
  getCurrentTimelineId() {
    return this.state.timelineId;
  }
  addTimeline(entityId, startTime = 0) {
    this.setState((prevState) => {
      const newSceneData = jsonCopy(prevState.sceneData);
      const slides = newSceneData.slides;
      const currentSlide = slides.find(el => el.id === prevState.slideId);
      const currentEntity = currentSlide.entities.find(el => el.id === entityId);

      //////////       *       *       *       //////////
      // TODO: get the prev timeline and next timeline //
      //////////       *       *       *       //////////
      const aEntity = new entityModel[currentEntity['type']];
      // const staticAttributes = abox.setStaticAttributesValues();
      let animatableStartAttributes = aEntity.getAnimatableAttributesValues();
      let animatableEndAttributes = aEntity.getAnimatableAttributesValues();
      let duration = 5;
      if (currentEntity.timelines.length > 0) {
        let prevTimeline = null;
        let nextTimeline = null;
        let sameTimeline = null;
        currentEntity.timelines.forEach(timeline => {
          if (timeline.start < startTime && (prevTimeline === null || timeline.start > prevTimeline.start)) {
            prevTimeline = timeline;
          }
          if (timeline.start > startTime && (nextTimeline === null || timeline.start < nextTimeline.start)) {
            nextTimeline = timeline;
          }
          if (timeline.start === startTime) {
            sameTimeline = timeline;
          }
        })
        if (sameTimeline) {
          return;
        }
        if (prevTimeline) {
          if (prevTimeline.start + prevTimeline.duration > startTime) return;
          animatableStartAttributes = jsonCopy(prevTimeline.endAttribute);
          if (!nextTimeline) {
            animatableEndAttributes = jsonCopy(prevTimeline.endAttribute);
          }
        }
        if (nextTimeline) {
          animatableEndAttributes = jsonCopy(nextTimeline.startAttribute);
          duration = Math.min(duration, nextTimeline.start - startTime);
          if (!prevTimeline) {
            animatableStartAttributes = jsonCopy(nextTimeline.startAttribute);
          }
        }
      } else {
        // get current components data as initial value
        if (currentEntity['components']) {
          animatableStartAttributes = jsonCopy(currentEntity['components']);
          animatableEndAttributes = jsonCopy(currentEntity['components']);
        }
      }
      const newUndoQueue = jsonCopy(prevState.undoQueue);
      newUndoQueue.push({
        sceneData: jsonCopy(prevState.sceneData),
        slideId: prevState.slideId,
        entityId: prevState.entityId,
        timelineId: prevState.timelineId,
        timelinePosition: prevState.timelinePosition,
        currentTime: prevState.currentTime,
      });
      // console.log(duration);


      const newTimelineId = uuid();
      // console.log(newTimelineId);
      currentEntity.timelines.push({
        id: newTimelineId,
        start: startTime,
        duration: duration,
        startAttribute: animatableStartAttributes,
        endAttribute: animatableEndAttributes,
      })
      currentEntity.timelines.sort((a,b) => a.start - b.start);
      return {
        sceneData: newSceneData,
        entityId: entityId,
        timelineId: newTimelineId,
        undoQueue: newUndoQueue,
        redoQueue: [],
        // timelinePosition: 'startAttribute'
      }
    }, _=> {
      // console.log(this.state.timelineId);
      this.rebuildTimeline();
      this.selectTimelinePosition('startAttribute')
    })
  }
  deleteTimeline(timelineId) {
    this.setState((prevState) => {
      const newSceneData = jsonCopy(prevState.sceneData);
      const slides = newSceneData.slides;
      const currentSlide = slides.find(el => el.id === prevState.slideId);
      const currentEntity = currentSlide.entities.find(el => el.id === prevState.entityId);
      const deleteTimelineIdx = currentEntity.timelines.findIndex(el => el.id === timelineId);
      const deletedTimeline = currentEntity.timelines.splice(deleteTimelineIdx, 1);
      if (currentEntity.timelines.length === 0) {
        // just now deleted is the last timeline
        const startAttribute = deletedTimeline[0]['startAttribute'];
        currentEntity.components = mergeJSON(currentEntity.components, startAttribute);
        Object.keys(startAttribute).forEach(k => {
          currentEntity.el.setAttribute(k, startAttribute[k]);
        })
      }
      this.editor.enableControls(false);
      const newUndoQueue = jsonCopy(prevState.undoQueue);
      newUndoQueue.push({
        sceneData: jsonCopy(prevState.sceneData),
        slideId: prevState.slideId,
        entityId: prevState.entityId,
        timelineId: prevState.timelineId,
        timelinePosition: prevState.timelinePosition,
        currentTime: prevState.currentTime,
      });
      return {
        sceneData: newSceneData,
        timelineId: undefined,
        timelinePosition: null,
        undoQueue: newUndoQueue,
        redoQueue: [],
      }
    }, _ => {
      this.rebuildTimeline()
    })
  }
  selectTimeline(timelineId) {
    // console.log(timelineId);
    this.setState({
      timelineId: timelineId
    })
  }
  updateTimeline(newAttrs, timelineId) {
    const {start, duration} = newAttrs;
    this.setState((prevState) => {
      const newSceneData = jsonCopy(prevState.sceneData);
      const slides = newSceneData.slides;
      const currentSlide = slides.find(el => el.id === prevState.slideId);
      const currentEntity = currentSlide.entities.find(el => el.id === prevState.entityId);
      const currentTimeline = currentEntity.timelines.find(el => el.id === timelineId);
      if (currentTimeline.start !== start ||
          currentTimeline.duration !== duration) {

        currentTimeline.start = start;
        currentTimeline.duration = duration;
        const newUndoQueue = jsonCopy(prevState.undoQueue);
        newUndoQueue.push({
          sceneData: jsonCopy(prevState.sceneData),
          slideId: prevState.slideId,
          entityId: prevState.entityId,
          timelineId: prevState.timelineId,
          timelinePosition: prevState.timelinePosition,
          currentTime: prevState.currentTime,
        });
        return {
          sceneData: newSceneData,
          undoQueue: newUndoQueue,
          redoQueue: [],
        }
      }
    }, _=> {
      this.rebuildTimeline()
    })
  }

  selectTimelinePosition(newPosition, timelineId = this.state.timelineId, entityId = this.state.entityId) {
    const state = this.state;
    let currentTime = state.currentTime;
    if (!newPosition && timelineId === state.timelineId) {
      newPosition = state.timelinePosition;
    }
    const sceneData = state.sceneData;
    const slides = sceneData.slides;
    const currentSlide = slides.find(el => el.id === state.slideId);
    const selectedEntity = currentSlide.entities.find(el => el.id === entityId);

    this.editor.selectEntity(selectedEntity.el);
    this.editor.enableControls(!!newPosition);
    // const currentEntity = this.getCurrentEntity();
    // console.log(!!newPosition);
    // if (currentEntity)

    // startAttribute
    // endAttribute
    if (!!timelineId && !!newPosition) {
      // load the attributes to the scene
      const selectedTimeline = selectedEntity.timelines.find(tl => tl.id === timelineId);
      if (selectedTimeline) {
        const selectedTimelinePosition = selectedTimeline[newPosition];
        currentTime = (newPosition === 'startAttribute'? selectedTimeline.start: selectedTimeline.start + selectedTimeline.duration);
        const element = selectedEntity['el'];
        // console.log(selectedTimelinePosition);
        const aEntity = new entityModel[selectedEntity['type']](element);
        aEntity.updateEntityAttributes(selectedTimelinePosition);
        // Object.keys(selectedTimelinePosition).forEach(key => {
        //   const value = selectedTimelinePosition[key];
        //   // need to set somethings else before set the real value
        //   element.setAttribute(key, element.getAttribute(key));
        //   element.setAttribute(key, value);
        //   // if (element.children && key === 'material') {
        //   //   Array.prototype.slice.call(element.children).forEach(child => {
        //   //     child.setAttribute(key, child.getAttribute(key));
        //   //     child.setAttribute(key, value);
        //   //   })
        //   // }
        // })
      }
    }
    this.seekSlide(currentTime);
    this.setState({
      timelineId: timelineId,
      entityId: entityId,
      timelinePosition: newPosition,
      currentTime: currentTime
    })
  }
  getCurrentTimelinePosition() {
    return this.state.timelinePosition;
  }
  updateTimelinePositionAttributes(newAttrs) {
    // const currentTimeline = this.getCurrentTimeline();
    // console.log('updateTimelinePositionAttributes');
    this.setState((prevState) => {
      const newSceneData = jsonCopy(prevState.sceneData);
      const slides = newSceneData.slides;
      const currentSlide = slides.find(el => el.id === prevState.slideId);
      const selectedEntity = currentSlide.entities.find(el => el.id === prevState.entityId);
      const selectedTimeline = selectedEntity.timelines.find(tl => tl.id === prevState.timelineId);
      let selectedTimelinePosition = selectedTimeline[prevState.timelinePosition];
      for (let k in newAttrs) {
        if (selectedTimelinePosition.hasOwnProperty(k)) {
          if (typeof(newAttrs[k]) === "object") {
            // console.log(selectedTimelinePosition[k], newAttrs[k]);
            Object.assign(selectedTimelinePosition[k], newAttrs[k]);
          } else {
            selectedTimelinePosition[k] = newAttrs[k];
          }
        }
      }
      const newUndoQueue = jsonCopy(prevState.undoQueue);
      newUndoQueue.push({
        sceneData: jsonCopy(prevState.sceneData),
        slideId: prevState.slideId,
        entityId: prevState.entityId,
        timelineId: prevState.timelineId,
        timelinePosition: prevState.timelinePosition,
        currentTime: prevState.currentTime,
      });

      // console.log(selectedTimelinePosition);
      return {
        sceneData: newSceneData,
        undoQueue: newUndoQueue,
        redoQueue: [],
      }
    }, _=> {
      this.rebuildTimeline()
    })
  }

  updateDefaultAttributes(newAttrs) {
    this.setState((prevState) => {
      const newSceneData = jsonCopy(prevState.sceneData);
      const slides = newSceneData.slides;
      const currentSlide = slides.find(el => el.id === prevState.slideId);
      const selectedEntity = currentSlide.entities.find(el => el.id === prevState.entityId);
      const entityComponent = selectedEntity['components'];
      const newUndoQueue = jsonCopy(prevState.undoQueue);
      if (entityComponent) {
        for (let k in newAttrs) {
          if (entityComponent.hasOwnProperty(k)) {
            if (typeof(newAttrs[k]) === "object") {
              // console.log(selectedTimelinePosition[k], newAttrs[k]);
              Object.assign(entityComponent[k], newAttrs[k]);
            } else {
              entityComponent[k] = newAttrs[k];
            }
          }
        }
        newUndoQueue.push({
          sceneData: jsonCopy(prevState.sceneData),
          slideId: prevState.slideId,
          entityId: prevState.entityId,
          timelineId: prevState.timelineId,
          timelinePosition: prevState.timelinePosition,
          currentTime: prevState.currentTime,
        });
      }

      // console.log(selectedTimelinePosition);
      return {
        sceneData: newSceneData,
        undoQueue: newUndoQueue,
        redoQueue: [],
      }
    }, _=> {
      this.rebuildTimeline()
    })
  }
  getCurrentTime() {
    return this.state.currentTime
  }
  updateCurrentTime(currentTime) {
    this.seekSlide(currentTime);
    this.setState({
      currentTime: currentTime
    })
  }

  addNewEntity(type) {
    //const state = this.state;
    const objectModel = new entityModel[type];
    const elementId = uuid();
    const newElement = {
      type: type,
      id: elementId,
      name: getLocalizedMessage(objectModel._messageId),  //type.split('-')[1],
      element: 'a-entity',
      // components: {
      //   id: elementId,
      //   material: {
      //     color: '#FFFFFF',
      //     opacity: 1,
      //     transparent: true // use to map transparent png/gif
      //   },
      //   'geometry': {
      //     primitive: 'box'
      //   },
      //   position: '0 0 0',
      //   scale: '1 1 1',
      //   rotation: '0 0 0'
      // },
      timelines: []
    };
    newElement['components'] = mergeJSON(
      {
        id: elementId,
        ...objectModel.animatableAttributesValues
      },
      objectModel.fixedAttributes
    );
    const newEl = this.editor.createNewEntity(newElement);
    // need a setAttribute to trigger the ttfFont init
    if (newElement['components']['ttfFont'] && newElement['components']['ttfFont']['opacity']) {
      // console.log('sdfsaf');
      newEl.setAttribute('ttfFont', 'opacity', !newElement['components']['ttfFont']['opacity']);
      newEl.setAttribute('ttfFont', 'opacity', newElement['components']['ttfFont']['opacity']);
    }
    // newEl.removeAttribute('something');
    newElement['el'] = newEl;
    objectModel.setEl(newEl);
    this.setState((prevState) => {
      const newSceneData = jsonCopy(prevState.sceneData);
      const newUndoQueue = jsonCopy(prevState.undoQueue);
      const currentSlide = newSceneData.slides.find(slide => slide.id === prevState.slideId);
      currentSlide.entities.push(newElement);
      newUndoQueue.push({
        sceneData: jsonCopy(prevState.sceneData),
        slideId: prevState.slideId,
        entityId: prevState.entityId,
        timelineId: prevState.timelineId,
        timelinePosition: prevState.timelinePosition,
        currentTime: prevState.currentTime,
      });
      // prevState.undoQueue.push(jsonCopy(prevState.sceneData));
      return {
        sceneData: newSceneData,
        entityId: elementId,
        undoQueue: newUndoQueue,
        redoQueue: [],
      }
    }, _=> {
      this.rebuildTimeline().then(tl => tl.seek(this.state.currentTime, false));
      // console.log(this.state.sceneData);
      // console.log(this.state.undoQueue);
    })
// currentSlide.entites
// slides
// entities
  }

  // dunno if the queue undo in setstate function can get the same state or not
  // so keep the queue implement inside each place need to have undo
  // queueUndo() {

  // }

  // const currentSlide = sceneData.slides.find(slide => slide.id === prevState.slideId);
  //     currentSlide.entities.forEach(entity => {
  //       this.editor.removeObject(entity.el.object3D);
  //     })
  //     const newSceneData = jsonCopy(prevState.sceneData);
  //     const newSlide = newSceneData.slides.find(slide => slide.id === slideId);
  //     newSlide.entities.forEach(entity => {
  //       entity.el = this.editor.createNewEntity(entity);
  //     })
  undo() {
    if (this.state.undoQueue.length) {
      this.setState((prevState) => {
        this.stopEventListener('objectselected');
        const currentSlide = prevState.sceneData.slides.find(slide => slide.id === prevState.slideId);
        currentSlide.entities.forEach(entity => {
          if (entity.type !== 'a-camera') {
            this.editor.removeObject(entity.el.object3D);
          }
        })
        const undoQueue = jsonCopy(prevState.undoQueue);
        const redoQueue = jsonCopy(prevState.redoQueue);
        const lastState = undoQueue.pop();
        console.log(lastState);
        redoQueue.push({
          sceneData: jsonCopy(prevState.sceneData),
          slideId: prevState.slideId,
          entityId: prevState.entityId,
          timelineId: prevState.timelineId,
          timelinePosition: prevState.timelinePosition,
          currentTime: prevState.currentTime,
        });
        return {
          ...lastState,
          undoQueue: undoQueue,
          redoQueue: redoQueue
        }
      }, _=> {
        const newSceneData = this.state.sceneData;
        const newSlide = newSceneData.slides.find(slide => slide.id === this.state.slideId);
        newSlide.entities.forEach(entity => {
          if (entity.type !== 'a-camera') {
            entity.el = this.editor.createNewEntity(entity);
          } else {
            entity.el = this.editor.currentCameraEl;
          }
          if (entity.material && entity.material.src) {
            entity.el.setAttribute('material', {
              src: entity.material.src
            })
          }
        })
        // this.startEventListener('objectselected');
        this.rebuildTimeline().then(tl => {
          tl.seek(this.state.currentTime + 0.01).seek(this.state.currentTime, false);
          this.startEventListener('objectselected');
        });
      })
    }
  }
  redo() {
    if (this.state.redoQueue.length) {
      this.setState((prevState) => {
        this.stopEventListener('objectselected');
        const currentSlide = prevState.sceneData.slides.find(slide => slide.id === prevState.slideId);
        currentSlide.entities.forEach(entity => {
          if (entity.type !== 'a-camera') {
            this.editor.removeObject(entity.el.object3D);
          }
        })
        const undoQueue = jsonCopy(prevState.undoQueue);
        const redoQueue = jsonCopy(prevState.redoQueue);
        const lastState = redoQueue.pop();
        undoQueue.push({
          sceneData: jsonCopy(prevState.sceneData),
          slideId: prevState.slideId,
          entityId: prevState.entityId,
          timelineId: prevState.timelineId,
          timelinePosition: prevState.timelinePosition,
          currentTime: prevState.currentTime,
        });
        return {
          ...lastState,
          undoQueue: undoQueue,
          redoQueue: redoQueue
        }
      }, _=> {
        const newSceneData = this.state.sceneData;
        const newSlide = newSceneData.slides.find(slide => slide.id === this.state.slideId);
        newSlide.entities.forEach(entity => {
          if (entity.type !== 'a-camera') {
            entity.el = this.editor.createNewEntity(entity);
          } else {
            entity.el = this.editor.currentCameraEl;
          }
          // entity.el = this.editor.createNewEntity(entity);
          if (entity.material && entity.material.src) {
            entity.el.setAttribute('material', {
              src: entity.material.src
            })
          }
        })
        this.rebuildTimeline().then(tl => {
          // console.log(tl);
          tl.seek(this.state.currentTime + 0.01).seek(this.state.currentTime, false);
          this.startEventListener('objectselected');
        });
      })
    }
  }
  getUndoQueueLength() {
    return this.state.undoQueue.length;
  }
  getRedoQueueLength() {
    return this.state.redoQueue.length;
  }
  componentWillUnmount() {
    this.stopEventListener('editor-load');
    this.stopEventListener('objectselected');
    this.stopEventListener('editormodechanged');
  }
  flattenJSON(json, prefix = '') {
    let flatted = {};
    Object.keys(json).forEach((attr) => {
      let key = (prefix !== '' ? prefix + '.' + attr: attr);
      if (Object.prototype.toString.call(json[attr]) === '[object Object]') {
        flatted = mergeJSON(flatted, this.flattenJSON(json[attr], key));
      } else {
        flatted[key] = jsonCopy(json[attr]);
        return flatted;
      }
    })
    return flatted;
  }

  deFlattenJSON(json) {
    let nested = {};
    Object.keys(json).forEach((attr) => {
      const key = attr.split('.')[0];
      const remain = attr.split('.').slice(1).join('.');
      // console.log(remain);
      if (remain) {
        const tmp = {};
        tmp[remain] = json[attr];
        if (nested[key] === undefined) {
          nested[key] = {};
        }
        nested[key] = mergeJSON(
          nested[key],
          this.deFlattenJSON(tmp)
        );
      } else {
        nested[key] = json[key];
      }
    })
    return nested;
  }
  rebuildTimeline(generateThumb = true) {
    return new Promise((resolve, reject) => {
      // use timelinemax to build the timeline here
      this.setState((prevState) => {
        const currentSlideId = prevState.sceneData.slides.findIndex(slide => slide.id === prevState.slideId);
        const newSceneData = jsonCopy(prevState.sceneData);
        // const newSlides = jsonCopy(prevState.sceneData.slides);
        const currentSlide = newSceneData.slides[currentSlideId];
        if (prevState.animationTimeline) {
          // delete old animation timeline
          prevState.animationTimeline.stop().kill();
          // can assume all media stop?
          const videoEls = document.querySelectorAll('a-assets video');
          for (let videoEl of videoEls) {
            videoEl.pause();
          }
        }
        const tl = new TimelineMax({
          paused: true
        });
        const deltaOffset = 0.001;
        const mediaElsList = [];
        currentSlide.entities.forEach(entity => {
          // animation here
          const element = entity.el;
          const aEntity = new entityModel[entity['type']](element);
          let firstTimeline = null;
          let lastTimeline = null;
          const entityMedia = {
            mediaEl : null,
          }
          if (entity.components && entity.components.material && entity.components.material.src) {
            // check if this is a video
            const mediaEl = document.querySelector(entity.components.material.src);
            const mediaElType = Object.prototype.toString.call(mediaEl);
            if (mediaElType === '[object HTMLVideoElement]') {
              entityMedia['mediaEl'] = mediaEl;
              mediaElsList.push(mediaEl);
            }
            // debugger;
          }
          if (entity['type'] === 'a-camera' && entity.timelines.length === 0) {
            // camera only
            // no timeline, just set the component
            tl.add(() => {
              aEntity.updateEntityAttributes(entity.components);
            }, deltaOffset);
          }
          entity.timelines.forEach(timeline => {
            const {
              start, duration,
              startAttribute, endAttribute
            } = timeline;
            const tmpAttrs = this.flattenJSON(jsonCopy(startAttribute));
            if (firstTimeline === null || start < firstTimeline.start) {
              firstTimeline = timeline;
            }
            if (lastTimeline === null || start > lastTimeline.start) {
              lastTimeline = timeline;
            }
            tl.add(TweenMax.to(
              tmpAttrs,
              duration - deltaOffset * 2,
              {
                ...this.flattenJSON(endAttribute),
                ease: Power0.easeNone,
                onUpdate: () => {
                  // console.log(tmpAttrs);
                  // Events.emit('refreshsidebarobject3d');
                  aEntity.updateEntityAttributes(this.deFlattenJSON(tmpAttrs));
                }
              }
            ), start + deltaOffset);
          })

          if (firstTimeline) {
            tl.add(() => {
              aEntity.updateEntityAttributes(firstTimeline.startAttribute);
            }, 0);
            // must need timeline to enable play
            // media playing
            if (entityMedia['mediaEl']) {
              tl.add(() => {
                entityMedia['mediaEl'].loop = true;
                if (!tl.paused()) {
                  entityMedia['mediaEl'].load();
                  entityMedia['mediaEl'].play();
                }
              }, firstTimeline.start + deltaOffset);


              tl.add(() => {
                entityMedia['mediaEl'].pause();
              }, lastTimeline.start + lastTimeline.duration);
            }
          }
        })
        let started = false;

        tl.eventCallback('onStart', () => {
          started = true;
          // console.log(tl);
        })
        tl.eventCallback('onUpdate', () => {
          // Events.emit('refreshsidebarobject3d');
          if (started && tl.paused()) {
            console.log('onUpdate');
            for (let i = 0; i < mediaElsList.length; i++) {
              mediaElsList[i].setAttribute('isPaused', mediaElsList[i].paused);
              mediaElsList[i].pause();
            }
            started = false;
          }
          this.setState({
            currentTime: tl.progress() * tl.duration()
          });
        })
        // tl.eventCallback('onPaused', () => {
        //   console.log('animation paused')
        //   for (let i = 0; i < mediaElsList.length; i++) {
        //     mediaElsList[i].pause();
        //   }
        // })
        tl.eventCallback('onComplete', () => {
          // Events.emit('refreshsidebarobject3d');
          // console.log('onComplete');
          // the timeline need to manually pause after complete?
          this.setState({
            slideIsPlaying: false
          }, _=> {
            tl.pause();
          })
        })
        // tl.play(0, false).stop().seek(0.001).seek(0, false);
        // const snapshot = this.takeSnapshot();
        if (this.editor.opened && generateThumb) {
          currentSlide.image = this.takeSnapshot();
        }
        // setTimeout(()=>{
        //   tl.seek(prevState.currentTime);
        //   tl.eventCallback('onUpdate', () => {
        //     // Events.emit('refreshsidebarobject3d');
        //     this.setState({
        //       currentTime: tl.progress() * tl.duration()
        //     });
        //   })
        // },100)

        // console.log(currentSlide.image);
        // if (autoPlay) {
        //   tl.play(0, false);
        // }
        // console.log(tl.duration());
        resolve(tl);
        // tl.eventCallback('onUpdate', () => {
        //   console.log(tl.progress())
        // })
        return {
          animationTimeline: tl,
          sceneData: newSceneData
        }
      })
    });
  }
  // animation function
  playSlide() {
    this.setState({
      slideIsPlaying: true
    }, _=> {
      if (this.state.animationTimeline) {
        this.state.animationTimeline.seek(0.001).seek(0, false).play();
      } else {
        this.rebuildTimeline().then(tl => tl.stop().seek(0.001).seek(0, false));
      }
    })

  }

  doSomethingBetweenHideShowOfEditorHelpers(functionToCall) {
    // hide and store original editor helpers visibility
    const original_helper_visibility_array = this.hideEditorHelpers();
    this.hideEditorCameraModel();

    const returnedResult = functionToCall();

    // restore original editor helpers visibility
    this.showEditorCameraModel();
    this.setEditorHelpersVisible(original_helper_visibility_array);

    this.renderByEditorCamera();

    return returnedResult;
  }
  takeSnapshot() {
    return this.doSomethingBetweenHideShowOfEditorHelpers(_ => {
      const editor = this.editor;
      const renderer = editor.sceneEl.renderer;
      const scene = editor.sceneEl.object3D;
      const camera = editor.currentCameraEl.getObject3D('camera');
      const width = renderer.domElement.width;
      const height = renderer.domElement.height;

      // render with editor helpers hidden
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.render(scene, camera);

      // canvas.width = width;
      // canvas.height = height;
      // if (camera.aspect > 1) {
      //   this.cameraPreviewScreenEl.setAttribute( 'width', canvas.width / 270 * 0.6 );
      //   this.cameraPreviewScreenEl.setAttribute( 'height', canvas.height / 270 * 0.6 );
      // } else {
      //   this.cameraPreviewScreenEl.setAttribute( 'width', canvas.width / newHeight * 0.6 );
      //   this.cameraPreviewScreenEl.setAttribute( 'height', canvas.height / newHeight * 0.6 );
      // }

      const snapshotDataUrl = renderer.domElement.toDataURL();
      return snapshotDataUrl;
    });
  }
  stopSlide() {
    this.setState((prevState) => {
      return {
        currentTime: Math.round(prevState.currentTime),
        slideIsPlaying: false
      }
    }, _=> {
      if (this.state.animationTimeline) {
        // this.state.animationTimeline
        // console.log(this.state.animationTimeline);
        this.state.animationTimeline.stop().seek(this.state.currentTime, false);
      } else {
        // the timeline must be present ?
        this.rebuildTimeline().then(tl => tl.stop());
      }
    })
  }

  renderByEditorCamera() {
    const editor = this.editor;
    if (editor.opened) {
      const renderer = editor.sceneEl.renderer;
      const scene = editor.sceneEl.object3D;
      const editorCamera = editor.editorCameraEl.getObject3D('camera');
      renderer.render(scene, editorCamera);
    }
  }
  hideEditorCameraModel() {
    this.setCurrentCameraModelVisibility(false);
  }
  showEditorCameraModel(){
    this.setCurrentCameraModelVisibility(true);
  }
  setCurrentCameraModelVisibility(isVisible) {
    [...this.editor.currentCameraEl.children].forEach(el => el.setAttribute('visible', isVisible));
  }
  hideEditorHelpers() {
    const isVisible = false;
    const helper_visibility_array = new Array(this.editor.sceneHelpers.children.length).fill(isVisible);
    return this.setEditorHelpersVisible(helper_visibility_array);
  }
  setEditorHelpersVisible(helper_visibility_array) {
    const editor = this.editor;
    const original_helper_status = [];
    for (let i = 0; i < editor.sceneHelpers.children.length; i++){
      original_helper_status[i] = editor.sceneHelpers.children[i].visible;
      editor.sceneHelpers.children[i].visible = helper_visibility_array[i];
    }
    return original_helper_status;
  }
  convertEquirectangularImageDataToBase64Str(imgData) {
    const canvas = document.createElement("canvas");
    canvas.width = imgData.width;
    canvas.height = imgData.height;
    const context = canvas.getContext("2d");
    context.putImageData(imgData, 0, 0);

    const snapshot = canvas.toDataURL();
    const base64Str = snapshot.split(',')[1];
    return base64Str;    
  }
  captureEquirectangularImageInternal(resolutionType) {
    const resolutionWidth = capture360OutputResolutionTypeToWidthMap[resolutionType];

    const editor = this.editor;
    const renderer = editor.sceneEl.renderer;
    const scene = editor.sceneEl.object3D;
    const camera = editor.currentCameraEl.getObject3D('camera');

    const THREE = window.AFRAME.THREE;
    const cubeCamera = new THREE.CubeCamera( .005, 10000, resolutionWidth );
    const equiUnmanaged = new CubemapToEquirectangular( renderer, false );
    
    // set output size
    equiUnmanaged.setSize(resolutionWidth, resolutionWidth / 2);
    
    cubeCamera.position.copy(camera.getWorldPosition());
    cubeCamera.updateCubeMap( renderer, scene );

    //const isDownloadImgFromFrontEnd = true;
    const isDownloadImgFromFrontEnd = false;

    const imgData = equiUnmanaged.convert( cubeCamera, isDownloadImgFromFrontEnd );

    const imgBase64Str = this.convertEquirectangularImageDataToBase64Str(imgData);
    return imgBase64Str;
  }
  captureEquirectangularImage(resolutionType) {
    return this.doSomethingBetweenHideShowOfEditorHelpers(_ => {
      return this.captureEquirectangularImageInternal(resolutionType);
    });    
  }
  captureEquirectangularVideo(resolutionType, fps, onFrameArrived) {
    this.doSomethingBetweenHideShowOfEditorHelpers(_ => {
      const timeline = this.state.animationTimeline;

      if (timeline) {        
        const totalTime = Math.round(timeline.duration() * 100) / 100;
        const totalFrame = Math.floor(totalTime * fps) + 1;
        let currentFrame = 0;
        console.log('totalFrame:', totalFrame);
        
        timeline.pause();
        while (currentFrame <= totalFrame) {
          const currentTime = currentFrame / fps;
          timeline.seek(currentTime, false);
  
          const imgBase64Str = this.captureEquirectangularImageInternal(resolutionType);
          
          onFrameArrived(currentFrame, totalFrame, imgBase64Str);
          
          currentFrame += 1;
        };
        // add last frame if need, maybe skip at the moment?
        // if (totalFrame * fps < totalTime) {
        //   currentFrame++;
        //   timeline.seek(totalTime, false);
        //   cubeCamera.position.copy(editor.currentCameraEl.getAttribute('position'));
        //   cubeCamera.updateCubeMap( renderer, scene );
        //   const snapshot = equiUnmanaged.convert( cubeCamera, false );
        //   // const b64encoded = btoa(String.fromCharCode.apply(null, snapshot.data));
        //   const b64encoded = bytesToBase64(snapshot.data);
      } else {
        // should be no ways to enter this condition since timeline must be existed
        const imgBase64Str = this.captureEquirectangularImageInternal(resolutionType);
        
        onFrameArrived(1, 1, imgBase64Str);
      }
    });   
  }

  getIsRecording() {
    return this.state.isRecording;
  }
  toggleRecording() {
    
    this.setState(prevState => {
      const editor = this.editor;
      const canvas = editor.container;
      const stream = canvas.captureStream(60);
      const options = { mimeType: "video/webm; codecs=vp9" };
      const mediaRecorder = prevState.mediaRecorder || new MediaRecorder(stream, options);
      // mediaRecorder.ondataavailable = this.handleStreamRecording;
      // mediaRecorder.start();
      return {
        isRecording: !prevState.isRecording,
        mediaRecorder: mediaRecorder,
        recordChunks: []
      };
    }, _ => {
      if (this.state.isRecording) {
        // start recording
        const mediaRecorder = this.state.mediaRecorder;
        mediaRecorder.start();
        console.log(mediaRecorder);
      } else {
        // stop recording
        const mediaRecorder = this.state.mediaRecorder;
        const recordedChunks = [];
        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            recordedChunks.push(event.data);
            // console.log(recordedChunks);
            // download();
            const blob = new Blob(recordedChunks, {
              type: "video/mp4"
            });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            document.body.appendChild(a);
            a.style = "display: none";
            a.href = url;
            console.log(url);
            a.download = "test.mp4";
            a.click();
            window.URL.revokeObjectURL(url);
          }
        }
        mediaRecorder.stop();
      }
    });
  }

  // handleStreamRecording(event) {
  //   if (event.data.size > 0) {
  //     recordedChunks.push(event.data);
  //     console.log(recordedChunks);
  //     download();
  //   } else {
  //     // ...
  //   }
  // }
  seekSlide(timeInSec) {
    if (this.state.animationTimeline) {
      this.state.animationTimeline.seek(timeInSec, false);
    } else {
      this.rebuildTimeline().then(tl => tl.stop().seek(timeInSec, false));
      // this.animationTimeline.play();
    }
  }

  addAsset(newFile) {
    // prevent duplicate assets added
    if (newFile.id) {
      // not checking states, check element instead
      const currentAssetEl = document.getElementById(newFile.id);
      if (currentAssetEl) {
        // currentAssetEl.parentElement.removeChild(currentAssetEl);
        return this.state.assetsData;
      }
    }
    const sceneEl = this.editor.sceneEl;
    let assetEl = sceneEl.querySelector('a-assets');
    // create a-assets element in case not exist
    if (!assetEl) {
      assetEl = document.createElement('a-assets');
      sceneEl.append(assetEl);
    }
    // assetEl.append(el);
    let newEl = null;
    const newId = newFile.id || uuid();
    const newFileUrl = (
      Object.prototype.toString.call(newFile) === '[object File]' ?
        URL.createObjectURL(newFile) :
        (newFile.src?
          newFile.src :
          newFile.filePath
        )
    );
    const newAssetData = {
      id: newId,
      src: newFileUrl,
      type: null,
      shader: 'flat'
    };
    switch (newFile.type) {
      case 'image/svg+xml':
      case 'image/jpeg':
      case 'image/png':
      // for loadProject
      case 'image': {
        // normal still images
        newAssetData.type = mediaType.image;
        newEl = document.createElement('img');
        newEl.setAttribute('id', newId);
        newEl.setAttribute('src', newFileUrl);
        assetEl.append(newEl);
        break;
      }
      // for loadProject
      case 'image/gif':
      case 'gif': {
        // may be animated
        newAssetData.type = mediaType.gif;
        newAssetData.shader = 'gif';
        newEl = document.createElement('img');
        newEl.setAttribute('id', newId);
        newEl.setAttribute('src', newFileUrl);
        assetEl.append(newEl);
        break;
      }
      case 'video/mp4':
      // for loadProject
      case 'video': {
        // video
        newAssetData.type = mediaType.video;
        newEl = document.createElement('video');
        newEl.setAttribute('id', newId);
        newEl.setAttribute('src', newFileUrl);
        assetEl.append(newEl);
        break;
      }
      default: {
        console.log('unsupported files type (image/svg+xml, image/jpeg, image/png, image/gif, video/mp4)');
        console.log('your file: ' + newFile.type);
      }
    }
    this.setState((prevState) => {
      const assetsData = prevState.assetsData;
      let newStateAssetsData = [...assetsData];
      let needInsert = true;
      for (let i = 0; i < assetsData.length; i++) {
        if (assetsData[i].id === newFile.id) {
          needInsert = false;
          break;
        }
      }
      if (needInsert) {
        newStateAssetsData = [
          ...newStateAssetsData,
          newAssetData
        ]
      }
      return {
        assetsData: newStateAssetsData
      }
    });
    return newAssetData;
  }

  resetView() {
    this.editor.EDITOR_CAMERA.position.set(20, 10, 20);
    this.editor.EDITOR_CAMERA.el.setAttribute('position', '0 0 0');
    this.editor.EDITOR_CAMERA.lookAt(0,0,0);
    this.editor.editorControls.center.set(0, 0, 0);
  }

  updateEditor(editor) {
    this.editor = editor;
  }

  toggleEditor() {
    this.editor.toggle();
    // this.forceUpdate();
  }
  render() {
    // console.log('context render');
    const props = this.props;
    const state = this.state;
    // console.log(state.undoQueue, state.redoQueue);
    // console.log(state.animationTimeline);s
    // console.log(state.sceneData);
    // if (!this.editor) return null;
    return (
      <SceneContext.Provider
        value={{
          // functions
          setAppName: this.setAppName,
          getAppName: this.getAppName,
          setProjectName: this.setProjectName,
          getProjectName: this.getProjectName,
          newProject: this.newProject,
          saveProject: this.saveProject,
          loadProject: this.loadProject,

          getSlidesList: this.getSlidesList,
          getCurrentSlide: this.getCurrentSlide,
          getCurrentSlideId: this.getCurrentSlideId,

          addSlide: this.addSlide,
          deleteSlide: this.deleteSlide,
          selectSlide: this.selectSlide,
          sortSlide: this.sortSlide,
          getSlideTotalTime: this.getSlideTotalTime,

          getEntitiesList: this.getEntitiesList,
          getCurrentEntity: this.getCurrentEntity,
          getCurrentEntityId: this.getCurrentEntityId,
          copyEntity: this.copyEntity,

          addEntity: this.addEntity,
          deleteEntity: this.deleteEntity,
          selectEntity: this.selectEntity,
          updateEntity: this.updateEntity,

          getTimelinesList: this.getTimelinesList,
          getCurrentTimeline: this.getCurrentTimeline,
          getCurrentTimelineId: this.getCurrentTimelineId,

          addTimeline: this.addTimeline,
          deleteTimeline: this.deleteTimeline,
          selectTimeline: this.selectTimeline,
          updateTimeline: this.updateTimeline,

          selectTimelinePosition: this.selectTimelinePosition,
          getCurrentTimelinePosition: this.getCurrentTimelinePosition,

          updateTimelinePositionAttributes: this.updateTimelinePositionAttributes,
          // for non timeline
          updateDefaultAttributes: this.updateDefaultAttributes,

          getCurrentTime: this.getCurrentTime,
          updateCurrentTime: this.updateCurrentTime,

          addNewEntity: this.addNewEntity,

          undo: this.undo,
          redo: this.redo,

          getUndoQueueLength: this.getUndoQueueLength,
          getRedoQueueLength: this.getRedoQueueLength,

          playSlide: this.playSlide,
          stopSlide: this.stopSlide,
          slideIsPlaying: state.slideIsPlaying,

          // assets
          addAsset: this.addAsset,

          resetView: this.resetView,
          // editor
          editor: this.editor,
          updateEditor: this.updateEditor,
          toggleEditor: this.toggleEditor,

          takeSnapshot: this.takeSnapshot, 
          captureEquirectangularImage: this.captureEquirectangularImage,
          captureEquirectangularVideo: this.captureEquirectangularVideo,

          getIsRecording: this.getIsRecording,
          toggleRecording: this.toggleRecording,
          // variables, should use functions to return?
          // appName: this.state.appName,
          // projectName: this.state.projectName,
        }}>
        {props.children}
      </SceneContext.Provider>
    );
  }
}
function withSceneContext(Component) {
  return function WrapperComponent(props) {
    return (
      <SceneContext.Consumer>
        {scene => <Component {...props} sceneContext={scene} />}
      </SceneContext.Consumer>
    );
  };
}
export {
  SceneContext,
  SceneContextProvider,
  withSceneContext,

  capture360OutputResolutionTypes,
};