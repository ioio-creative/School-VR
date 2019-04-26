import React, {Component} from 'react';
import SystemPanel from 'containers/aframeEditor/homePage/systemPanel';
import ButtonsPanel from 'containers/aframeEditor/homePage/buttonsPanel';
import AFramePanel from 'containers/aframeEditor/homePage/aFramePanel';
import InfoPanel from 'containers/aframeEditor/homePage/infoPanel';
import SlidesPanel from 'containers/aframeEditor/homePage/slidesPanel';
import TimelinePanel from 'containers/aframeEditor/homePage/timelinePanel';
import AssetsPanel from 'containers/aframeEditor/homePage/assetsPanel';

import Editor from 'vendor/editor.js';
import {addEntityAutoType} from 'utils/aframeEditor/aFrameEntities';
import {roundTo, jsonCopy} from 'utils/aframeEditor/helperfunctions';
import {saveProjectToLocalAsync} from 'utils/saveLoadProject/saveProject';
import parseDataToSaveFormat from 'utils/saveLoadProject/parseDataToSaveFormat';
import {TweenMax, TimelineMax, Linear} from 'gsap';

import ProjectFile from 'utils/saveLoadProject/ProjectFile';
import isStrAnInt from 'utils/number/isStrAnInt';
import stricterParseInt from 'utils/number/stricterParseInt';

import handleErrorWithUiDefault from 'utils/errorHandling/handleErrorWithUiDefault';
import loadProjectInEditorPageAsync from './loadProjectInEditorPageAsync';

import './editorPage.css';
const Events = require('vendor/Events.js');
const uuid_0 = require('uuid/v1');
const uuid = _=> 'uuid_' + uuid_0().split('-')[0];

/**
 * deepmerge = jquery $.extend
 * https://github.com/KyleAMathews/deepmerge
 * */

const mergeJSON = require('deepmerge').default;
const jsonSchemaValidator = require('jsonschema').Validator;
const validator = new jsonSchemaValidator();
const schema = require('schema/aframe_schema_20181108.json');


// Check if a suggestedProjectName is already used.
// If name is in use, would suggest a name one.
// Use a callback to set project name.
const defaultProjectNamePrefix = "untitled_";
// must have a trailing number
function setDefaultProjectName(suggestedProjectName = defaultProjectNamePrefix + "1") {
  ProjectFile.getExistingProjectNamesAsync()
    .then(existingProjectNames => {      
      let newProjectName = suggestedProjectName;
      
      const existingProjectNamesWhichStartWithDefaultPrefixAndHaveNumericIdx = existingProjectNames
        .filter((name) => {
          const idxOfDefaultProjectNamePrefix = name.indexOf(defaultProjectNamePrefix);
          
          if (idxOfDefaultProjectNamePrefix !== 0) {
            return false;
          }

          const projectNameStrippedOfDefaultPrefix = name.substr(defaultProjectNamePrefix.length);
          return isStrAnInt(projectNameStrippedOfDefaultPrefix);
        });
      
      const existingProjectIndices = existingProjectNamesWhichStartWithDefaultPrefixAndHaveNumericIdx
        .map((name) => {
          const projectNameStrippedOfDefaultPrefix = name.substr(defaultProjectNamePrefix.length);
          return stricterParseInt(projectNameStrippedOfDefaultPrefix);
        });

      if (existingProjectIndices.length === 0) {
        newProjectName = `${defaultProjectNamePrefix}1`;
      } else {
        const maxExistingProjectIdx = Math.max(...existingProjectIndices);        
        newProjectName = `${defaultProjectNamePrefix}${maxExistingProjectIdx + 1}`;
      }

      Events.emit('setProjectName', newProjectName);
    })
    .catch(err => handleErrorWithUiDefault(err));      
}

function getEntityType(entityEl) {
  const tagName = entityEl.tagName.toLowerCase();
  if (tagName === 'a-entity') {
    // entityEl.getAttribute('geometry')['primitive']
  } else {
    return tagName;
  }
}
function getEntityAnimatableAttrs(entityEl) {
  let componentAttrs = {
    'material': [
      'color', 'opacity',
      // 'transparent', 'shader', 'src'
    ],
    'position': ['x', 'y', 'z'],
    'rotation': ['x', 'y', 'z'],
    'scale':    ['x', 'y', 'z'],
    'src':      'src'
  };
  switch (entityEl.tagName.toLowerCase()) {
    case 'a-box':{
      // no special attributes
      break;
    }
    case 'a-cone':{
      componentAttrs['geometry'] = ['radiusTop', 'radiusBottom'];
      break;
    }
    case 'a-image': {
      componentAttrs['geometry'] = ['width', 'height'];
      componentAttrs['material'].push('shader', 'src');
      break;
    }
    case 'a-sphere':
    case 'a-cylinder':
    case 'a-tetrahedron':
    case 'a-icosahedron': {
      componentAttrs['geometry'] = ['radius'];
      break;
    }
    case 'a-plane': {
      // no special attributes
      break;
    }
    case 'a-triangle': {
      componentAttrs['geometry'] = ['vertexA','vertexB','vertexC'];
      break;
    }
    case 'a-text': {
      componentAttrs['geometry'] = ['primitive', 'width', 'height'];
      componentAttrs['text'] = ['value', 'width', 'align', 'color', 'side', 'wrapCount', 'opacity'];
      break;
    }
    case 'a-video': {
      componentAttrs['geometry'] = ['width', 'height'];
      break;
    }
    case 'a-videosphere': {
      // no special attributes
      break;
    }
    case 'a-camera': {
      // no special attributes
      break;
    }
    case 'a-scene': {
      componentAttrs = {
        'background': 'background'
      }
      break;
    }
    case 'a-entity':
    default: {
      // get all data
      componentAttrs = {
        'material': [
          'color', 'opacity', 'transparent',
          'shader', 'src'
        ],
        'geometry': [
          'primitive',
          'height', 'width', 'depth',
          'radius', 'radiusBottom', 'radiusTop',
          'vertexA', 'vertexB', 'vertexC', 
        ],
        'position': ['x', 'y', 'z'],
        'rotation': ['x', 'y', 'z'],
        'scale':    ['x', 'y', 'z'],
        'text':     ['value', 'width', 'align', 'side', 'wrapCount', 'color'],
        'src':      'src'
      };
      break;
    }
  }
  return componentAttrs;
}

