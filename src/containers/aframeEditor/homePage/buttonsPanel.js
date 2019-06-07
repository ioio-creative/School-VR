/*
  Buttons Panel should be similar to buttons in powerpoint ( ▫ )
  ▫▫▫▫▫▫▫▫▫▫
  ┌────────┐
  │ AFRAME │
  └────────◲
*/
import React, {Component} from 'react';
import {Link} from 'react-router-dom';

import {withSceneContext} from 'globals/contexts/sceneContext';

// import * as btns from 'containers/panelItem/editorFunctions';
// import * as entityFunction from 'utils/deleted-aFrameEntities';
import routes from 'globals/routes';

import iconCone from 'media/icons/cone.svg';
import iconCube from 'media/icons/cube.svg';
import iconCylinder from 'media/icons/cylinder.svg';
import iconPyramid from 'media/icons/pyramid.svg';
import iconSphere from 'media/icons/sphere.svg';
import iconText from 'media/icons/text.svg';
import iconImage from 'media/icons/image.svg';
import iconVideo from 'media/icons/video.svg';
import iconSky from 'media/icons/360.svg';
import './buttonsPanel.css';

const Events = require('vendor/Events.js');

class ButtonsPanel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      editor_open: false
    };
    this.toggleEditor = this.toggleEditor.bind(this);
    this.addNewEntity = this.addNewEntity.bind(this);
  }
  componentDidMount() {
  }
  componentWillUnmount() {
  }
  addNewEntity(type) {
    const props = this.props;
    const sceneContext = props.sceneContext;
    sceneContext.addNewEntity(type);
  }
  toggleEditor() {
    this.props.editor.toggle();
  }
  render() {
    const props = this.props;
    const sceneContext = props.sceneContext;
    return (
      <div id="buttons-panel">
        <div className="buttons-list buttons-3d">
          <div className="buttons-list-wrapper">
            <button onClick={()=>this.addNewEntity('a-box')} title={'Add a box'}>
              <img src={iconCube} alt=""/>
            </button>
            <button onClick={()=>this.addNewEntity('a-sphere')} title={'Add a sphere'}>
              <img src={iconSphere} alt=""/>
            </button>
            {/* <button onClick={()=>this.addNewEntity('a-tetrahedron')} title={'Add a tetrahedron'}>
              <img src={iconPyramid} alt=""/>
            </button> */}
            <button onClick={()=>this.addNewEntity('a-pyramid')} title={'Add a pyramid'}>
              <img src={iconPyramid} alt=""/>
            </button>
            <button onClick={()=>this.addNewEntity('a-cylinder')} title={'Add a cylinder'}>
              <img src={iconCylinder} alt=""/>
            </button>
            <button onClick={()=>this.addNewEntity('a-cone')} title={'Add a cone'}>
              <img src={iconCone} alt=""/>
            </button>
            <button onClick={()=>this.addNewEntity('a-navigation')} style={{fontSize: 35}} title={'Add a navigation'}>
              ⬇
            </button>
          </div>
        </div>
        <div className="buttons-list buttons-2d">
          <div className="buttons-list-wrapper">
            <button onClick={()=>this.addNewEntity('a-plane')} title={'Add a image'}>
              <img src={iconImage} alt=""/>
            </button>
            <button onClick={()=>this.addNewEntity('a-video')} title={'Add a video'}>
              <img src={iconVideo} alt=""/>
            </button>
            <button onClick={()=>this.addNewEntity('a-text')} title={'Add a text'}>
              <img src={iconText} alt=""/>
            </button>
            {/* <button onClick={()=>this.addNewEntity('a-triangle')}>
              addNewTriangle
            </button> */}
            {/* <button onClick={() => entityFunction.addNewVideo()}>
              addNewVideo
            </button> */}
            {/* {btns.addNewVideo()} */}
            {/* {btns.addNewImageSphere()} */}
            <button onClick={()=>this.addNewEntity('a-sky')}>
              <img src={iconSky} alt=""/>
            </button>
            {/* <button onClick={()=>this.addNewEntity('a-videoShpere')}>
              addNew360Video
            </button> */}
            {/* <button onClick={()=>this.addNewEntity('a-sky')}>
              rotate
            </button>
            <button onClick={()=>this.addNewEntity('a-sky')}>
              scale
            </button> */}
          </div>
        </div>
      </div>
    );
  }
}
export default withSceneContext(ButtonsPanel);