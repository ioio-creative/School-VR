import React, {Component} from 'react';

import {jsonCopy} from 'globals/helperfunctions'
import ABox from 'utils/aframeEditor/aBox';
import ASphere from 'utils/aframeEditor/aSphere';
import ATetrahedron from 'utils/aframeEditor/aTetrahedron';
import ACone from 'utils/aframeEditor/aCone';
import ACylinder from 'utils/aframeEditor/aCylinder';
import ANavigation from 'utils/aframeEditor/aNavigation';
import APlane from 'utils/aframeEditor/aPlane';
import AText from 'utils/aframeEditor/aText';
import ASky from 'utils/aframeEditor/aSky';
import AVideo from 'utils/aframeEditor/aVideo';
import ACamera from 'utils/aframeEditor/aCamera';
import { TimelineMax, TweenMax, Power0 } from 'gsap';

const mergeJSON = require('deepmerge').default;
const Events = require('vendor/Events.js');
const uuid_v1 = require('uuid/v1');
const uuid = _=> 'uuid_' + uuid_v1().split('-')[0];

const entityModel = {
  'a-box': ABox,
  'a-text': AText,
  'a-cone': ACone, //InfoTypeCone,
  'a-cylinder': ACylinder, //InfoTypeCylinder,
  'a-tetrahedron': ATetrahedron,
  'a-sphere': ASphere,
  'a-plane': APlane, //InfoTypePlane,
  'a-triangle': ABox, //InfoTypeTriangle,
  'a-image': ABox, //InfoTypeImage
  'a-video': AVideo,
  'a-camera': ACamera,
  'a-sky': ASky,
  'a-navigation': ANavigation,
}
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
      slideId: undefined,
      entityId: undefined,
      timelineId: undefined,
      
      timelinePosition: undefined,

      currentTime: 0,

      // animationTimeline: null,

      appName: 'School VR',
      projectName: '',
      undoQueue: [],
      redoQueue: []
    }
    this.editor = null;

    this.setAppName = this.setAppName.bind(this);
    this.setProjectName = this.setProjectName.bind(this);
    this.getAppName = this.getAppName.bind(this);
    this.getProjectName = this.getProjectName.bind(this);
    this.newProject = this.newProject.bind(this);
    this.loadProject = this.loadProject.bind(this);

    this.getSlidesList = this.getSlidesList.bind(this);
    this.getCurrentSlide = this.getCurrentSlide.bind(this);
    this.getCurrentSlideId = this.getCurrentSlideId.bind(this);
    
    this.addSlide = this.addSlide.bind(this);
    this.deleteSlide = this.deleteSlide.bind(this);
    this.selectSlide = this.selectSlide.bind(this);
    this.sortSlide = this.sortSlide.bind(this);
    this.getSlideTotalTime = this.getSlideTotalTime.bind(this);

    this.getEntitiesList = this.getEntitiesList.bind(this);
    this.getCurrentEntity = this.getCurrentEntity.bind(this);
    this.getCurrentEntityId = this.getCurrentEntityId.bind(this);
    
    this.addEntity = this.addEntity.bind(this);
    this.deleteEntity = this.deleteEntity.bind(this);
    this.selectEntity = this.selectEntity.bind(this);
    this.updateEntity = this.updateEntity.bind(this);

    this.getTimelinesList = this.getTimelinesList.bind(this);
    this.getCurrentTimeline = this.getCurrentTimeline.bind(this);
    this.getCurrentTimelineId = this.getCurrentTimelineId.bind(this);

    this.addTimeline = this.addTimeline.bind(this);
    this.deleteTimeline = this.deleteTimeline.bind(this);
    this.selectTimeline = this.selectTimeline.bind(this);
    this.updateTimeline = this.updateTimeline.bind(this);

    this.selectTimelinePosition = this.selectTimelinePosition.bind(this);
    this.getCurrentTimelinePosition = this.getCurrentTimelinePosition.bind(this);

    this.updateTimelinePositionAttributes = this.updateTimelinePositionAttributes.bind(this);

    this.getCurrentTime = this.getCurrentTime.bind(this);
    this.updateCurrentTime = this.updateCurrentTime.bind(this);

    this.addNewEntity = this.addNewEntity.bind(this);

    this.undo = this.undo.bind(this);
    this.redo = this.redo.bind(this);
    
    this.getUndoQueueLength = this.getUndoQueueLength.bind(this);
    this.getRedoQueueLength = this.getRedoQueueLength.bind(this);

    this.playSlide = this.playSlide.bind(this);

    this.events = {
      'editor-load': obj => {
        this.editor = obj;
        // try add an id to the scene
        const sceneId = uuid();
        obj.sceneEl.id = sceneId;
        this.setState({
          loaded: true
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
      }
    }
  }
  componentDidMount() {
    const self = this;
    // init the data
    this.startEventListener('editor-load');
    this.startEventListener('objectselected');
    // the event emits when click on canvas
    
  }
  startEventListener(eventName) {
    Events.on(eventName, this.events[eventName])
  }
  stopEventListener(eventName) {
    Events.removeListener(eventName, this.events[eventName]);
  }
  setAppName(newAppName) {
    this.setState({
      appName: newAppName
    })
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
              name: "Camera",
              timelines: []
            }
          ]
        }
      ],
      assets: []
    };
    this.setProjectName(projectName);
    this.loadProject(data);
    this.setState({
      entityId: entityId,
      timelineId: timelineId
    });
  }
  loadProject(data) {
    // need to parse camera data inside data
    
    this.setState({
      sceneData: data,
    }, _=> {
      const cameraEl = document.querySelector('a-camera[el-defaultCamera="true"]');
      this.updateCameraEl(cameraEl);
      this.selectSlide(data.slides[0].id);
    })
  }
  updateCameraEl(cameraEl) {
    this.setState((prevState) => {
      const newSceneData = jsonCopy(prevState.sceneData);
      newSceneData.slides.forEach(slide => {
        const cameraData = slide.entities.find(entity => entity.type='a-camera');
        cameraData.el = cameraEl;
        cameraData.id = cameraEl.getAttribute('id');
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
    const state = jsonCopy(this.state);
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
    this.setState((prevState) => {
      const sceneData = prevState.sceneData;
      if (prevState.slideId) {
        const currentSlide = sceneData.slides.find(slide => slide.id === prevState.slideId);
        currentSlide.entities.forEach(entity => {
          if (entity.type !== 'a-camera') {
            this.editor.removeObject(entity.el.object3D);
          }
        })
      }
      const newSceneData = jsonCopy(prevState.sceneData);
      const newSlide = newSceneData.slides.find(slide => slide.id === slideId);
      newSlide.entities.forEach(entity => {
        if (entity.type !== 'a-camera') {
          entity.el = this.editor.createNewEntity(entity);
          const objectModel = new entityModel[entity.type];
          objectModel.setEl(entity.el);
        }
      })
      return {
        sceneData: newSceneData,
        entityId: null,
        timelineId: null,
        timelinePosition: null,
        animationTimeline: null,
        currentTime: 0,
        slideId: slideId
      }
    }, _=> {
      // console.log(this.editor);
      // debugger;
      this.editor && this.editor.selectEntity(null);
      const newTl = this.rebuildTimeline();
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
  updateEntity(newAttrs, entityId) {
    this.setState((prevState) => {
      // console.log('updateEntity');
      const newSceneData = jsonCopy(prevState.sceneData);
      const slides = newSceneData.slides;
      const currentSlide = slides.find(el => el.id === prevState.slideId);
      const currentEntity = currentSlide.entities.find(el => el.id === entityId);
      // currentEntity.name = newAttrs;
      Object.keys(newAttrs).forEach(key => {
        if (currentEntity['components'].hasOwnProperty(key)) {
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
      currentEntity.timelines.splice(deleteTimelineIdx, 1);
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
    const state = this.state;
    const objectModel = new entityModel[type];
    const elementId = uuid();
    const newElement = {
      type: type,
      id: elementId,
      name: type.split('-')[1],
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
    newElement['components'] = {
      id: elementId,
      ...objectModel.animatableAttributesValues,
      ...objectModel.fixedAttributes
    }
    const newEl = this.editor.createNewEntity(newElement);
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
      this.rebuildTimeline()
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
          entity.el = this.editor.createNewEntity(entity);
        })
        this.startEventListener('objectselected');
        this.rebuildTimeline()
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
          entity.el = this.editor.createNewEntity(entity);
          if (entity.material && entity.material.src) {
            entity.el.setAttribute('material', {
              src: entity.material.src
            })
          }          
        })
        this.startEventListener('objectselected');
        this.rebuildTimeline()
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
  rebuildTimeline() {
    return new Promise((resolve, reject) => {
      // use timelinemax to build the timeline here
      this.setState((prevState) => {
        const currentSlide = prevState.sceneData.slides.find(slide => slide.id === prevState.slideId);
        if (prevState.animationTimeline) {
          // delete old animation timeline
          prevState.animationTimeline.kill();
        }
        const tl = new TimelineMax({
          paused: true
        });
        currentSlide.entities.forEach(entity => {
          // animation here
          const element = entity.el;
          const aEntity = new entityModel[entity['type']](element);
          entity.timelines.forEach(timeline => {
            const {
              start, duration,
              startAttribute, endAttribute
            } = timeline;
            const tmpAttrs = this.flattenJSON(jsonCopy(startAttribute));
            tl.add(TweenMax.to(
              tmpAttrs,
              duration,
              {
                ...this.flattenJSON(endAttribute),
                ease: Power0.easeNone,
                onUpdate: () => {
                  // console.log(tmpAttrs);
                  // Events.emit('refreshsidebarobject3d');
                  aEntity.updateEntityAttributes(this.deFlattenJSON(tmpAttrs));
                }
              }
            ), start);
          })
        })
        // tl.eventCallback('onStart', () => {
        // })
        tl.eventCallback('onUpdate', () => {
          // Events.emit('refreshsidebarobject3d');
          this.setState({
            currentTime: tl.progress() * tl.duration()
          });
        })
        // tl.eventCallback('onComplete', () => {
        //   // Events.emit('refreshsidebarobject3d');
        //   console.log('onComplete');
        //   tl.pause();
        // })
        // tl.play(0, false).stop().seek(0, false);
        // if (autoPlay) {
        //   tl.play(0, false);
        // }
        // console.log(tl.duration());
        resolve(tl);
        // tl.eventCallback('onUpdate', () => {
        //   console.log(tl.progress())
        // })
        return {
          animationTimeline: tl
        }
      })
    });
  }
  // animation function
  playSlide() {
    if (this.state.animationTimeline) {
      // console.log('replay: ', this.state.animationTimeline.duration());
      this.state.animationTimeline.stop().seek(0, false).play();
      
    } else {
      // const autoPlay = true;
      // console.log('rebuild');
      this.rebuildTimeline().then(tl => tl.stop().seek(0, false).play());
      // this.animationTimeline.play();
    }
  }
  seekSlide(timeInSec) {
    if (this.state.animationTimeline) {
      this.state.animationTimeline.seek(timeInSec, false);
    } else {
      this.rebuildTimeline().then(tl => tl.stop().seek(timeInSec, false));
      // this.animationTimeline.play();
    }
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

          getCurrentTime: this.getCurrentTime,
          updateCurrentTime: this.updateCurrentTime,

          addNewEntity: this.addNewEntity,

          undo: this.undo,
          redo: this.redo,

          getUndoQueueLength: this.getUndoQueueLength,
          getRedoQueueLength: this.getRedoQueueLength,

          playSlide: this.playSlide,
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
  withSceneContext
};