function getEntityState(entityEl) {
  const componentAttrs = getEntityAnimatableAttrs(entityEl);
  const entityAttrs = {};
  Object.keys(componentAttrs).forEach((attr) => {
    const attrType = typeof(componentAttrs[attr]);
    const attrObj = entityEl.getAttribute(attr);
    switch (attrType) {
      case 'string':
        if (attrObj) {
          entityAttrs[attr] = attrObj;
        }
        break;
      case 'object': // array
        entityAttrs[attr] = {};
        componentAttrs[attr].forEach(a => {
          if (attrObj && attrObj[a] !== null) {
            if (Number.isFinite(parseFloat(attrObj[a]))) {
              entityAttrs[attr][a] = roundTo(parseFloat(attrObj[a]),1);
            } else {
              entityAttrs[attr][a] = attrObj[a];
            }
          }
        })
        break;
      default:
        // no default
    }
  })
  return entityAttrs;
}

function setEntityState(entityEl, state) {
  if (state) {
    Object.keys(state).forEach((attr) => {
      entityEl.setAttribute(attr, state[attr]);
    })
  }
}

/**
 * flattenState turn nested object to single level object
 * e.g. turn
 * {
 *   "geometry": {
 *    "position": {
 *      "x": 1, "y": 2, "z": 3  
 *    }
 *   }
 * } 
 * to
 * {
 *  "geometry.position.x": 1,
 *  "geometry.position.y": 2,
 *  "geometry.position.z": 3
 * }
 */
function flattenState(state, prefix = '') {
  let flatted = {};
  Object.keys(state).forEach((attr) => {
    let key = (prefix !== '' ? prefix + '.' + attr: attr);
    if (Object.prototype.toString.call(state[attr]) === '[object Object]') {
      flatted = mergeJSON(flatted, flattenState(state[attr], key));
    } else {
      flatted[key] = jsonCopy(state[attr]);
      return flatted;
    }
  })
  return flatted;
}

// window.getEntityState = getEntityState;
// window.flattenState = flattenState;
// window.deFlattenState = deFlattenState;
/**
 * deFlattenState revert the process flattenState done
 * e.g. turn
 * {
 *  "geometry.position.x": 1,
 *  "geometry.position.y": 2,
 *  "geometry.position.z": 3
 * } 
 * to
 * {
 *   "geometry": {
 *    "position": {
 *      "x": 1, "y": 2, "z": 3  
 *    }
 *   }
 * }
 */
function deFlattenState(state) {
  let nested = {};
  Object.keys(state).forEach((attr) => {
    const key = attr.split('.')[0];
    const remain = attr.split('.').slice(1).join('.');
    // console.log(remain);
    if (remain) {
      const tmp = {};
      tmp[remain] = state[attr];
      if (nested[key] === undefined) {
        nested[key] = {};
      }
      nested[key] = mergeJSON(
        nested[key], 
        deFlattenState(tmp)
      );
    } else {
      nested[key] = state[key];
    }
  })
  return nested;
}

function addToEntitieslist(currentList, entity) {
  let entityEl = entity.el;
  if (!entity.el && entity.isScene) {
    entity.object3D.el = entity;
    entityEl = entity;
  }
  if (entityEl && !entityEl.dataset.isInspector && entityEl.isEntity && !entityEl.isInspector) {
    if (entityEl.components && entityEl.components['light']) {
      return false;
    }
    let entityId = entityEl.getAttribute('id');
    if (!entityId) {
      entityId = uuid();
      entityEl.setAttribute('id', entityId);
    }
    if (currentList[entityId]) {
      return false;
    }
    currentList[entityId] = {
      type: entityEl.tagName.toLowerCase(),
      name: entityEl.getAttribute('el-name') || entityEl.tagName.toLowerCase(),
      isSystem: entityEl.getAttribute('el-isSystem') === "true" || entityEl.isScene,
      // children: null,
      // parent: null,
      el:  entityEl,
      // component: getEntityState(entityEl), // need to move into the timeline later
      slide: {
        // "slideId": {
        //   "timeline": {
        //     "timelineId": {
        //       "time": "1",
        //       "duration": "1",
        //       "startAttribute": {
        //         "attribute1": "value1"
        //       }
        //       "endAttribute": {
        //         "attribute1": "value2"
        //       }
        //     }
        //   }
        // }
      },
      undoList: [
        // {
        //   slideId: {
        //     timelineId: {
        //       "time": "1",
        //       "duration": "2",
        //       "startAttribute": {
        //         "attribute1": "value1"
        //       }
        //       "endAttribute": {
        //         "attribute1": "value2"
        //       }
        //     }
        //   }
        // }
      ],
      redoList: []
    }
    return entityId;
  }
  return false;
}

