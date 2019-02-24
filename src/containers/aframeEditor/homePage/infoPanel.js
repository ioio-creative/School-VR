/*
  Right Panel should be something that show the selected entity's info ( ◲ )
  ▫▫▫▫▫▫▫▫▫▫▫
  ▭ ┌──────┐
  ▭ │AFRAME│
  ▭ └──────◲
*/
import React, {Component, Fragment} from 'react';
import InfoTypeBox from 'containers/aframeEditor/homePage/infoPanel/infoTypeBox';
import InfoTypeCone from 'containers/aframeEditor/homePage/infoPanel/infoTypeCone';
import InfoTypeCylinder from 'containers/aframeEditor/homePage/infoPanel/infoTypeCylinder';
import InfoTypePlane from 'containers/aframeEditor/homePage/infoPanel/infoTypePlane';
import InfoTypeTriangle from 'containers/aframeEditor/homePage/infoPanel/infoTypeTriangle';
import InfoTypeImage from 'containers/aframeEditor/homePage/infoPanel/infoTypeImage';
import InfoTypeCamera from 'containers/aframeEditor/homePage/infoPanel/infoTypeCamera';
import InfoTypeBackground from 'containers/aframeEditor/homePage/infoPanel/infoTypeBackground';
import InfoTypeText from 'containers/aframeEditor/homePage/infoPanel/infoTypeText';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'

import './infoPanel.css';

var Events = require('vendor/Events.js');

const infoRenderer = {
  'a-box': InfoTypeBox,
  'a-cone': InfoTypeCone,
  'a-cylinder': InfoTypeBox, //InfoTypeCylinder,
  'a-tetrahedron': InfoTypeBox,
  'a-sphere': InfoTypeBox,
  'a-plane': InfoTypeBox, //InfoTypePlane,
  'a-triangle': InfoTypeTriangle,
  'a-image': InfoTypeBox, //InfoTypeImage
  'a-camera': InfoTypeCamera,
  'a-scene': InfoTypeBackground,
  'a-text': InfoTypeText,
};

function EntityDetails(props) {
  let el = props.entitiesList[props.selectedEntity]['el'];
  const Renderer = infoRenderer[el.tagName.toLowerCase()];
  if (Renderer) {
    return (
      <Renderer key={props.selectedTimeline} {...props} />
    );
  } else {
    return null;
  }
}
class InfoPanel extends Component {
  constructor(props) {
    super(props);
    this.updateEntityText = this.updateEntityText.bind(this);
  }
  componentDidMount() {
    Events.emit('disablecontrols');
  }
  componentDidUpdate(prevProps, prevState) {
    const props = this.props;
    
  }
  componentWillUnmount() {
  }
  updateEntityText(e) {
    const entityId = this.props.selectedEntity;
    Events.emit('updateEntityText', entityId, e.target.value);
  }
  render() {
    const props = this.props;
    const selectedEntity = props.entitiesList[props.selectedEntity];
    if (!selectedEntity) return null;
    const textComponent = selectedEntity.el.getAttribute('text');
    // if (textComponent)
    //   console.log(textComponent['value']);
    const staticInfo = (
      <div id="content-panel">
        <div className="panel">
          <div className="panel-header">
            Content - {selectedEntity['name']}
          </div>
          <div className="panel-body">
            {/* <div className="attribute-col">
              <div className="field-label">Text:</div>
              {textComponent && <input type="text" value={textComponent['value']} onChange={this.updateEntityText} />}
            </div> */}
            <div className="attribute-col">
              <div className="field-label">Text:</div>
              {textComponent && <textarea rows="3" onChange={this.updateEntityText}>{textComponent['value']}</textarea>}
            </div>
          </div>
        </div>
      </div>
    );
    const selectedSlide = selectedEntity['slide'][props.selectedSlide];
    if (!selectedSlide) return null;

    const selectedTimeline = selectedSlide['timeline'][props.selectedTimeline];
    if (!selectedTimeline) {
      // check if any timelines exist
      if (Object.keys(selectedSlide['timeline']).length === 0) {
        // no timeline exist, display hints box
        return (
          <Fragment>
            {textComponent && staticInfo}
          <div id="info-panel">
            <div className="panel">
              <div className="panel-header">
                Animation - {selectedEntity['name']}
              </div>
              <div className="panel-body">
                <div className="attribute-col">
                  <button className="new-timeline-btn" onClick={()=> {
                    Events.emit('addTimeline', props.selectedEntity, props.selectedSlide, 0);
                  }}>
                    Click to add animation
                  </button>
                </div>
              </div>
            </div>
          </div>
          </Fragment>
        )
      }
      return null;
    } else {
      return (
        <Fragment>
        {textComponent && staticInfo}
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
                    Events.emit('deleteTimeline', props.selectedEntity, props.selectedSlide, props.selectedTimeline);
                  }}>
                    Delete Animation
                  </div>
                </div>
              </div>
            </div>
            <div className={"panel-body " + props.selectedTimelinePosition}>
              <div className="timeline-position-wrap">
                <div className={"timeline-position" + (props.selectedTimelinePosition === "startAttribute"? " selected": "")} onClick={()=>{ 
                    Events.emit('setTimelinePositionSelected', props.selectedEntity, props.selectedSlide, props.selectedTimeline, "startAttribute");
                  }}
                  title="Start time"
                >{selectedTimeline.start}</div>
                <div className={"timeline-position" + (props.selectedTimelinePosition === "endAttribute"? " selected": "")} onClick={()=>{ 
                    Events.emit('setTimelinePositionSelected', props.selectedEntity, props.selectedSlide, props.selectedTimeline, "endAttribute");
                  }}
                  title="End time"
                >{selectedTimeline.start + selectedTimeline.duration}</div>
                {props.selectedTimelinePosition &&
                  <div className="underline-indicator" style={{left: (props.selectedTimelinePosition === "startAttribute"? "0%": "50%")}}></div>
                }
              </div>
              {(props.selectedTimelinePosition === "startAttribute") &&
                <EntityDetails key={props.selectedTimeline} {...props} timelineObj={selectedTimeline} timelinePosition="startAttribute" />
              }
              {(props.selectedTimelinePosition === "endAttribute") &&
                <EntityDetails key={props.selectedTimeline} {...props} timelineObj={selectedTimeline} timelinePosition="endAttribute" />
              }
            </div>
            
          </div>
        </div>
        </Fragment>      
      );
    }
  }
}
export default InfoPanel;