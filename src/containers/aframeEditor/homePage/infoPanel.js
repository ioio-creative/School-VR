/*
  Right Panel should be something that show the selected entity's info ( ◲ )
  ▫▫▫▫▫▫▫▫▫▫▫
  ▭ ┌──────┐
  ▭ │AFRAME│
  ▭ └──────◲
*/
import React, {Component, Fragment} from 'react';
// import EntitiesList from 'containers/aframeEditor/panelItem/entitiesList';

import timelineInfoRenderer from 'containers/aframeEditor/homePage/infoPanel/timelineInfoRenderer';
import staticInfoRenderer from 'containers/aframeEditor/homePage/infoPanel/staticInfoRenderer';
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
import APyramid from 'utils/aframeEditor/aPyramid';
import ANavigation from 'utils/aframeEditor/aNavigation';
import APlane from 'utils/aframeEditor/aPlane';
import AText from 'utils/aframeEditor/aText';
import ASky from 'utils/aframeEditor/aSky';
import ACamera from 'utils/aframeEditor/aCamera';
import AVideo from 'utils/aframeEditor/aVideo';

import ipcHelper from 'utils/ipc/ipcHelper';
import handleErrorWithUiDefault from 'utils/errorHandling/handleErrorWithUiDefault';
import isNonEmptyArray from 'utils/variableType/isNonEmptyArray';
import fileHelper from 'utils/fileHelper/fileHelper';

import iconCirclePlus from 'media/icons/circleplus.svg';
import iconCircleMinus from 'media/icons/circleminus.svg';

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
  'a-pyramid': APyramid,
  'a-sphere': ASphere,
  'a-plane': APlane, //InfoTypePlane,
  'a-triangle': ABox, //InfoTypeTriangle,
  'a-image': ABox, //InfoTypeImage
  'a-video': AVideo, //InfoTypeImage
  'a-camera': ACamera,
  'a-sky': ASky,
  'a-navigation': ANavigation,
}