function removeFromEntitieslist(currentList, entityId) {
  if (!entityId) {
    return currentList;
  }
  delete currentList[entityId];
  return currentList;
}

function getPrevNextTimeline(allTimeline, start) {
  let prevTimeline = null;
  let prevTimeInterval = start;
  let nextTimeline = null;
  let nextTimeInterval = Infinity;
  Object.keys(allTimeline).forEach(timelineId => {
    const searchingSlide = allTimeline[timelineId];
    if (searchingSlide['start'] > start && searchingSlide['start'] < start + nextTimeInterval) {
      nextTimeline = timelineId;
      nextTimeInterval = searchingSlide['start'] - start;
    }
    if (searchingSlide['start'] < start && (start - (searchingSlide['start'] + searchingSlide['duration'])) < prevTimeInterval) {
      prevTimeline = timelineId;
      prevTimeInterval = start - (searchingSlide['start'] + searchingSlide['duration']);
    }
  })
  return {
    prevTimeline: prevTimeline,
    nextTimeline: nextTimeline
  };
}

class SaveDebug extends Component{
  constructor(props) {
    super(props);
    const entitiesList = parseDataToSaveFormat(props.projectName, props.entitiesList, props.assetsList);
    this.state = {
      output: JSON.stringify(entitiesList, null, 2)
    };
  }
  componentDidUpdate(prevProps, prevState) {
    const props = this.props;
    const entitiesList = parseDataToSaveFormat(props.projectName, props.entitiesList, props.assetsList);
    // console.log(props.assetsList);
    // const oldEntitiesList = parseDataToSaveFormat(prevProps.projectName, prevProps.entitiesList, prevProps.assetsList);
    if (prevState.output !== this.state.output) {
      return true;
    } else if (JSON.stringify(entitiesList, null, 2) !== this.state.output) {
      this.setState({
        output: JSON.stringify(entitiesList, null, 2)
      });
    }
  }
  render() {
    return (<div id="save-debug-panel">
      <div className="json-display">
        <textarea ref={(ref) => this.saveDebugText = ref }
          style={{resize: "none", width: "100%", height: "100%"}}
          value={this.state.output}
          onChange={(event)=>{
            this.setState({
              output: event.target.value
            })
          }}
        />
      </div>
      <div className="btn-list">
        <div className="btn btn-save" 
          onClick={() => {
            Events.emit('saveProject');
          }}
        >
          Copy to clipboard
        </div>
        <div className="btn btn-load" 
          onClick={() => {
            const text = this.saveDebugText.value;
            Events.emit('loadProject', text);
          }}
        >
          Load
        </div>
      </div>
    </div>);
  }
}
class EditorPage extends Component {
  constructor(props) {
    super(props);
    this.projectName = null;
    setDefaultProjectName();
    this.globalTimeline = new TimelineMax({
      paused: true
    });
    this.inited = false;
    this.camera = null;
    this.editor = null;
    this.editorEnabled = true;
    this.entitiesList = {};
    this.slideList = {};
    this.timelineList = {};
    this.assetsList = [];
    this.selectedEntity = null;
    this.selectedSlide = null;
    this.selectedTimeline = null;
    this.selectedTimelinePosition = null;
    this.showControls = false;
    this.showDebug = false;
    this.selectingAssets = false;
    this.currentTime = 0;
    this.undoList = [];
    this.redoList = [];
    this.initEvents = this.initEvents.bind(this);
    this.registerEvents = this.registerEvents.bind(this);
    this.unregisterEvents = this.unregisterEvents.bind(this);
    this.updateTimeline = this.updateTimeline.bind(this);
    this.seekTimeline = this.seekTimeline.bind(this);
    this.previewTimeline = this.previewTimeline.bind(this);
    this.addSlide = this.addSlide.bind(this);
    this.removeSlide = this.removeSlide.bind(this);
    this.addTimeline = this.addTimeline.bind(this);
    this.queueUndo = this.queueUndo.bind(this);
    this.queueRedo = this.queueRedo.bind(this);
    this.undo = this.undo.bind(this);
    this.redo = this.redo.bind(this);
    this.emptyRedoList = this.emptyRedoList.bind(this);
    //this.updateAssetsList = this.updateAssetsList.bind(this);
  }
  async componentDidMount() {    
    this.editor = new Editor();
    this.initEvents();
    Events.emit('addSlide');
    const sceneId = addToEntitieslist(this.entitiesList, document.querySelector('a-scene'));
    this.entitiesList[sceneId]['slide'][this.selectedSlide] = {
      "timeline": {}
    };
    this.inited = true;
    console.log(process.env.username || process.env.user || process.platform);
    
    await loadProjectInEditorPageAsync(this);
  }
  initEvents() {
    const self = this;
    this.events = {
      setProjectName: (newName) => {
        self.projectName = newName;
        self.forceUpdate();
      },
      setTimelinePositionSelected: (entityId, slideId, timelineId, position) => {
        // console.log('setTimelinePositionSelected', entityId, slideId, timelineId, position);
        self.selectedEntity = entityId;
        self.selectedSlide = slideId;
        self.selectedTimeline = timelineId;
        self.selectedTimelinePosition = position;
        self.showControls = entityId && slideId && timelineId && position;
        if (self.showControls) {
          const selectedTimelineObj = self.entitiesList[entityId]['slide'][slideId]['timeline'][timelineId];
          const selectedTime = (position === "startAttribute"? selectedTimelineObj.start + 0.001: selectedTimelineObj.start + selectedTimelineObj.duration - 0.001);
          self.updateTimeline();
          self.seekTimeline(selectedTime);
        } else {
          self.updateTimeline();
        }
        if (self.entitiesList[entityId]) {
          if (!self.entitiesList[entityId]['el']['isScene']) {
            // tmp fix for the camera cannot drag
            if (self.entitiesList[entityId]['el'].getObject3D('camera')) {
              Events.emit('objectselectedfromtimeline', self.entitiesList[entityId]['el'].getObject3D('camera'), self.showControls);
            } else {
              Events.emit('objectselectedfromtimeline', self.entitiesList[entityId]['el']['object3D'], self.showControls);
            }
          } else {
            // self.selectedEntity = entityId;
            // self.selectedSlide = slideId;
            Events.emit('disablecontrols');
            self.forceUpdate();
          }
        } else {
          Events.emit('objectselectedfromtimeline', null);
          self.forceUpdate();
        }
        // no need forceUpdate since objectselected event will forceUpdate
      },
      setTimelineTime: selectedTime => {
        // add 0.001 to make the time 0 seekable
        self.seekTimeline(selectedTime + 0.001);
        self.currentTime = selectedTime;
        self.forceUpdate();
      },
      previewTimeline: () => {
        Events.emit('objectselectedfromtimeline', null);
        self.selectedEntity = null;
        self.selectedTimeline = null;
        self.selectedTimelinePosition = null;
        self.previewTimeline();
      },
      addSlide: (newSlideId) => {
        self.addSlide(newSlideId);
      },
      addTimeline: (entityId, slideId, start, duration = 5, newTimelineId, presetAttributes = null) => {
        self.addTimeline(entityId, slideId, start, duration);
        // Events.emit('setTimelinePositionSelected', entityId, slideId, newTimelineId, 'startAttribute');
      },
      updateTimeline: (entityId, slideId, timelineId, start, duration) => {
        // console.log(start, duration);
        self.selectedTimeline = timelineId;
        const selectedSlideObj = self.slideList[slideId];
        const selectedTimelineObj = self.entitiesList[entityId]['slide'][slideId]['timeline'][timelineId];


        selectedTimelineObj['start'] = start;
        if (duration !== undefined) {
          selectedTimelineObj['duration'] = duration;
        }
        // store the selected info since take snapshot will deselect everythings
        const selectedTimelinePosition = self.selectedTimelinePosition;
        self.updateTimeline();
        
        self.selectedTimeline = timelineId;
        // move the seek pointer to the new position
        if (selectedTimelinePosition) {
          self.selectedTimelinePosition = selectedTimelinePosition;
          const selectedTime = (self.selectedTimelinePosition === "startAttribute"? selectedTimelineObj.start + 0.001: selectedTimelineObj.start + selectedTimelineObj.duration - 0.001);
          self.seekTimeline(selectedTime);
        }
        self.forceUpdate();
      },
      deleteTimeline: (entityId, slideId, timelineId) => {
        delete self.entitiesList[entityId]['slide'][slideId]['timeline'][timelineId];
        // Events.emit('objectselected', self.entitiesList[entityId]['el']['object3D'], false);
        self.selectedTimeline = null;
        self.selectedTimelinePosition = null;
        Events.emit('disablecontrols');
        self.updateTimeline();
        self.forceUpdate();
      },
      deleteEntity: (entityId) => {
        Events.emit('removeObject', self.entitiesList[entityId]['el']['object3D']);
      },
      updateEntityName: (entityId, newName) => {
        self.entitiesList[entityId]['name'] = newName;
        self.forceUpdate()
      },
      // below are the events emit by the editor
      // maybe later change all the event names
      // so that the events won't trigger inspector?
      editormodechanged: active => {
        self.editorEnabled = active;
        self.forceUpdate();
      },
      objectadded: obj => {
        const newEntityId = addToEntitieslist(self.entitiesList, obj);
        if (newEntityId) {
          self.entitiesList[newEntityId]['slide'][self.selectedSlide] = {
            "timeline": {}
          };
          Events.emit('disablecontrols');
        }
        if (self.inited) {
          // console.log('hello');
          Events.emit('setTimelinePositionSelected', newEntityId, self.selectedSlide);
        }
        // self.forceUpdate();
        // queue the initial objects state here, use for undo/redo
        // const entityEl = obj.el;
        // const entityId = entityEl.getAttribute('id');
        // if (entityId && !entityEl.getAttribute('el-isSystem')) {
        //   self.redoList.length = 0;
        //   // self.emptyRedoList();
        //   self.undoList.push({
        //     'id': entityEl.getAttribute('id'),
        //     'event': 'objectAdded'
        //     // 'state': getEntityState(entityEl)
        //   });
        //   self.state.entities_list[entityId]['undoList'].push(
        //     getEntityState(entityEl)
        //   );
        // }
      },
      updateSelectedEntityAttribute: attr => {
        const entityId = self.selectedEntity;
        const slideId = self.selectedSlide;
        const timelineId = self.selectedTimeline;
        const position = self.selectedTimelinePosition;
        if (entityId && slideId && timelineId && position) {
          const selectedTimelineObj = self.entitiesList[entityId]['slide'][slideId]['timeline'][timelineId];
          const key = Object.keys(attr)[0];
          const fields = key.split('.');
          const selectedTime = (position === "startAttribute"? selectedTimelineObj.start + 0.001: selectedTimelineObj.start + selectedTimelineObj.duration - 0.001);
          let targetField = selectedTimelineObj[position];
          for (let i = 0; i < fields.length - 1; i++) {
            const field = fields[i];
            // if (typeof(targetField[field]) === "object") {
              targetField = targetField[field];
            // } else {
              // break;
            // }
          }
          targetField[fields[fields.length - 1]] = Object.values(attr)[0];
          // console.log(selectedTimelineObj, Object.values(attr)[0]);
          self.updateTimeline();
          self.seekTimeline(selectedTime);
          self.forceUpdate();
        }
      },
      objectchanged: obj => {
        // const entityEl = obj.el;
        // const entityId = entityEl.getAttribute('id');
        // // const prevState = self.state.entities_list[entityId]['component'];
        // // self.redoList.length = 0;
        // self.emptyRedoList();
        // self.undoList.push({
        //   'id': entityId,
        //   'event': 'objectChanged'
        // });
        
        // if (self.state.entities_list[entityId]) {
        //   self.state.entities_list[entityId]['undoList'].push(
        //     getEntityState(entityEl)
        //   );
        //   self.updateEntity();          
        //   // self.state.entities_list[entityId]['component'] = getEntityState(obj.el);
          
        //   // add self to make the first action undo able
        //   setEntityState(entityEl, getEntityState(entityEl));
        // }
        const entityId = self.selectedEntity;
        const slideId = self.selectedSlide;
        const timelineId = self.selectedTimeline;
        const position = self.selectedTimelinePosition;
        if (entityId && slideId && timelineId && position) {
          const selectedTimelineObj = self.entitiesList[entityId]['slide'][slideId]['timeline'][timelineId];
          // const selectedTime = (position === "startAttribute"? selectedTimelineObj.start + 0.01: selectedTimelineObj.start + selectedTimelineObj.duration - 0.01);
          selectedTimelineObj[position] = getEntityState(obj.el);
          // self.seekTimeline(selectedTime);
          self.forceUpdate();
        }
      },
      objectbeforeremoved: entityEl => {
        // store the object to undo / redo list before it is deleted
        const entityId = entityEl.getAttribute('id');
        if (self.entitiesList[entityId]) {
          self.queueUndo({
            'type': 'entityRemove',
            'entityId': entityId,
            'entityEl': self.entitiesList[entityId]
          })
        }
        removeFromEntitieslist(self.entitiesList, entityId);
        self.updateTimeline();
        self.forceUpdate();
        // const prevState = getEntityState(entityEl);
        // self.redoList.length = 0;
        // self.emptyRedoList();
        // self.undoList.push({
        //   'id': entityId,
        //   'event': 'objectRemoved',
        //   'entity': self.entitiesList[entityId],
        //   // 'state': prevState
        // });
        // self.setState((currentState) => {
        //   return {
        //     'entities_list': removeFromEntitieslist(currentState.entities_list, entityEl.object3D)
        //   };
        // });
      },
      objectselected: (obj, enableControls = false) => {
        if (enableControls) {
          Events.emit('enablecontrols');
        } else {
          Events.emit('disablecontrols');
        }
        self.selectedEntity = (obj? (obj.el? obj.el.getAttribute('id'): null): obj);
        if (self.selectedEntity === null) {
          self.selectedTimeline = null;
          self.selectedTimelinePosition = null;
        }
        self.forceUpdate();
      },
      undo: () => {
        self.undo();
        // 
      },
      redo: () => {
        self.redo();
      },
      addAsset: (type, id, url) => {
        // or only query the elements in a-assets when save?
        self.assetsList.push({
          "media_type": type,
          "id": id,
          "src": url,
        });
        //console.log(self.assetsList);
      },
      removeSlide: (slideId) => {
        self.removeSlide(slideId);
      },
      updateEntityText: (entityId, text) => {
        console.log(self.entitiesList[entityId]);
        self.entitiesList[entityId].el.setAttribute('text', {value: text});
        self.forceUpdate();
      },
      newProject: () => {
        try {
            self.inited = false;
            // do load data
            // clear current scene
            Object.keys(self.entitiesList).forEach(entityId => {
              if (self.entitiesList[entityId]['el']['isScene']) {
                self.entitiesList[entityId]['el'].removeAttribute('id');
                delete self.entitiesList[entityId];
              } else {
                self.entitiesList[entityId]['el'].removeFromParent();
              }
            })
            Object.keys(self.slideList).forEach(slideId => {
              delete self.slideList[slideId];
            })
            // initialize
            self.projectName = null;
            setDefaultProjectName();
            self.addSlide();
            const scene = document.querySelector('a-scene');
            scene.setAttribute('el-name', 'Background');
            const sceneId = addToEntitieslist(self.entitiesList, scene);
            self.entitiesList[sceneId]['slide'][self.selectedSlide] = {
              "timeline": {}
            };
            addEntityAutoType('a-camera');            
            self.currentTime = 0;
            setTimeout(()=>{
              self.selectedEntity = null;
              self.selectedTimeline = null;
              self.selectedTimelinePosition = null;
              self.inited = true;
              self.forceUpdate();
            }, 0);
        } catch(e) {
          alert(e);
        }
      },
      saveProject: () => {               
        saveProjectToLocalAsync(self.projectName, self.entitiesList, self.assetsList)
          .then((data) => {
            const projectJson = data.projectJson;
            const projectJsonStr = JSON.stringify(projectJson);
            //console.log(projectJsonStr);        

            // call electron save api here
            //navigator.clipboard.writeText(projectJsonStr);
            
            alert(`Data: ${JSON.stringify(data)}`);
          })
          .catch(err => handleErrorWithUiDefault(err));                    
      },
      loadProject: (data) => {
        try {
          console.log(JSON.stringify(data));
          if (validator.validate(data, schema).valid) {
            self.inited = false;
            // do load data
            // clear current scene
            Object.keys(self.entitiesList).forEach(entityId => {
              if (self.entitiesList[entityId]['el']['isScene']) {
                self.entitiesList[entityId]['el'].removeAttribute('id');
                delete self.entitiesList[entityId];
              } else {
                self.entitiesList[entityId]['el'].removeFromParent();
              }
            })
            Object.keys(self.slideList).forEach(slideId => {
              delete self.slideList[slideId];
            })
            // get form data
            self.projectName = data.project_name;
            data["entities_list"].forEach(entityEntry => {
              entityEntry["slides"].forEach(slideEntry => {
                if (!self.slideList[slideEntry]) {
                  self.addSlide(slideEntry['id']);
                }
              })
              if (entityEntry['entity_type'] !== 'a-scene') {
                addEntityAutoType(entityEntry['entity_type'], entityEntry['id']);
              } else {
                const scene = document.querySelector('a-scene');
                scene.setAttribute('id', entityEntry['id']);
                const sceneId = addToEntitieslist(self.entitiesList, scene);
                self.entitiesList[sceneId]['slide'][self.selectedSlide] = {
                  "timeline": {}
                };
              }
              if (self.entitiesList[entityEntry['id']])
                // set back the name
                self.entitiesList[entityEntry['id']]['name'] = entityEntry['name'];
              entityEntry["slides"].forEach(slideEntry => {
                slideEntry['timelines'].forEach(timelineEntry => {
                  self.addTimeline(
                    entityEntry['id'], slideEntry['id'], 
                    timelineEntry['start'], timelineEntry['duration'], 
                    timelineEntry['id'], 
                    {
                      startAttribute: timelineEntry['startAttribute'], 
                      endAttribute: timelineEntry['endAttribute']
                    }
                  );
                })
              });
            })
            self.currentTime = 0;
            setTimeout(()=>{
              self.selectedEntity = null;
              self.selectedTimeline = null;
              self.selectedTimelinePosition = null;
              self.inited = true;
              self.forceUpdate();
            }, 0);
            // self.inited = true;

            // Object.keys(entitiesList).forEach(entityId => {
            //   const currentEntity = entitiesList[entityId];
            //   const entityEntry = {
            //     "id": entityId,
            //     "name": currentEntity["name"],
            //     "entity_type": currentEntity["type"],
            //     "slides": []
            //   };
            //   Object.keys(currentEntity["slide"]).forEach(slideId => {
            //     const currentSlide = currentEntity["slide"][slideId];
            //     const slideEntry = {
            //       "id": slideId,
            //       "timelines": []
            //     };
            //     Object.keys(currentSlide["timeline"]).forEach(timelineId => {
            //       slideEntry["timelines"].push({
            //         "id": timelineId,
            //         ...currentSlide["timeline"][timelineId]
            //       })
            //     })
            //     entityEntry["slides"].push(slideEntry);
            //   })
            //   resultJson["entities_list"].push(entityEntry);
            // })

          } else {
            console.log(validator.validate(data, schema));
            throw "schema validation failed";
          };
        } catch(e) {
          alert(e);
        }
      },
      toggleDebug: () => {
        self.showDebug = !self.showDebug;
        self.forceUpdate();
      }
    };
    this.registerEvents();
  }
  registerEvents() {
    for (let eventName in this.events) {
      Events.on(eventName, this.events[eventName]);
    }
  }
  unregisterEvents() {
    for (let eventName in this.events) {
      Events.removeListener(eventName, this.events[eventName]);
    }
  }
  addSlide(newSlideId) {
    if (!newSlideId) {
      newSlideId = uuid();
    }
    this.slideList[newSlideId] = {
      slideImages: [],
      totalTime: 0
    }
    this.selectedSlide = newSlideId;
    this.forceUpdate();
  }
  removeSlide(slideId) {
    if (Object.keys(this.slideList).length < 2) return;
    const oldIdx = Object.keys(this.slideList).indexOf(slideId);
    let nextSlide = '';
    if (oldIdx === 0) {
      nextSlide = Object.keys(this.slideList)[1];
    } else {
      nextSlide = Object.keys(this.slideList)[oldIdx - 1];
    }
    delete this.slideList[slideId];
    this.selectedSlide = nextSlide;
    this.forceUpdate();
  }
  addTimeline(entityId, slideId, start, duration = 5, newTimelineId, presetAttributes = null) {
    const self = this;
    if (!newTimelineId) {
      newTimelineId = uuid();
    }
    const entityEl = this.entitiesList[entityId]['el'];
    const allSlides = this.entitiesList[entityId]['slide'];
    if (!allSlides[slideId]) {
      allSlides[slideId] = {
        timeline: {}
      };
    }
    if (!allSlides[slideId]['timeline'][newTimelineId]) {
      allSlides[slideId]['timeline'][newTimelineId] = {};
    }
    const newTimeline = allSlides[slideId]['timeline'][newTimelineId];
    let prevEndAttribute = {};
    let nextStartAttribute = {};
    let nextTimeInterval = duration;
    if (presetAttributes === null) {
      const {prevTimeline, nextTimeline} = getPrevNextTimeline(allSlides[slideId]['timeline'], start);
      if (prevTimeline && nextTimeline) {
        prevEndAttribute = allSlides[slideId]['timeline'][prevTimeline]['endAttribute'];
        nextStartAttribute = allSlides[slideId]['timeline'][nextTimeline]['startAttribute'];
        nextTimeInterval = allSlides[slideId]['timeline'][nextTimeline]['start'] - start;
      } else if (prevTimeline) {
        prevEndAttribute = allSlides[slideId]['timeline'][prevTimeline]['endAttribute'];
        nextStartAttribute = prevEndAttribute;
      } else if (nextTimeline) {
        nextStartAttribute = allSlides[slideId]['timeline'][nextTimeline]['startAttribute'];
        prevEndAttribute = nextStartAttribute;
        nextTimeInterval = allSlides[slideId]['timeline'][nextTimeline]['start'] - start;
      } else {
        prevEndAttribute = nextStartAttribute = getEntityState(entityEl);
      }
    } else {
      prevEndAttribute = presetAttributes['startAttribute'];
      nextStartAttribute = presetAttributes['endAttribute'];
    }
    
    newTimeline['start'] = start;
    newTimeline['duration'] = Math.min(duration, nextTimeInterval);
    newTimeline['startAttribute'] = jsonCopy(prevEndAttribute);
    newTimeline['endAttribute'] = jsonCopy(nextStartAttribute);
    self.selectedEntity = entityId;
    self.selectedSlide = slideId;
    self.selectedTimeline = newTimelineId;
    self.selectedTimelinePosition = 'startAttribute';
    if (!entityEl.isScene) {
      Events.emit('entityselected', entityEl)
    }
    Events.emit('disablecontrols');
    self.updateTimeline();
    self.seekTimeline(start);
    self.forceUpdate();
  }
  updateTimeline() {
    const self = this;
    if (!self.slideList[self.selectedSlide]) return;
    const globalTimeline = self.globalTimeline;
    const entitiesList = self.entitiesList;
    globalTimeline.clear();
    globalTimeline.pause();
    Object.keys(entitiesList).forEach(entityId => {
      const entity = entitiesList[entityId];
      const slide = entity["slide"][self.selectedSlide];
      if (slide) {
        const allTimeline = entity["slide"][self.selectedSlide]["timeline"];
        Object.keys(allTimeline).forEach(timelineId => {
          const timeline = allTimeline[timelineId];
          // const initval = jsonCopy(timeline.startAttribute);
          const onUpdate = function(newState) {
            setEntityState(entity.el, deFlattenState(newState));
          }
          const tweenAttribute = jsonCopy(flattenState(timeline.startAttribute));
          const startAttribute = jsonCopy(flattenState(timeline.startAttribute));
          const endAttribute = jsonCopy(flattenState(timeline.endAttribute));
          const tween = TweenMax.fromTo(tweenAttribute, timeline.duration, startAttribute, {...endAttribute, ease: Linear.easeNone, onUpdate: onUpdate, onUpdateParams:[tweenAttribute]});
          globalTimeline.add(tween, timeline.start);
        })
      }
    })
    globalTimeline.add(()=>{globalTimeline.pause()});
    globalTimeline.eventCallback('onUpdate', function() {
      // console.log(this.time());
      self.currentTime = this.time();
      self.forceUpdate();
    })
    const totalTime = globalTimeline.duration();
    self.slideList[self.selectedSlide]['totalTime'] = totalTime;
    if (self.currentTime > totalTime) {
      self.currentTime = totalTime
    }
  }
  seekTimeline(selectedTime) {
    this.currentTime = selectedTime;
    this.globalTimeline.stop();
    this.globalTimeline.seek(selectedTime, false);
  }
  previewTimeline() {
    this.updateTimeline();
    // try generate some image
    const self = this;
    const totalTime = self.slideList[self.selectedSlide]['totalTime'];
    if (totalTime > 0) {
      self.slideList[self.selectedSlide]['slideImages'].length = 0;
      Events.removeListener('objectselected', this.events['objectselected']);
      const imageToGenerate = 10;
      const timeInterval = totalTime / imageToGenerate;
      for (let i = 0.0; i <= totalTime; i += timeInterval) {
        self.seekTimeline(i);
        Events.emit('takeSnapshot', result => {
          self.slideList[self.selectedSlide]['slideImages'].push(result['image']);
        })
      }
      Events.on('objectselected', this.events['objectselected']);
    }
    // if (this.editorEnabled === false) {
      const vids = document.querySelectorAll('video');
      vids.forEach(v => {
        v.currentTime = 0;
        v.play();
      });
      this.globalTimeline.eventCallback("onComplete", ()=>{
        vids.forEach(v=>{
          v.pause()
        });
      })
    // }
    self.seekTimeline(0);
    this.globalTimeline.play(0);
  }
  // updateAssetsList() {
  //   // query a-assets
  //   const assetsEl = document.querySelector('a-asset');
  //   if (assetsEl) {
  //     this.assetsList.length = 0;
  //     const assets = assetsEl.children;
  //     // https://stackoverflow.com/questions/22754315/for-loop-for-htmlcollection-elements
  //     for (let asset of assets) {
  //       this.assetsList.push({
  //         /* TODO: */
  //         "media_type": (asset.tagName === "img"? "image": "video") (asset.tagName === "img"? "image": "video"),
  //         "src": asset.src,
  //         "id": asset.id
  //       });        
  //     }
  //   }    
  // }
  queueUndo(data) {
    this.undoList.push(data);
  }
  queueRedo(data) {
    this.redoList.push(data);
  }
  undo() {
    // undo !!!
    const lastAction = this.undoList.pop();
    console.log('undo');
    switch (lastAction['type']) {
      case 'entityRemove': {
        const entityId = addToEntitieslist(this.entitiesList, lastAction.entityEl);
        this.editor.sceneEl.append(lastAction.entityEl.el);
        lastAction.entityEl.el.object3D.el = lastAction.entityEl.el;
        this.queueRedo({
          'type': 'entityAdd',
          'entityId': entityId,
          'entityEl': lastAction.entityEl
        })
        // this.selectedEntity = lastAction['entityId'];
        break;
      }
    }
    this.forceUpdate();
  }
  redo() {
    // redo !!!
    if (this.redoList.length > 0) {
      const lastAction = this.redoList.pop();
      switch (lastAction['type']) {
        case 'entityAdd': {
          this.queueUndo({
            'type': 'entityRemove',
            'entityId': lastAction['entityId'],
            'entityEl': lastAction['entityEl']
          })
          removeFromEntitieslist(this.entitiesList, lastAction['entityId']);
          // this.editor.sceneEl.append(lastAction.entityEl.el);
          break;
        }
      }
      this.forceUpdate();
    }
  }
  emptyRedoList() {
    this.redoList.length = 0;
  }

