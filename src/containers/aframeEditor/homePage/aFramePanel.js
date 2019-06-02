import React, {Component} from 'react';

import AFRAME from 'aframe';
import 'aframe-gif-shader';

import {withSceneContext} from 'globals/contexts/sceneContext';

// import dcjaiobj from '../../3Dmodels/20190215_dave_pose(3d glasses).obj';
// import dcjaitex from '../../3Dmodels/GF_Dave_smile.jpg';

import './aFramePanel.css';

const Events = require('vendor/Events.js');

AFRAME.registerComponent('cursor-listener', {
  init: function () {
    var lastIndex = -1;
    const hoverColor = '#AAAAAA';
    const clickColor = '#880000';
    const defaultColor = this.el.getAttribute('material')['color'];
    // console.log(defaultColor);
    let childrenEls = [];
    if (this.el.children) {
      childrenEls = Array.prototype.slice.call(this.el.children);
    }
    this.el.addEventListener('click', function (evt) {
      // lastIndex = (lastIndex + 1) % COLORS.length;
      const isVisible = this.getAttribute('material')['opacity'];
      console.log(isVisible);
      if (isVisible) {
        this.setAttribute('material', 'color', clickColor);
        childrenEls.forEach(childEl => {
          childEl.setAttribute('material', 'color', clickColor);
        })
        
        const nextSlideId = this.sceneEl.data.sceneContext.getCurrentEntity(this.id)['navigateToSlideId'];
        // console.log(nextSlideId);
        setTimeout(_=> {
          this.setAttribute('material', 'color', defaultColor);
          childrenEls.forEach(childEl => {
            childEl.setAttribute('material', 'color', defaultColor);
          })
          this.sceneEl.data.sceneContext.selectSlide(nextSlideId);
          this.sceneEl.data.sceneContext.playSlide();
        }, 250);
      }
    });
    this.el.addEventListener('mouseenter', function (evt) {
      // lastIndex = (lastIndex + 1) % COLORS.length;
      const isVisible = this.getAttribute('material')['opacity'];
      if (isVisible) {
        this.setAttribute('material', 'color', hoverColor);
        childrenEls.forEach(childEl => {
          childEl.setAttribute('material', 'color', hoverColor);
        })
      }
    });
    this.el.addEventListener('mouseleave', function () {
      // lastIndex = (lastIndex + 1) % COLORS.length;
      this.setAttribute('material', 'color', defaultColor);
      childrenEls.forEach(childEl => {
        childEl.setAttribute('material', 'color', defaultColor);
      })
    });
  }
});
class AFramePanel extends Component {
  constructor(props) {
    super(props);
    // this.Editor = this.props.editor;
    this.editor = null;
    this.sceneEl = null;
    this.cameraEl = null;
    this.cameraPreviewEl = null;
    this.cameraPreviewScreenEl = null;
    this.updateCameraView = this.updateCameraView.bind(this);
  }
  componentDidMount() {
    // real-time view on the camera
    // Events.on('editor-load', obj => {
    //   this.editor = obj;
    // });
    // Events.on('refreshsidebarobject3d', _=> {
    //   this.updateCameraView();
    // })
    // window.addEventListener('resize', this.updateCameraView);s
    const props = this.props;
    const sceneContext = props.sceneContext;
    this.sceneEl.data = {
      sceneContext: sceneContext
    }
  }
  updateCameraView() {
    const editor = this.editor;
    const renderer = editor.sceneEl.renderer;
    const scene = editor.sceneEl.object3D;
    const camera = editor.currentCameraEl.getObject3D('camera');

    const width = renderer.domElement.width;
    const height = renderer.domElement.height;
    const newHeight = 270 / width * height;
    const canvas = this.cameraPreviewEl;
    const ctx = canvas.getContext('2d');

    const helper_status = [];
    for (let i = 0; i < editor.sceneHelpers.children.length; i++){
      helper_status[i] = editor.sceneHelpers.children[i].visible;
      editor.sceneHelpers.children[i].visible = false;
    }
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.render(scene, camera);
    for (let i = 0; i < editor.sceneHelpers.children.length; i++){
      editor.sceneHelpers.children[i].visible = helper_status[i];
    }
    
    canvas.width = 270;
    canvas.height = newHeight;
    if (camera.aspect > 1) {
      this.cameraPreviewScreenEl.setAttribute( 'width', canvas.width / 270 * 0.6 );
      this.cameraPreviewScreenEl.setAttribute( 'height', canvas.height / 270 * 0.6 );
    } else {
      this.cameraPreviewScreenEl.setAttribute( 'width', canvas.width / newHeight * 0.6 );
      this.cameraPreviewScreenEl.setAttribute( 'height', canvas.height / newHeight * 0.6 );
    }
    ctx.drawImage(renderer.domElement, 0, 0, canvas.width, canvas.height);
  }
  componentWillUnmount() {
  }
  render() {
    const props = this.props;
    const sceneContext = props.sceneContext;
    const entitiesList = sceneContext.getEntitiesList();
    return (
    	<div id="aframe-panel">
	    	<a-scene embedded background="color:#6EBAA7" el-name="Background" ref={ref=> {
          this.sceneEl = ref;
        }} >
          <a-assets>
            <canvas ref={(ref)=>this.cameraPreviewEl=ref} id="camera-preview"/>
            
            {/* <a-asset-item id="dcjaiModelObj" src={dcjaiobj}></a-asset-item>
            <img id="dcjaiModelTex" src={dcjaitex} /> */}

          </a-assets>
          {/* <a-sky el-name="sky" el-isSystem={true} color="#FF0000"></a-sky> */}
          <a-camera el-isSystem={false} el-defaultCamera="true" position="0 2 5" wasd-controls look-controls ref={(ref)=>this.cameraEl=ref}>
            {/* camera model */}
            <a-cone position="0 0 0.5" rotation="90 0 0" geometry="radius-top: 0.15;radius-bottom: 0.5" material="color:#333"></a-cone>
            <a-box position="0 0 1" scale="0.8 0.8 1.2" material="color:#222"></a-box>
            <a-cylinder position="0 0.6 0.7" scale="0.3 0.3 0.3" rotation="0 0 90" material="color:#272727"></a-cylinder>
            <a-cylinder position="0 0.6 1.3" scale="0.3 0.3 0.3" rotation="0 0 90" material="color:#272727"></a-cylinder>
            {/* camera "monitor" */}
            {/* <a-plane position="0 0 1.61" material="src: #camera-preview" ref={ref=>this.cameraPreviewScreenEl=ref }scale="0.8 0.8 0.8" rotation="0 0 0"></a-plane> */}
            {/* camera model end */}
            {/* click pointer */}
            <a-entity cursor="fuse: true; fuseTimeout: 500"
              position="0 0 -1"
              geometry="primitive: ring; radiusInner: 0.02; radiusOuter: 0.03"
              material="color: black; shader: flat">
            </a-entity>
            {/* click pointer end */}
          </a-camera>
          <a-light type="ambient" intensity="0.8" el-name="environment light" el-isSystem={true} color="#EEEEEE"></a-light>
          <a-light position="600 300 900" color="#FFFFFF" intensity="0.9" type="directional" el-name="directional light" el-isSystem={true}></a-light>
          {/**
           * method to load an obj model to a-entity
           */}
          {/* <a-entity obj-model="obj:#dcjaiModelObj" material="src:#dcjaiModelTex" scale="0.03 0.03 0.03"></a-entity> */}
        </a-scene>
	    </div>
	);
  }
}
export default withSceneContext(AFramePanel);