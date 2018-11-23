/*
  info generation of right panel
*/
import React, {Component} from 'react';
import {roundTo, addToAsset, rgba2hex, polygonArea} from 'utils/aframeEditor/helperfunctions';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {Rnd as ResizableAndDraggable} from 'react-rnd';
import Draggable from 'react-draggable';

import './infoTypeTriangle.css';

var Events = require('vendor/Events.js');

class InfoTypeTriangle extends Component {
  constructor(props) {
    super(props);
    const self = this;
    this.state = {
      editorMode: null,
      vertexAX: 0, 
      vertexAY: 0,
      vertexBX: 0, 
      vertexBY: 0,
      vertexCX: 0, 
      vertexCY: 0,
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
    const props = this.props;
    for (let eventName in this.events) {
      Events.on(eventName, this.events[eventName]);
    }
    Events.emit('gettransformmode', mode => {
      if (this.state.editorMode !== mode) {
        this.changeTransformMode(mode);
      }
    })
    this.setState({
      vertexAX: props.timelineObj[props.timelinePosition]['geometry']['vertexA']['x'],
      vertexAY: props.timelineObj[props.timelinePosition]['geometry']['vertexA']['y'],
      vertexBX: props.timelineObj[props.timelinePosition]['geometry']['vertexB']['x'],
      vertexBY: props.timelineObj[props.timelinePosition]['geometry']['vertexB']['y'],
      vertexCX: props.timelineObj[props.timelinePosition]['geometry']['vertexC']['x'],
      vertexCY: props.timelineObj[props.timelinePosition]['geometry']['vertexC']['y'],
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

    if (prevState.vertexAX === this.state.vertexAX &&
      prevState.vertexAY === this.state.vertexAY &&
      prevState.vertexBX === this.state.vertexBX &&
      prevState.vertexBY === this.state.vertexBY &&
      prevState.vertexCX === this.state.vertexCX &&
      prevState.vertexCY === this.state.vertexCY) {
        if (props.timelineObj[props.timelinePosition]['geometry']['vertexA']['x'] !== this.state.vertexAX ||
          props.timelineObj[props.timelinePosition]['geometry']['vertexA']['y'] !== this.state.vertexAY ||
          props.timelineObj[props.timelinePosition]['geometry']['vertexB']['x'] !== this.state.vertexBX ||
          props.timelineObj[props.timelinePosition]['geometry']['vertexB']['y'] !== this.state.vertexBY ||
          props.timelineObj[props.timelinePosition]['geometry']['vertexC']['x'] !== this.state.vertexCX ||
          props.timelineObj[props.timelinePosition]['geometry']['vertexC']['y'] !== this.state.vertexCY) {
            this.setState({
              vertexAX: props.timelineObj[props.timelinePosition]['geometry']['vertexA']['x'],
              vertexAY: props.timelineObj[props.timelinePosition]['geometry']['vertexA']['y'],
              vertexBX: props.timelineObj[props.timelinePosition]['geometry']['vertexB']['x'],
              vertexBY: props.timelineObj[props.timelinePosition]['geometry']['vertexB']['y'],
              vertexCX: props.timelineObj[props.timelinePosition]['geometry']['vertexC']['x'],
              vertexCY: props.timelineObj[props.timelinePosition]['geometry']['vertexC']['y']
            });
          }
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
  changeObjectVertexField(field, value) {
    const tmp = {};
    const parsedValue = value.split(' ');
    tmp[field] = {
      x: parsedValue[0],
      y: parsedValue[1],
      z: parsedValue[2]
    };
    Events.emit('updateSelectedEntityAttribute', tmp);
  }
  render() {
    const props = this.props;
    const data = props.timelineObj[props.timelinePosition];
    const color = rgba2hex(data.material.color);
    const isTriangleValid = polygonArea([
      {x: this.state.vertexAX, y: this.state.vertexAY},
      {x: this.state.vertexBX, y: this.state.vertexBY},
      {x: this.state.vertexCX, y: this.state.vertexCY},
    ]) > 0;
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
                  this.changeObjectField('material.opacity', roundTo(data.material.opacity + delta.width / this.opacityControl.getBoundingClientRect().width, 2));
                }}
              >
                <div className="current-opacity" />
              </ResizableAndDraggable>  
            </div>
            <input type="text" value={data.material.opacity} ref={(ref) => this.opacityInput = ref} onChange={(event) => this.changeObjectField('material.opacity', event.target.value)} hidden/>
          </div>
        </div>
        <div className="attribute-col triangle-col" onClick={() => this.changeTransformMode(null)}>
          <div className="field-label">Vertex:</div>
          <div className="triangle-wrap">
          <Draggable 
              grid = {[50, 50]}
              bounds = {{left: 0, top: 0, right: 100, bottom: 100}}
              position = {{x: (parseFloat(data.geometry.vertexA.x) + 0.5) * 100, y: 100 - (parseFloat(data.geometry.vertexA.y) + 0.5) * 100}}
              onDrag={(event,data) => {
                const newX = Math.round(data.x / 50) * 0.5 - 0.5;
                const newY = (2 - Math.round(data.y / 50)) * 0.5 - 0.5;
                this.setState((prevState) => {
                  if (prevState.vertexAX !== newX || prevState.vertexAY !== newY) {
                    return {
                      vertexAX: newX, 
                      vertexAY: newY
                    }
                  }
                });
              }}
              onStop={(event, data)=> {
                const newX = Math.round(data.x / 50) * 0.5 - 0.5;
                const newY = (2 - Math.round(data.y / 50)) * 0.5 - 0.5;
                this.changeObjectField('geometry.vertexA', {x: newX, y: newY, z: 0});
              }}
            >
              <div className="controlDot" />
            </Draggable>
            <Draggable 
              grid = {[50, 50]}
              bounds = {{left: 0, top: 0, right: 100, bottom: 100}}
              position = {{x: (parseFloat(data.geometry.vertexB.x) + 0.5) * 100, y: 100 - (parseFloat(data.geometry.vertexB.y) + 0.5) * 100}}
              onDrag={(event,data) => {
                const newX = Math.round(data.x / 50) * 0.5 - 0.5;
                const newY = (2 - Math.round(data.y / 50)) * 0.5 - 0.5;
                this.setState((prevState) => {
                  if (prevState.vertexBX !== newX || prevState.vertexBY !== newY) {
                    return {
                      vertexBX: newX, 
                      vertexBY: newY
                    }
                  }
                });
              }}
              onStop={(event, data)=> {
                const newX = Math.round(data.x / 50) * 0.5 - 0.5;
                const newY = (2 - Math.round(data.y / 50)) * 0.5 - 0.5;
                this.changeObjectField('geometry.vertexB', {x: newX, y: newY, z: 0});
              }}
            >
              <div className="controlDot" />
            </Draggable>
            <Draggable 
              grid = {[50, 50]}
              bounds = {{left: 0, top: 0, right: 100, bottom: 100}}
              position = {{x: (parseFloat(data.geometry.vertexC.x) + 0.5) * 100, y: 100 - (parseFloat(data.geometry.vertexC.y) + 0.5) * 100}}
              onDrag={(event,data) => {
                const newX = Math.round(data.x / 50) * 0.5 - 0.5;
                const newY = (2 - Math.round(data.y / 50)) * 0.5 - 0.5;
                this.setState((prevState) => {
                  if (prevState.vertexCX !== newX || prevState.vertexCY !== newY) {
                    return {
                      vertexCX: newX, 
                      vertexCY: newY
                    }
                  }
                });
              }}
              onStop={(event, data)=> {
                const newX = Math.round(data.x / 50) * 0.5 - 0.5;
                const newY = (2 - Math.round(data.y / 50)) * 0.5 - 0.5;
                this.changeObjectField('geometry.vertexC', {x: newX, y: newY, z: 0});
              }}
            >
              <div className="controlDot" />
            </Draggable>
            <svg height="100" width="100">
            <polygon
                points={
                  ((parseFloat(this.state.vertexAX) + 0.5) * 100).toString() + ',' + (100 - (parseFloat(this.state.vertexAY) + 0.5) * 100).toString() + ' ' +
                  ((parseFloat(this.state.vertexBX) + 0.5) * 100).toString() + ',' + (100 - (parseFloat(this.state.vertexBY) + 0.5) * 100).toString() + ' ' +
                  ((parseFloat(this.state.vertexCX) + 0.5) * 100).toString() + ',' + (100 - (parseFloat(this.state.vertexCY) + 0.5) * 100).toString()
                } 
                style={{
                  fill: (isTriangleValid? color: "none"),
                  stroke: (isTriangleValid? "#EEEEEE": "red"),
                  strokeWidth: 3
                }}
              />
              <polygon
                points="0,0 0,100 100,100 100,0"
                style={{
                  fill: "none",
                  stroke: "#EEEEEE",
                  strokeWidth: 1
                }}
              />
            </svg>
          </div>
        </div>
      </div>
    );
  }
}
export default InfoTypeTriangle;