  componentWillUnmount() {
    this.unregisterEvents();
  }
  render() {
    return (
      <div id="editor">
        <SystemPanel projectName={this.projectName} />
        {this.editorEnabled && <ButtonsPanel
          selectedEntity={this.selectedEntity}
        />}
        <AFramePanel />
        
        {this.editorEnabled && <InfoPanel 
          selectedEntity={this.selectedEntity}
          selectedSlide={this.selectedSlide}
          selectedTimeline={this.selectedTimeline}
          selectedTimelinePosition={this.selectedTimelinePosition}
          entitiesList={this.entitiesList}
          editor={this.editor}
        />}
        
        {this.inited && <SlidesPanel 
          selectedSlide={this.selectedSlide}
          slideList={this.slideList}
        />}
        {this.inited && <TimelinePanel
          selectedEntity={this.selectedEntity}
          selectedSlide={this.selectedSlide}
          selectedTimeline={this.selectedTimeline}
          selectedTimelinePosition={this.selectedTimelinePosition}
          entitiesList={this.entitiesList}
          currentTime={this.currentTime}
          totalTime={this.slideList[this.selectedSlide]['totalTime']}
          timeline={this.globalTimeline}
          editorEnabled={this.editorEnabled}
        />}
        {/* <UndoRedoDebug undoList={this.undoList} redoList={this.redoList} /> */}
        {this.showDebug && 
          <SaveDebug projectName={this.projectName} entitiesList={this.entitiesList} assetsList={this.assetsList} />
        }
        {/* {this.selectingAssets && <AssetsPanel />} */}
        {/* <AssetsPanel /> */}
      </div>
    );
  }
}

export default EditorPage;
