/*
  Right Panel should be something that show the selected entity's info ( ◲ )
  ▫▫▫▫▫▫▫▫▫▫▫
  ▭ ┌──────┐
  ▭ │AFRAME│
  ▭ └──────◲
*/
import React, {Component, Fragment} from 'react';
// import EntitiesList from 'containers/aframeEditor/panelItem/entitiesList';

import infoRenderer from 'containers/aframeEditor/homePage/infoPanel/infoTypeBox';
// import InfoTypeCone from 'containers/aframeEditor/homePage/infoPanel/infoTypeCone';
// import InfoTypeCylinder from 'containers/aframeEditor/homePage/infoPanel/infoTypeCylinder';
// import InfoTypePlane from 'containers/aframeEditor/homePage/infoPanel/infoTypePlane';
// import InfoTypeTriangle from 'containers/aframeEditor/homePage/infoPanel/infoTypeTriangle';
// import InfoTypeImage from 'containers/aframeEditor/homePage/infoPanel/infoTypeImage';
// import InfoTypeCamera from 'containers/aframeEditor/homePage/infoPanel/infoTypeCamera';
// import InfoTypeBackground from 'containers/aframeEditor/homePage/infoPanel/infoTypeBackground';



import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
// import {roundTo} from 'globals/helperfunctions';

import './infoPanel.css';
import { withSceneContext } from 'globals/contexts/sceneContext';

import ABox from 'utils/aframeEditor/aBox';
import ASphere from 'utils/aframeEditor/aSphere';
import ACone from 'utils/aframeEditor/aCone';
import ANavigation from 'utils/aframeEditor/aNavigation';
import APlane from 'utils/aframeEditor/aPlane';
import AText from 'utils/aframeEditor/aText';
import ASky from 'utils/aframeEditor/aSky';
import ACamera from 'utils/aframeEditor/aCamera';
import AVideo from 'utils/aframeEditor/aVideo';

import ipcHelper from 'utils/ipc/ipcHelper';

var Events = require('vendor/Events.js');

// const infoRenderer = {
//   'a-box': InfoTypeBox,
//   'a-text': InfoTypeBox,
//   'a-cone': InfoTypeBox, //InfoTypeCone,
//   'a-cylinder': InfoTypeBox, //InfoTypeCylinder,
//   'a-tetrahedron': InfoTypeBox,
//   'a-sphere': InfoTypeBox,
//   'a-plane': InfoTypeBox, //InfoTypePlane,
//   'a-triangle': InfoTypeBox, //InfoTypeTriangle,
//   'a-image': InfoTypeBox, //InfoTypeImage
//   'a-camera': InfoTypeCamera,
//   'a-sky': InfoTypeBox,
//   'a-navigation': InfoTypeBox,
// };
const entityModel = {
  'a-box': ABox,
  'a-text': AText,
  'a-cone': ACone, //InfoTypeCone,
  'a-cylinder': ABox, //InfoTypeCylinder,
  'a-tetrahedron': ABox,
  'a-sphere': ASphere,
  'a-plane': APlane, //InfoTypePlane,
  'a-triangle': ABox, //InfoTypeTriangle,
  'a-image': ABox, //InfoTypeImage
  'a-video': ABox, //InfoTypeImage
  'a-camera': ACamera,
  'a-sky': ASky,
  'a-navigation': ANavigation,
}