function EntityDetails(props) {
  const entity = props.sceneContext.getCurrentEntity();// entitiesList[props.selectedEntity]['el'];
  const timeline = props.sceneContext.getCurrentTimeline();// entitiesList[props.selectedEntity]['el'];
  const Model = new entityModel[entity['type']];
  
  if (timeline) {
    const Renderer = timelineInfoRenderer;
    return (
      <Renderer key={entity.id + '_' + timeline.id} {...props} animatableAttributes={Model.animatableAttributes}/>
    );
  } else {
    // render a panel same as above but not setting any timeline
    const Renderer = staticInfoRenderer;
    return (
      <Renderer key={entity.id} {...props} animatableAttributes={Model.animatableAttributes}/>
    );
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
          {/* <div className="panel-header">
            Content - {selectedEntity['name']}
          </div> */}
          <div className="panel-body">
            {staticAttributes.map(staticAttribute => {
              let inputField = null;
              let currentValue = '';
              if (staticAttribute.attributeField) {
                const attrsObj = selectedEntity.el.getAttribute(staticAttribute.attributeKey);
                if (attrsObj) {
                  currentValue = attrsObj[staticAttribute.attributeField];
                }
              } else {
                currentValue = selectedEntity.el.getAttribute(staticAttribute.attributeField)
              }
              // try to prompt an input field from electron?
              {/* console.log(staticAttribute.type); */}
              switch (staticAttribute.type) {
                case 'text': {
                  inputField = <input type="text" className="contentTextInput" key={selectedEntity.el.id} onInput={(event) => {
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
                      sceneContext.updateEntity({                      
                        [staticAttribute.attributeKey]: {
                          [staticAttribute.attributeField]: event.target.value
                        }
                      }, selectedEntity['id']);
                    } else {
                      model.updateEntityAttributes({
                        [staticAttribute.attributeKey]: event.target.value
                      });
                      sceneContext.updateEntity({
                        [staticAttribute.attributeKey]: event.target.value
                        // [staticAttribute.attributeKey]: {
                          // [staticAttribute.attributeField]: event.target.value
                        // }
                      }, selectedEntity['id']);
                    }
                  }} onBlur={(event) => {
                    {/* if (staticAttribute.attributeField) {
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
                    } */}
                  }} value={currentValue} />
                  break;
                }
                case 'image': {
                  // use electron api to load
                  inputField = <div onClick={_=> {
                    ipcHelper.openImageDialog((err, data) => {
                      if (isNonEmptyArray(data.filePaths)) {
                        const filePath =data.filePaths[0];
                        const ext = filePath.split('.').slice(-1)[0];
                        const newAssetData = sceneContext.addAsset({
                          filePath: filePath,
                          type: (ext === 'gif'? 'gif': 'image')
                        });
                        sceneContext.updateEntity({
                          material: {
                            src: `#${newAssetData.id}`,
                            shader: newAssetData.shader
                          }
                        }, selectedEntity['id']);
                        selectedEntity.el.setAttribute('material', `src:#${newAssetData.id};shader:${newAssetData.shader}`);
                      } else {
                        selectedEntity.el.removeAttribute('material', 'src');
                      }
                    })
                  }}>choose</div>
                  // temp use browser api to debug
                  // inputField = <input type="file" accept="image/svg+xml,image/jpeg,image/png" onChange={(event) => {
                  //   if (event.target.files && event.target.files[0]) {
                  //     {/* const FR= new FileReader();
                  //     FR.addEventListener("load", function(e) {
                  //       // console.log(e.target.result);
                  //       selectedEntity.el.setAttribute('material', `src:url(${e.target.result})`);
                  //       sceneContext.updateEntity({
                  //         material: {
                  //           src: `url(${e.target.result})`
                  //         }
                  //         // [staticAttribute.attributeKey]: {
                  //           // [staticAttribute.attributeField]: event.target.value
                  //         // }
                  //       }, selectedEntity['id']);
                  //     }); 
                  //     FR.readAsDataURL( event.target.files[0] ); */}
                  //     {/* console.log(event.target.files[0].type); */}
                  //     /**
                  //     image/svg+xml
                  //     image/jpeg
                  //     image/gif
                  //     image/png
                  //     video/mp4
                  //      */
                  //     const newAssetData = sceneContext.addAsset(event.target.files[0]);
                  //     selectedEntity.el.setAttribute('material', `src:#${newAssetData.id};shader: ${newAssetData.shader}`);
                  //     sceneContext.updateEntity({
                  //       material: {
                  //         src: `#${newAssetData.id}`,
                  //         shader: newAssetData.shader
                  //       }
                  //     }, selectedEntity['id']);
                  //    
                  //   } else { 
                  //     selectedEntity.el.removeAttribute('material', 'src');
                  //   }
                  // }} />
                  break;
                }
                case 'video': {
                  // use electron api to load
                  inputField = <div onClick={_=> {
                    ipcHelper.openVideoDialog((err, data) => {
                      if (err) {
                        handleErrorWithUiDefault(err);
                        return;
                      }

                      const filePaths = data.filePaths;

                      if (!isNonEmptyArray(filePaths)) {
                        selectedEntity.el.removeAttribute('material', 'src');
                      } else {
                        const newAssetData = sceneContext.addAsset({
                          filePath: filePaths[0],
                          type: 'video/mp4', // data.type not pass from the ipc
                        });
                        selectedEntity.el.setAttribute('material', `src:#${newAssetData.id};shader: ${newAssetData.shader}`);
                        sceneContext.updateEntity({
                          material: {
                            src: `#${newAssetData.id}`,
                            shader: newAssetData.shader
                          }
                        }, selectedEntity['id']);
                      }

                      {/* const mimeType = fileHelper.getMimeType(filePaths[0]); */}

                      {/* sceneContext.updateEntity({
                        material: {
                          src: `url(${data.filePaths})`
                        }
                      }, selectedEntity['id']); */}
                      {/* selectedEntity.el.setAttribute('material', `src:url(${data.filePaths})`); */}
                    })
                  }}>choose</div>
                  // temp use browser api to debug
                  {/* inputField = <input type="file" accept="video/mp4" onChange={(event) => {
                    if (event.target.files && event.target.files[0]) {
                      const newAssetData = sceneContext.addAsset(event.target.files[0]);
                      selectedEntity.el.setAttribute('material', `src:#${newAssetData.id};shader: ${newAssetData.shader}`);
                      sceneContext.updateEntity({
                        material: {
                          src: `#${newAssetData.id}`,
                          shader: newAssetData.shader
                        }
                      }, selectedEntity['id']);
                    } else {
                      selectedEntity.el.removeAttribute('material', 'src');
                    }
                  }} /> */}
                  break;
                }
                case 'number': {
                  inputField = <div className="numberSelector">
                    <div className={`decreaseFontSize${(!currentValue || currentValue === 1)?' disabled': ''}`} onClick={() => {
                      const newValue = Math.max(currentValue - 1, 1);
                      if (staticAttribute.attributeField) {
                        model.updateEntityAttributes({
                          [staticAttribute.attributeKey]: {
                            [staticAttribute.attributeField]: newValue
                          }
                        });
                        sceneContext.updateEntity({                      
                          [staticAttribute.attributeKey]: {
                            [staticAttribute.attributeField]: newValue
                          }
                        }, selectedEntity['id']);
                      } else {
                        model.updateEntityAttributes({
                          [staticAttribute.attributeKey]: newValue
                        });
                        sceneContext.updateEntity({
                          [staticAttribute.attributeKey]: newValue
                        }, selectedEntity['id']);
                      }
                    }}>
                      <img className="buttonImg" src={iconCircleMinus} />
                    </div>
                    <div className="currentFontSize">{currentValue || 1}</div>
                    <div className={`increaseFontSize${currentValue === 20? ' disabled': ''}`} onClick={() => {
                      const newValue = Math.min(currentValue + 1, 20);
                      if (staticAttribute.attributeField) {
                        model.updateEntityAttributes({
                          [staticAttribute.attributeKey]: {
                            [staticAttribute.attributeField]: newValue
                          }
                        });
                        sceneContext.updateEntity({                      
                          [staticAttribute.attributeKey]: {
                            [staticAttribute.attributeField]: newValue
                          }
                        }, selectedEntity['id']);
                      } else {
                        model.updateEntityAttributes({
                          [staticAttribute.attributeKey]: newValue
                        });
                        sceneContext.updateEntity({
                          [staticAttribute.attributeKey]: newValue
                        }, selectedEntity['id']);
                      }
                    }}>
                      <img className="buttonImg" src={iconCirclePlus} />
                    </div>
                  </div>;
                    
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
              return <div key={staticAttribute.name} className="attribute-row">
                {/* <div className="field-label" onClick={(e) => {
                  const nextSiblingPosition = e.currentTarget.nextSibling.style.position;
                  e.currentTarget.nextSibling.style.position = (nextSiblingPosition === 'fixed'? '': 'fixed');
                }}
                title={currentValue}
              >{staticAttribute.name} :</div> */}
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
              {/* <div className="panel-header">
                Animation - {selectedEntity['name']}
              </div> */}
              <div className="panel-body">
                {/* check if any timelines exist */}
                {/* no timeline exist, display hints box */}
                {selectedEntity['timelines'].length === 0 ? 
                  <Fragment>
                    <div className="attribute-col">
                      <button className="new-timeline-btn" onClick={this.addTimeline}>
                        Click to add animation
                      </button>
                    </div>
                    <EntityDetails key={selectedEntity.id} entityId={selectedEntity['id']} {...props} model={model} />
                  </Fragment>
                :
                  <div className="timelines-col">
                    {/* timelines exist, display timeline selecting box */}
                    {allTimelines.map(timeline => {
                      return <div key={timeline.id} className="timeline-btns-col">
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
            <div className="menu-item delete-timeline" onClick={() => {
              this.deleteTimeline();
            }}>
              Delete
            </div>
            {/* <div className="panel-header">
              Animation - {selectedEntity['name']}
              <div className="menu-wrapper">
                <div className="menu-btn">
                  <div className="dot"></div>
                </div>
                <div className="menu-list">
                  
                </div>
              </div>
            </div> */}
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