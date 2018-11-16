/*
  info generation of right panel
*/
import React, {Component} from 'react';
import {roundTo, addToAsset, rgba2hex} from 'globals/aframeEditor/helperfunctions';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {Rnd as ResizableAndDraggable} from 'react-rnd';

import './infoTypeCamera.css';

var Events = require('vendor/Events.js');

class InfoTypeCamera extends Component {
  constructor(props) {
    super(props);
    const self = this;
    this.data = props.timelineObj[props.timelinePosition];
    this.state = {
      editorMode: null
    };
    this.changeTransformMode = this.changeTransformMode.bind(this);
    this.events = {
      transformmodechanged: (mode) => {
        self.setState({
          editorMode: mode
        });
      },
      refreshsidebarobject3d: function(obj) {
        self.updateCameraView();
      }
    };
    this.previewCamera = null;
  }
  componentDidMount() {
    for (let eventName in this.events) {
      Events.on(eventName, this.events[eventName]);
    }
    this.changeTransformMode(null);
    this.updateCameraView();
  }
  componentDidUpdate(prevProps, prevState) {
    const props = this.props;
    const self = this;
    // console.log('componentDidUpdate');
    if (
      props.selectedEntity !== prevProps.selectedEntity ||
      props.selectedSlide !== prevProps.selectedSlide ||
      props.selectedTimeline !== prevProps.selectedTimeline ||
      props.timelinePosition !== prevProps.timelinePosition
    ) {
      this.changeTransformMode(null);
      // return true;
    } else {
      Events.emit('gettransformmode', mode => {
        if (["translate", "rotate"].indexOf(mode) === -1) {
          self.changeTransformMode("translate");
        }
      })
    }
    this.updateCameraView();

  }
  componentWillUnmount() {
    for (let eventName in this.events) {
      Events.removeListener(eventName, this.events[eventName]);
    }
  }
  updateCameraView() {
    const props = this.props;
    const editor = props.editor;
    const renderer = editor.sceneEl.renderer;
    const scene = editor.sceneEl.object3D;
    const camera = editor.currentCameraEl.getObject3D('camera');
    renderer.render(scene, camera);
    const width = renderer.domElement.width;
    const height = renderer.domElement.height;
    const newHeight = 270 / width * height;
    const canvas = this.previewCamera;
    const ctx = canvas.getContext('2d');
    canvas.width = 270;
    canvas.height = newHeight;
    ctx.drawImage(renderer.domElement, 0, 0, canvas.width, canvas.height);
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
  render() {
    const data = this.data;
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
        </div>
        <div className="attribute-col">
          <div>Preview</div>
          <canvas ref={ref=>this.previewCamera = ref} classname="preview-camera"/>
        </div>
      </div>
    );
  }
}
export default InfoTypeCamera;