function EntityDetails(props) {
  const entity = props.sceneContext.getCurrentEntity();// entitiesList[props.selectedEntity]['el'];
  const timeline = props.sceneContext.getCurrentTimeline();// entitiesList[props.selectedEntity]['el'];
  const Renderer = infoRenderer;
  const Model = new entityModel[entity['type']];

  if (Renderer) {
    return (
      <Renderer key={timeline.id} {...props} animatableAttributes={Model.animatableAttributes}/>
    );
  } else {
    return null;
  }
}
class InfoPanel extends Component {
  constructor(props) {
    super(props);
    // this.sceneContext = props.sceneContext;
    this.addTimeline = this.addTimeline.bind(this);
    this.selectTimelinePosition = this.selectTimelinePosition.bind(this);
    this.deleteTimeline = this.deleteTimeline.bind(this);
    // this.state = {
    //   currentEntity: props.sceneContext.getCurrentEntity(),
    //   // model: null
    // }
  }
  componentDidMount() {
    // Events.emit('disablecontrols');
    // const entity = this.props.sceneContext.getCurrentEntity();
    // if (entity)
    //   this.Model = new entityModel[entity['type']];
  }
  // componentDidUpdate(prevProps, prevState) {
  //   const props = this.props;
  //   const newEntity = props.sceneContext.getCurrentEntity();
  //   if ((!prevState.currentEntity && newEntity) || (newEntity && newEntity.id !== prevState.currentEntity.id)) {
  //     this.setState({
  //       currentEntity: newEntity,
  //       model: new entityModel[newEntity['type']]
  //     })
  //   } else if (prevState.currentEntity !== this.state.currentEntity) {
  //     this.setState({
  //       currentEntity: null,
  //       model: null
  //     })
  //   }
  // }
  addTimeline() {
    const props = this.props;
    const sceneContext = props.sceneContext;
    const selectedEntity = sceneContext.getCurrentEntity();
    sceneContext.addTimeline(selectedEntity.id);
  }
  selectTimelinePosition(position, timelineId) {
    const props = this.props;
    const sceneContext = props.sceneContext;
    sceneContext.selectTimelinePosition(position, timelineId);
  }
  deleteTimeline() {
    const props = this.props;
    const sceneContext = props.sceneContext;
    const currentTimelineId = sceneContext.getCurrentTimelineId();
    sceneContext.deleteTimeline(currentTimelineId);
  }
  componentWillUnmount() {
  }
  render() {
    const props = this.props;
    const sceneContext = props.sceneContext;
    const selectedEntity = sceneContext.getCurrentEntity();
    if (!selectedEntity) return null;

    // const selectedSlide = selectedEntity['slide'][props.selectedSlide];
    // if (!selectedSlide) return null;

    const selectedTimeline = sceneContext.getCurrentTimeline();
    const allTimelines = sceneContext.getTimelinesList(selectedEntity['id']);

    const selectedTimelinePosition = sceneContext.getCurrentTimelinePosition();
   
    const model = new entityModel[selectedEntity['type']];
    model.setEl(selectedEntity.el);
    // console.log(model);
    const staticAttributes = model.staticAttributes;
    let staticPanel = null;
    if (staticAttributes.length) {
      staticPanel = <div id="content-panel">
        <div className="panel">
          <div className="panel-header">
            Content - {selectedEntity['name']}
          </div>
          <div className="panel-body">
            {staticAttributes.map(staticAttribute => {
              let inputField = null;
              // try to prompt an input field from electron?
              switch (staticAttribute.type) {
                case 'text': {
                  inputField = <input type="text" onInput={(event) => {
                    {/* selectedEntity.el.setAttribute(staticAttribute.attributeKey,
                    {
                      [staticAttribute.attributeField]: event.target.value
                    }); */}
                    if (staticAttribute.attributeField) {
                      model.updateEntityAttributes({
                        [staticAttribute.attributeKey]: {
                          [staticAttribute.attributeField]: event.target.value
                        }
                      });
                    } else {
                      model.updateEntityAttributes({
                        [staticAttribute.attributeKey]: event.target.value
                      });
                    }
                  }} onBlur={(event) => {
                    if (staticAttribute.attributeField) {
                      sceneContext.updateEntity({                      
                        [staticAttribute.attributeKey]: {
                          [staticAttribute.attributeField]: event.target.value
                        }
                      }, selectedEntity['id']);
                    } else {
                      sceneContext.updateEntity({
                        [staticAttribute.attributeKey]: event.target.value
                        // [staticAttribute.attributeKey]: {
                          // [staticAttribute.attributeField]: event.target.value
                        // }
                      }, selectedEntity['id']);
                    }
                  }} />
                  break;
                }
                case 'image': {
                  // use electron to load later
                  inputField = <div onClick={_=> {
                    ipcHelper.openImageDialog((err, data) => {
                      sceneContext.updateEntity({
                          material: {
                            src: `url(${data.filePaths})`
                          }
                        }, selectedEntity['id']);
                      selectedEntity.el.setAttribute('material', `src:url(${data.filePaths})`);
                    })
                  }}>choose</div>
                  {/* inputField = <input type="file" accept="image" onChange={(event) => {
                    if (event.target.files && event.target.files[0]) {
                      var FR= new FileReader();
                      FR.addEventListener("load", function(e) {
                        // console.log(e.target.result);
                        selectedEntity.el.setAttribute('material', `src:url(${e.target.result})`);
                        sceneContext.updateEntity({
                          material: {
                            src: `url(${e.target.result})`
                          }
                          // [staticAttribute.attributeKey]: {
                            // [staticAttribute.attributeField]: event.target.value
                          // }
                        }, selectedEntity['id']);
                      }); 
                      FR.readAsDataURL( event.target.files[0] );
                    } else { 
                      selectedEntity.el.removeAttribute('material', 'src');
                    }
                  }} />*/}
                  break;
                }
                case 'video': {
                  // use electron to load later
                  inputField = <div onClick={_=> {
                    ipcHelper.openVideoDialog((err, data) => {
                      sceneContext.updateEntity({
                        material: {
                          src: `url(${data.filePaths})`
                        }
                      }, selectedEntity['id']);
                      selectedEntity.el.setAttribute('material', `src:url(${data.filePaths})`);
                    })
                  }}>choose</div>
                  {/* inputField = <input type="file" accept="video" onChange={(event) => {
                    if (event.target.files && event.target.files[0]) {
                      var FR= new FileReader();
                      FR.addEventListener("load", function(e) {
                        // console.log(e.target.result);
                        selectedEntity.el.setAttribute('material', `src:url(${e.target.result})`);
                        sceneContext.updateEntity({
                          material: {
                            src: `url(${e.target.result})`
                          }
                          // [staticAttribute.attributeKey]: {
                            // [staticAttribute.attributeField]: event.target.value
                          // }
                        }, selectedEntity['id']);
                      }); 
                      FR.readAsDataURL( event.target.files[0] );
                    } else {
                      selectedEntity.el.removeAttribute('material', 'src');
                    }
                  }} /> */}
                  break;
                }
                case 'slidesList': {
                  const currentSlideId = sceneContext.getCurrentSlideId();
                  const slidesList = sceneContext.getSlidesList();
                  const selected = selectedEntity[staticAttribute.attributeKey];
                  inputField = <select onChange={(event) => {
                      model.updateEntityAttributes({
                        [staticAttribute.attributeKey]: event.target.value
                      });
                      sceneContext.updateEntity({
                        [staticAttribute.attributeKey]: event.target.value
                        // [staticAttribute.attributeKey]: {
                          // [staticAttribute.attributeField]: event.target.value
                        // }
                      }, selectedEntity['id']);
                    }} 
                    value={selected || ""}
                  >
                    <option>Select Slide</option>
                    {slidesList.map((slide, slideIdx) => {
                      {/* if (slide.id === currentSlideId) return null; */}
                      return <option key={slide.id} value={slide.id}
                        disabled={slide.id === currentSlideId}
                      >
                        {`Slide ${slideIdx + 1}${slide.id === currentSlideId? ' (This Slide)': ''}`}
                      </option>
                    })}
                  </select>
                }
              }
              return <div key={staticAttribute.name} className="attribute-button">
                <div className="field-label" onClick={(e) => {
                  const nextSiblingPosition = e.currentTarget.nextSibling.style.position;
                  e.currentTarget.nextSibling.style.position = (nextSiblingPosition === 'fixed'? '': 'fixed');
                }}>{staticAttribute.name} :</div>
                {inputField}
              </div>
            })}
            
          </div>
        </div>
      </div>
    }
    if (!selectedTimeline) {
      // check if any timelines exist
      // if (selectedEntity['timelines'].length === 0) {
        // no timeline exist, display hints box
        return (
        <Fragment>
          {staticPanel}
          <div id="info-panel">
            <div className="panel">
              <div className="panel-header">
                Animation - {selectedEntity['name']}
              </div>
              <div className="panel-body">
                {/* check if any timelines exist */}
                {/* no timeline exist, display hints box */}
                {selectedEntity['timelines'].length === 0 ?
                  <div className="attribute-col">
                    <button className="new-timeline-btn" onClick={this.addTimeline}>
                      Click to add animation
                    </button>
                  </div>
                :
                  <div className="timelines-col">
                    {/* timelines exist, display timeline selecting box */}
                    {allTimelines.map(timeline => {
                      return <div className="timeline-btns-col">
                      <button className="new-timeline-btn" onClick={_=>{
                      this.selectTimelinePosition("startAttribute", timeline.id)
                    }} >
                      {`${timeline.start}`}
                    </button>
                    <button className="new-timeline-btn" onClick={_=>{
                      this.selectTimelinePosition("endAttribute", timeline.id)
                    }} >
                      {`${timeline.start + timeline.duration}`}
                    </button>
                  </div>
                    })}
                  </div>
                }
              </div>
            </div>
          </div>
        </Fragment>
        )
      // } else {

      // }
      // return null;
    } else {
      return (
      <Fragment>
        {staticPanel}        
        <div id="info-panel">
          <div className="panel">
            <div className="panel-header">
              Animation - {selectedEntity['name']}
              <div className="menu-wrapper">
                <div className="menu-btn">
                  <div className="dot"></div>
                </div>
                <div className="menu-list">
                  <div className="menu-item delete-timeline" onClick={() => {
                    this.deleteTimeline();
                  }}>
                    Delete Animation
                  </div>
                </div>
              </div>
            </div>
            <div className={"panel-body " + selectedTimelinePosition}>
              <div className="timeline-position-wrap">
                <div className={"timeline-position" + (selectedTimelinePosition === "startAttribute"? " selected": "")} onClick={()=>{ 
                    this.selectTimelinePosition("startAttribute", selectedTimeline.id);
                  }}
                  title="Start time"
                >{selectedTimeline.start}</div>
                <div className={"timeline-position" + (selectedTimelinePosition === "endAttribute"? " selected": "")} onClick={()=>{ 
                    this.selectTimelinePosition("endAttribute", selectedTimeline.id);
                  }}
                  title="End time"
                >{selectedTimeline.start + selectedTimeline.duration}</div>
                {selectedTimelinePosition &&
                  <div className="underline-indicator" style={{left: (selectedTimelinePosition === "startAttribute"? "0%": "50%")}}></div>
                }
              </div>
              {(selectedTimelinePosition === "startAttribute") &&
                <EntityDetails key={selectedTimeline.id} {...props} timelineObj={selectedTimeline} model={model} timelinePosition="startAttribute" />
              }
              {(selectedTimelinePosition === "endAttribute") &&
                <EntityDetails key={selectedTimeline.id} {...props} timelineObj={selectedTimeline} model={model} timelinePosition="endAttribute" />
              }
            </div>
            
          </div>
        </div>
      </Fragment>
      );
    }
  }
}
export default withSceneContext(InfoPanel);