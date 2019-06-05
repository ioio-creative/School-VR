/*
  info generation of right panel
*/
import React, {Component} from 'react';
import {roundTo, addToAsset, rgba2hex} from 'utils/aframeEditor/helperfunctions';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {Rnd as ResizableAndDraggable} from 'react-rnd';

import './infoTypeText.css';

var Events = require('vendor/Events.js');

class InfoTypeText extends Component {
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
    Events.emit('gettransformmode', mode => {
      if (this.state.editorMode !== mode) {
        this.changeTransformMode(mode);
      }
    })
  }
  componentDidUpdate(prevProps, prevState) {
    const props = this.props;
    const self = this;
    if (
      props.selectedEntity !== prevProps.selectedEntity ||
      props.selectedSlide !== prevProps.selectedSlide ||
      props.selectedTimeline !== prevProps.selectedTimeline ||
      props.timelinePosition !== prevProps.timelinePosition
    ) {
      this.changeTransformMode(null);
    } else {
      Events.emit('gettransformmode', mode => {
        if (self.state.editorMode !== mode) {
          self.changeTransformMode(mode);
        }
      })
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
    const backgroundColor = rgba2hex(data.material.color);
    const textColor = rgba2hex(data.text.color);
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
          <label title={textColor}>
            <div className="field-label">Text Color:</div><div className="color-preview" style={{backgroundColor: textColor}}/>
            <input type="color" value={textColor} onChange={(event) => this.changeObjectField('text.color', event.target.value)} hidden/>
          </label>
        </div>
        <div className="attribute-col opacity-col" onClick={() => this.changeTransformMode(null)}>
          <div className="field-label">Text Opacity:</div>
          <div className="opacity-control">
            <div className="hide-button" onClick={() => {
              // ~~! int value of the opposite opacity, 0 -> 1, 0.x -> 0
              this.changeObjectField('text.opacity', ~~!data.text.opacity);              
            }}>
              {data.text.opacity?
                <FontAwesomeIcon icon="eye-slash" />:
                <FontAwesomeIcon icon="eye" />
              }
            </div>
            <div className="opacity-drag-control"
              title={data.text.opacity * 100 + '%'}
              ref={ref=> this.textOpacityControl = ref}
              onClick={(event) => {
                const clickPercent = (event.clientX - event.currentTarget.getBoundingClientRect().left) / event.currentTarget.getBoundingClientRect().width;
                this.changeObjectField('text.opacity', roundTo(clickPercent, 2));
              }}
            >
              <ResizableAndDraggable
                className="current-opacity"
                disableDragging={true}
                bounds="parent"
                minWidth="0%"
                maxWidth="100%"
                default={{
                  x: 0,
                  y: 0
                }}
                size={{
                  height: 24,
                  width: data.text.opacity * 100 + '%'
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
                  console.log(delta.width, this.textOpacityControl.getBoundingClientRect().width);
                  this.changeObjectField('text.opacity', roundTo(data.text.opacity + delta.width / this.textOpacityControl.getBoundingClientRect().width, 2));
                }}
              >
                <div className="current-opacity" />
              </ResizableAndDraggable>  
            </div>
            <input type="text" value={data.text.opacity} ref={(ref) => this.textOpacityInput = ref} onChange={(event) => this.changeObjectField('text.opacity', event.target.value)} hidden/>
          </div>
        </div>
        {/* <div className="attribute-col color-col" onClick={() => this.changeTransformMode(null)}>
          <label title={backgroundColor}>
            <div className="field-label">Background Color:</div><div className="color-preview" style={{backgroundColor: backgroundColor}}/>
            <input type="color" value={backgroundColor} onChange={(event) => this.changeObjectField('material.color', event.target.value)} hidden/>
          </label>
        </div>
        <div className="attribute-col opacity-col" onClick={() => this.changeTransformMode(null)}>
          <div className="field-label">Background Opacity:</div>
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
              ref={ref=> this.backgroundOpacityControl = ref}
              onClick={(event) => {

                const clickPercent = (event.clientX - event.currentTarget.getBoundingClientRect().left) / event.currentTarget.getBoundingClientRect().width;
                this.changeObjectField('material.opacity', roundTo(clickPercent, 2));
              }}
            >
              <ResizableAndDraggable
                className="current-opacity"
                disableDragging={true}
                bounds="parent"
                minWidth="0%"
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
                  console.log(delta.width, this.backgroundOpacityControl.getBoundingClientRect().width);
                  this.changeObjectField('material.opacity', roundTo(data.material.opacity + delta.width / this.backgroundOpacityControl.getBoundingClientRect().width, 2));
                }}
              >
                <div className="current-opacity" />
              </ResizableAndDraggable>  
            </div>
            <input type="text" value={data.material.opacity} ref={(ref) => this.backgroundOpacityInput = ref} onChange={(event) => this.changeObjectField('material.opacity', event.target.value)} hidden/>
          </div>
        </div> */}
      </div>
    );
  }
}
export default InfoTypeText;