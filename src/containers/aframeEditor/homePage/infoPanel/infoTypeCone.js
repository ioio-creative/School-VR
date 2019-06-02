/*
  info generation of right panel
*/
import React, {Component} from 'react';
import {roundTo, addToAsset} from 'globals/helperfunctions';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'

import './infoTypeCone.css';

var Events = require('vendor/Events.js');
let editor = null;

Events.on('editor-load', obj => {
    editor = obj;
});

function rgb2hex(rgb){
  if (!rgb) return '#FFFFFF';
  const parsedrgb = rgb.match(/^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i);
  return (parsedrgb && parsedrgb.length === 4) ? "#" +
   ("0" + parseInt(parsedrgb[1],10).toString(16)).slice(-2) +
   ("0" + parseInt(parsedrgb[2],10).toString(16)).slice(-2) +
   ("0" + parseInt(parsedrgb[3],10).toString(16)).slice(-2) : rgb;
}

class InfoTypeCone extends Component {
  constructor(props) {
    super(props);
    props.timeline[props.timelinePosition]['material']['color'] = rgb2hex(props.timeline[props.timelinePosition]['material']['color']);
    this.state = {
      el: props.el,
      data: props.timeline[props.timelinePosition]
    };
    this.eventListener = Array();
    // this.changeObjectTexture = this.changeObjectTexture.bind(this);
    this.changeObjectField = this.changeObjectField.bind(this);
    this.deleteObject = this.deleteObject.bind(this);
    this.selectTimelinePosition = this.selectTimelinePosition.bind(this);
  }
  componentDidMount() {
    // let self = this;
    // const props = this.props;
    // // // later need to add event emit when change value
    // // this.setState({
    // // });
    // // console.log('componentDidMount');
    // props.timeline[props.timelinePosition]['material']['color'] = rgb2hex(props.timeline[props.timelinePosition]['material']['color']);
    // this.state = {
    //   el: props.el,
    //   data: props.timeline[props.timelinePosition]
    // };
  }
  componentDidUpdate() {
    const props = this.props;
    props.timeline[props.timelinePosition]['material']['color'] = rgb2hex(props.timeline[props.timelinePosition]['material']['color']);
    this.state = {
      el: props.el,
      data: props.timeline[props.timelinePosition]
    };
  }
  /*
  componentWillReceiveProps(newProps) {
    console.log('componentWillReceiveProps');
    let self = this;
    // later need to add event emit when change value
    this.setState({
      el: newProps.el,
      data: fetchDataFromEl(newProps.el)
    });
  }
  */
  componentWillUnmount() {
    for (var emitter in this.eventListener) {
      Events.removeListener(emitter,this.eventListener[emitter]);
    }
  }
  deleteObject() {
    // editor.deselect();
    // this.state.el.parentNode.removeChild(this.state.el);
  }
  selectTimelinePosition(transformMode) {
    const props = this.props;
    Events.emit('timelinepositionselected', props.el.object3D, props.timeline.uuid, props.timelinePosition);
    if (transformMode) {
      Events.emit('transformmodechanged', transformMode);
    }
  }
  changeObjectField(event) {
    const props = this.props;
    let field = event.target.getAttribute('data-value').split('.');
    // props.timeline
    // props.timelinePosition
    const tmp = this.state.data[field[0]];
    tmp[field[1]] = event.target.value;
    // this.setState({
    //   data: tmp
    // });
    props.timeline[props.timelinePosition][field[0]][field[1]] = event.target.value;
    Events.emit('timelinepositionselected', props.el.object3D, props.timeline.uuid, props.timelinePosition);
    // Events.emit('timelineselected', props.el.object3D, props.timeline.uuid);
  }
  render() {
    let data = this.state.data;
    if (!data) return null;
    return (
      <div>
        <div className="vec3D-col" onFocus={()=>{this.selectTimelinePosition('translate')}}>
          <button><FontAwesomeIcon icon="arrows-alt" /></button>
          <div className="vec3D-fields">
            <input className="textInput" value={data.position.x} data-value="position.x" onChange={this.changeObjectField} />
            <input className="textInput" value={data.position.y} data-value="position.y" onChange={this.changeObjectField} />
            <input className="textInput" value={data.position.z} data-value="position.z" onChange={this.changeObjectField} />
          </div>
        </div>
        <div>
          <div className="vec3D-col" onFocus={()=>{this.selectTimelinePosition('rotate')}}>
            <button><FontAwesomeIcon icon="sync-alt" /></button>
            <div className="vec3D-fields">
              <input className="textInput" value={data.rotation.x} data-value="rotation.x" onChange={this.changeObjectField} />
              <input className="textInput" value={data.rotation.y} data-value="rotation.y" onChange={this.changeObjectField} />
              <input className="textInput" value={data.rotation.z} data-value="rotation.z" onChange={this.changeObjectField} />
            </div>
          </div>
        </div>
        <div>
          <div className="vec3D-col" onFocus={()=>{this.selectTimelinePosition('scale')}}>
            <button><FontAwesomeIcon icon="expand-arrows-alt" /></button>
            <div className="vec3D-fields">
              <input className="textInput" value={data.scale.x} data-value="scale.x" onChange={this.changeObjectField} />
              <input className="textInput" value={data.scale.y} data-value="scale.y" onChange={this.changeObjectField} />
              <input className="textInput" value={data.scale.z} data-value="scale.z" onChange={this.changeObjectField} />
            </div>
          </div>
        </div>
        <div>
          <div className="vec3D-col" onFocus={()=>{this.selectTimelinePosition()}}>
            <button>radius top/ bottom</button>
            <div className="vec3D-fields">
              <input className="textInput" value={data.geometry.radiusTop} data-value="geometry.radiusTop" onChange={this.changeObjectField} />
              <input className="textInput" value={data.geometry.radiusBottom} data-value="geometry.radiusBottom" onChange={this.changeObjectField} />
            </div>
          </div>
        </div>
        {/* <div>
          texture: <span><img className={data.textureClass} src={data.texture} /></span><input onChange={this.changeObjectTexture} type="file" />
        </div> */}
        <div className="vec3D-col" onFocus={()=>{this.selectTimelinePosition()}}>
          <span>color: </span><input className="colorInput" onChange={this.changeObjectField} type="color" data-value="material.color" value={data.material.color} />
        </div>
        
        <div className="vec3D-col" onFocus={()=>{this.selectTimelinePosition()}}>
          opacity: <input className="textInput" value={data.material.opacity} data-value="material.opacity" onChange={this.changeObjectField} />
        </div>
      </div>
    );
  }
}
export default InfoTypeCone;