/*
  info generation of right panel
*/
import React, {Component} from 'react';
import {roundTo, addToAsset, rgba2hex} from 'utils/aframeEditor/helperfunctions';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {Rnd as ResizableAndDraggable} from 'react-rnd';

import './infoTypeBox.css';

var Events = require('vendor/Events.js');

class InfoTypeBox extends Component {
  constructor(props) {
    super(props);
    const self = this;
    this.state = {
      editorMode: null
    };
    this.changeObjectField = this.changeObjectField.bind(this);
    this.changeTransformMode = this.changeTransformMode.bind(this);
    this.events = {
      transformmodechanged: (mode) => {
        self.setState({
          editorMode: mode
        });
      }
    };
  }
  componentDidMount() {
    for (let eventName in this.events) {
      Events.on(eventName, this.events[eventName]);
    }
    // this.changeTransformMode('translate');
      // Events.emit('transformmodechanged', 'translate');
  }
  componentDidUpdate(prevProps, prevState) {
    const props = this.props;
    if (
      props.selectedEntity !== prevProps.selectedEntity ||
      props.selectedSlide !== prevProps.selectedSlide ||
      props.selectedTimeline !== prevProps.selectedTimeline ||
      props.timelinePosition !== prevProps.timelinePosition
    ) {
      this.changeTransformMode(null);
      return true;
    }
  }
  componentWillUnmount() {
    for (let eventName in this.events) {
      Events.removeListener(eventName, this.events[eventName]);
    }
  }
  changeTransformMode(transformMode) {
    this.setState({
      editorMode: transformMode
    });
    if (transformMode) {
      Events.emit('enablecontrols');
      Events.emit('transformmodechanged', transformMode);
    } else {
      Events.emit('disablecontrols');
    }
  }
  changeObjectField(field, value) {
    const tmp = {};
    tmp[field] = value;
    Events.emit('updateSelectedEntityAttribute', tmp);
  }
  render() {
    const props = this.props;
    const data = props.timelineObj[props.timelinePosition];
    const color = rgba2hex(data.material.color);
    return (
      <div className="animatable-params">
        <div className="vec3D-btn-col">
          <button 
            className={(this.state.editorMode === "translate"? "selected": "")}
            onClick={()=>{this.changeTransformMode('translate')}}
            title="Translate"
          >
            <FontAwesomeIcon icon="arrows-alt" />
          </button>
          <button 
            className={(this.state.editorMode === "rotate"? "selected": "")}
            onClick={()=>{this.changeTransformMode('rotate')}}
            title="Rotate"
          >
            <FontAwesomeIcon icon="sync-alt" />
          </button>
          <button 
            className={(this.state.editorMode === "scale"? "selected": "")}
            onClick={()=>{this.changeTransformMode('scale')}}
            title="Scale"
          >
            <FontAwesomeIcon icon="expand-arrows-alt" />
          </button>
        </div>
        <div className="attribute-col color-col" onClick={() => this.changeTransformMode(null)}>
          <label title={color}>
            <div className="field-label">Color:</div><div className="color-preview" style={{backgroundColor: color}}/>
            <input type="color" value={color} onChange={(event) => this.changeObjectField('material.color', event.target.value)} hidden/>
          </label>
        </div>
        <div className="attribute-col opacity-col" onClick={() => this.changeTransformMode(null)}>
          <div className="field-label">Opacity:</div>
          <div className="opacity-control">
            <div className="hide-button" onClick={() => {
              // ~~! int value of the opposite opacity, 0 -> 1, 0.x -> 0
              this.changeObjectField('material.opacity', ~~!data.material.opacity);              
            }}>
              {data.material.opacity?
                <FontAwesomeIcon icon="eye-slash" />:
                <FontAwesomeIcon icon="eye" />
              }
            </div>
            <div className="opacity-drag-control"
              title={data.material.opacity * 100 + '%'}
              ref={ref=> this.opacityControl = ref}
              onClick={(event) => {

                const clickPercent = (event.clientX - event.currentTarget.getBoundingClientRect().left) / event.currentTarget.getBoundingClientRect().width;
                this.changeObjectField('material.opacity', roundTo(clickPercent, 2));
              }}
            >
              <ResizableAndDraggable
                className="current-opacity"
                disableDragging={true}
                bounds="parent"
                minWidth={0}
                maxWidth="100%"
                default={{
                  x: 0,
                  y: 0
                }}
                size={{
                  height: 24,
                  width: data.material.opacity * 100 + '%'
                }}
                dragAxis='x'
                enableResizing={{
                  top: false, right: true, bottom: false, left: false,
                  topRight: false, bottomRight: false, bottomLeft: false, topLeft: false
                }}
                onResizeStart={(event, dir, ref, delta,pos)=>{

                }}
                onResize={(event, dir, ref, delta, pos)=>{
                }}
                onResizeStop={(event, dir, ref, delta, pos)=>{
                  console.log(delta.width, this.opacityControl.getBoundingClientRect().width);
                  // this.opacityInput.value = delta.width;
                  // this.opacityInput.value = (150 + delta.width) / 150;
                  this.changeObjectField('material.opacity', roundTo(data.material.opacity + delta.width / this.opacityControl.getBoundingClientRect().width, 2));
                }}
              >
                <div className="current-opacity" />
              </ResizableAndDraggable>  
            </div>
            <input type="text" value={data.material.opacity} ref={(ref) => this.opacityInput = ref} onChange={(event) => this.changeObjectField('material.opacity', event.target.value)} hidden/>
          </div>
        </div>
      </div>
    );
  }
}
export default InfoTypeBox;