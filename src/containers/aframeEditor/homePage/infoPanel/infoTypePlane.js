/*
  info generation of right panel
*/
import React, {Component} from 'react';
import {roundTo, addToAsset} from 'globals/aframeEditor/helperfunctions';

var Events = require('vendor/Events.js');
let editor = null;

Events.on('editor-load', obj => {
    editor = obj;
});

function fetchDataFromEl(el) {
  let result = {};
  let geo = el.getAttribute('geometry');
  result['geometry'] = {width:geo.width,height:geo.height};
  let position = el.getAttribute('position');
  result['position'] = {x:roundTo(position.x,1),y:roundTo(position.y,1),z:roundTo(position.z,1)};
  let rotation = el.getAttribute('rotation');
  result['rotation'] = {x:roundTo(rotation.x,1),y:roundTo(rotation.y,1),z:roundTo(rotation.z,1)};
  let scale = el.getAttribute('scale');
  result['scale'] = {x:roundTo(scale.x,1),y:roundTo(scale.y,1),z:roundTo(scale.z,1)};
  result['material'] = {};
  let color = el.getAttribute('material').color;
  result['material']['color'] = color;
  let texture = el.getAttribute('material').src;
  result['texture'] = (typeof(texture) == "object"? texture.src: texture);
  result['textureClass'] = (result['texture']? 'texturePreview': 'texturePreview noTexture');
  result['el'] = el;
  return result;
}

class InfoTypePlane extends Component {
  constructor(props) {
    super(props);
    this.state = {
      el: props.el
    };
    this.eventListener = Array();
    this.changeObjectTexture = this.changeObjectTexture.bind(this);
    this.changeObjectField = this.changeObjectField.bind(this);
    this.deleteObject = this.deleteObject.bind(this);
  }
  componentDidMount() {
    let self = this;
    // later need to add event emit when change value
    this.setState({
      data: fetchDataFromEl(this.state.el)
    });
    let evt = {
      'refreshsidebarobject3d': function(obj) {
        // console.log('refreshsidebarobject3d',obj);
        self.setState({
          data: fetchDataFromEl(self.state.el)
        });
      }
    };
    for (var emitter in evt) {
      Events.on(emitter, evt[emitter]);
    }
    // evt.forEach() = Events.on('refreshsidebarobject3d', )
    this.eventListener = evt;
  }
  componentWillReceiveProps(newProps) {
    let self = this;
    // later need to add event emit when change value
    this.setState({
      el: newProps.el
    });
    this.setState({
      data: fetchDataFromEl(newProps.el)
    });
  }
  componentWillUnmount() {
    for (var emitter in this.eventListener) {
      Events.removeListener(emitter,this.eventListener[emitter]);
    }
  }
  deleteObject() {
    editor.deselect();
    this.state.el.parentNode.removeChild(this.state.el);
  }
  changeObjectField(event) {
    let field = event.target.getAttribute('data-value').split('.');
    let tmp = this.state.data[field[0]];
    tmp[field[1]] = event.target.value;
    this.state.el.setAttribute(field[0], tmp);
    this.state.data[field[0]][field[1]] = event.target.value;
    this.setState({
      data: this.state.data
    })
    Events.emit('objectchanged',this.state.el.object3D);
  }
  changeObjectTexture(event) {
    let evt = event.target;
    let self = this;
    if (evt.files && evt.files[0]) {
      var reader = new FileReader();
      reader.onload = function (e) {
        let img = new Image();
        img.onload = function(){
          let w = this.width;
          let h = this.height;
          if (w>h) {
              w = w/h;
              h = 1;
          } else {
              h = h/w;
              w = 1;
          }
          let newid = addToAsset(img);

          self.state.el.setAttribute('material',{
            src: '#'+ newid
          });
          self.state.data.texture = e.target.result;
          self.setState({
            data: self.state.data
          })
        }
        img.src = e.target.result;
      };
      reader.readAsDataURL(evt.files[0]);
    }
    
  }
  render() {
    let data = this.state.data;
    if (!data) return null;
    return (
      <div>
        <div>
          <div>Plane <span onClick={this.deleteObject} className="el-remove-btn">Delete</span></div>
          <div>
            position: 
            <input className="textInput" value={data.position.x} data-value="position.x" onChange={this.changeObjectField} />
            <input className="textInput" value={data.position.y} data-value="position.y" onChange={this.changeObjectField} />
            <input className="textInput" value={data.position.z} data-value="position.z" onChange={this.changeObjectField} />
          </div>
          <div>
            size:
            <input className="textInput" value={data.geometry.width} data-value="geometry.width" onChange={this.changeObjectField} />
            <input className="textInput" value={data.geometry.height} data-value="geometry.height" onChange={this.changeObjectField} />
          </div>
          <div>
            rotation:
            <input className="textInput" value={data.rotation.x} data-value="rotation.x" onChange={this.changeObjectField} />
            <input className="textInput" value={data.rotation.y} data-value="rotation.y" onChange={this.changeObjectField} />
            <input className="textInput" value={data.rotation.z} data-value="rotation.z" onChange={this.changeObjectField} />
          </div>
          <div>
            scale:
            <input className="textInput" value={data.scale.x} data-value="scale.x" onChange={this.changeObjectField} />
            <input className="textInput" value={data.scale.y} data-value="scale.y" onChange={this.changeObjectField} />
            <input className="textInput" value={data.scale.z} data-value="scale.z" onChange={this.changeObjectField} />
          </div>
          <div>
            texture: <span><img className={data.textureClass} src={data.texture} /></span><input onChange={this.changeObjectTexture} type="file" />
          </div>
          <div>
            color: <input className="colorInput" onChange={this.changeObjectField} type="color" data-value="material.color" value={data.material.color} />
          </div>
        </div>
      </div>
    );
  }
}
export default InfoTypePlane;