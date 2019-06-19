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
import iconNavigation from 'media/icons/navigation.svg';

import iconUndo from 'media/icons/undo.svg';
import iconRedo from 'media/icons/redo.svg';
import iconResetView from 'media/icons/resetview.svg';
import iconPreview from 'media/icons/preview.svg';
import iconShare from 'media/icons/share.svg';
import './buttonsPanel.css';
import config from 'globals/config';

const Events = require('vendor/Events.js');

class ButtonsPanel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      editor_open: false
    };
    this.toggleEditor = this.toggleEditor.bind(this);
    this.addNewEntity = this.addNewEntity.bind(this);
    this.resetView = this.resetView.bind(this);
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
    this.props.sceneContext.toggleEditor();
  }
  resetView() {
    const props = this.props;
    const sceneContext = props.sceneContext;
    sceneContext.resetView();
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
          </div>
        </div>
        <div className="seperator"></div>
        <div className="buttons-list buttons-2d">
          <div className="buttons-list-wrapper">
            <button onClick={()=>this.addNewEntity('a-image')} title={'Add an image'}>
              <img src={iconImage} alt=""/>
            </button>
            <button onClick={()=>this.addNewEntity('a-video')} title={'Add a video'}>
              <img src={iconVideo} alt=""/>
            </button>
            <button onClick={()=>this.addNewEntity('a-text')} className="addText" title={'Add a text'}>
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
            
            <button onClick={()=>this.addNewEntity('a-navigation')} title={'Add a navigation'}>
              <img src={iconNavigation} alt=""/>
            </button>
          </div>
        </div>
        <div className="buttons-list buttons-presentation">
          <div className="buttons-list-wrapper">
            <button className="button-undo" onClick={sceneContext.undo}>
              <img src={iconUndo} alt="" />
            </button>
            <button className="button-redo" onClick={sceneContext.redo}>
              <img src={iconRedo} alt="" />
            </button>
            <div className="seperator"></div>
            <button className="button-resetView" onClick={this.resetView}>
              <img src={iconResetView} alt="" />
            </button>
            <div className="seperator"></div>
            <button className="button-preview"
              onClick={this.toggleEditor}
              // disable it to prevent press space trigger it when hide
              disabled={!(sceneContext.editor && sceneContext.editor.opened)}
            >
              <img src={iconPreview} alt="" />
            </button>
            <Link className="button-present" to={routes.presenterWithProjectFilePathQuery(props.currentLoadedProjectPath)}>
              <svg viewBox="0 0 107.87 42.65" xmlSpace="preserve">
                <g>
                  <path className="button-background" d="M86.55,42.52H21.33c-11.71,0-21.2-9.49-21.2-21.2v0c0-11.71,9.49-21.2,21.2-21.2l65.22,0
                    c11.71,0,21.2,9.49,21.2,21.2v0C107.74,33.03,98.25,42.52,86.55,42.52z"/>
                  <path className="button-text" d="M30.87,24.15c-0.78,0-1.48,0.31-1.99,0.82l-3.27-1.94c0.21-0.53,0.33-1.1,0.33-1.7c0-0.6-0.12-1.17-0.33-1.7
                    l3.28-1.94c0.51,0.51,1.21,0.82,1.99,0.82c1.56,0,2.82-1.26,2.82-2.82c0-1.56-1.26-2.82-2.82-2.82c-1.56,0-2.82,1.26-2.82,2.82
                    c0,0.27,0.05,0.53,0.12,0.78l-3.28,1.95c-0.84-1.02-2.11-1.67-3.54-1.67c-2.53,0-4.58,2.05-4.58,4.58c0,2.53,2.05,4.58,4.58,4.58
                    c1.42,0,2.7-0.65,3.54-1.67l3.28,1.95c-0.07,0.25-0.12,0.51-0.12,0.78c0,1.56,1.26,2.82,2.82,2.82c1.56,0,2.82-1.26,2.82-2.82
                    C33.69,25.41,32.43,24.15,30.87,24.15z M30.87,14.28c0.78,0,1.41,0.63,1.41,1.41c0,0.78-0.63,1.41-1.41,1.41
                    c-0.78,0-1.41-0.63-1.41-1.41C29.46,14.91,30.09,14.28,30.87,14.28z M21.35,24.5c-1.75,0-3.17-1.42-3.17-3.17s1.42-3.17,3.17-3.17
                    c1.75,0,3.17,1.42,3.17,3.17S23.1,24.5,21.35,24.5z M30.87,28.37c-0.78,0-1.41-0.63-1.41-1.41c0-0.78,0.63-1.41,1.41-1.41
                    c0.78,0,1.41,0.63,1.41,1.41C32.28,27.74,31.65,28.37,30.87,28.37z"/>
                  <g>
                    <path className="button-text" d="M49.26,26.68c-0.51-0.13-1.05-0.35-1.63-0.65v-1.76c0.42,0.34,0.92,0.62,1.53,0.82
                      c0.6,0.21,1.23,0.31,1.9,0.31c0.65,0,1.14-0.13,1.47-0.4c0.33-0.27,0.5-0.65,0.5-1.14c0-0.33-0.1-0.6-0.29-0.82
                      c-0.19-0.21-0.43-0.39-0.72-0.53c-0.29-0.14-0.69-0.3-1.21-0.5l-0.35-0.13c-0.59-0.2-1.07-0.41-1.45-0.62
                      c-0.38-0.21-0.7-0.52-0.95-0.91c-0.26-0.39-0.38-0.9-0.38-1.52c0-0.51,0.13-1,0.38-1.46s0.66-0.83,1.2-1.13
                      c0.54-0.29,1.23-0.44,2.05-0.44c0.6,0,1.1,0.06,1.5,0.17c0.4,0.11,0.88,0.3,1.43,0.57v1.73c-0.54-0.34-1.01-0.59-1.41-0.76
                      c-0.39-0.17-0.87-0.25-1.41-0.25c-0.63,0-1.11,0.13-1.44,0.38c-0.33,0.26-0.5,0.59-0.5,1.01c0,0.35,0.09,0.64,0.27,0.86
                      s0.42,0.39,0.71,0.53c0.29,0.13,0.72,0.29,1.27,0.47c0.65,0.21,1.19,0.43,1.62,0.66s0.79,0.54,1.06,0.94
                      c0.28,0.4,0.42,0.91,0.42,1.53c0,0.59-0.13,1.12-0.39,1.61s-0.67,0.88-1.21,1.17c-0.55,0.29-1.23,0.44-2.06,0.44
                      C50.41,26.88,49.77,26.82,49.26,26.68z"/>
                    <path className="button-text" d="M64.33,21.71v4.98h-1.68v-4.77c0-0.65-0.15-1.15-0.46-1.49c-0.31-0.34-0.77-0.51-1.38-0.51
                      c-0.65,0-1.28,0.18-1.89,0.53l-0.02,6.24h-1.66V15.27h1.68v3.87c0.8-0.44,1.59-0.66,2.37-0.66
                      C63.32,18.48,64.33,19.56,64.33,21.71z"/>
                    <path className="button-text" d="M72.81,19.11c0.61,0.42,0.92,1.1,0.9,2.04v3.84c0,0.73-0.32,1.23-0.96,1.51c-0.64,0.28-1.55,0.42-2.74,0.42
                      c-0.95,0-1.73-0.2-2.35-0.59c-0.62-0.39-0.93-1.06-0.93-1.98c0-0.88,0.25-1.53,0.76-1.97c0.51-0.44,1.22-0.66,2.15-0.66
                      c0.96,0,1.76,0.19,2.4,0.58v-0.77c0-1.09-0.66-1.63-1.97-1.63c-0.47,0-0.94,0.07-1.41,0.22c-0.47,0.14-0.86,0.34-1.17,0.6v-1.57
                      c0.3-0.19,0.73-0.35,1.3-0.48c0.57-0.13,1.16-0.19,1.77-0.19C71.45,18.48,72.19,18.69,72.81,19.11z M71.63,25.47
                      c0.28-0.1,0.42-0.29,0.42-0.58v-1.55c-0.54-0.23-1.14-0.35-1.79-0.35c-0.61,0-1.07,0.11-1.38,0.32
                      c-0.31,0.21-0.47,0.53-0.47,0.96c0,0.45,0.18,0.78,0.54,1.01c0.36,0.22,0.78,0.34,1.27,0.34C70.88,25.62,71.35,25.57,71.63,25.47
                      z"/>
                    <path className="button-text" d="M76.49,19.39c0.3-0.18,0.8-0.38,1.52-0.59c0.71-0.21,1.42-0.32,2.13-0.32c0.43,0,0.79,0.07,1.09,0.21v1.34
                      c-0.3-0.04-0.66-0.06-1.07-0.06c-0.71,0-1.37,0.05-1.98,0.16v6.56h-1.68V19.39z"/>
                    <path className="button-text" d="M88.89,19.67c0.58,0.8,0.87,1.93,0.86,3.38h-5.63c0.05,0.79,0.29,1.39,0.7,1.8
                      c0.41,0.41,0.99,0.62,1.75,0.62c0.49,0,0.96-0.06,1.41-0.18c0.45-0.12,0.84-0.28,1.18-0.47v1.57c-0.83,0.36-1.79,0.54-2.87,0.54
                      c-1.21,0-2.15-0.37-2.84-1.1c-0.69-0.73-1.03-1.77-1.03-3.11c0-1.38,0.32-2.43,0.98-3.16c0.65-0.73,1.57-1.1,2.75-1.1
                      C87.39,18.47,88.31,18.87,88.89,19.67z M84.77,20.29c-0.32,0.3-0.53,0.81-0.62,1.52h3.89c-0.07-0.68-0.27-1.18-0.58-1.5
                      c-0.31-0.31-0.76-0.47-1.36-0.47C85.53,19.84,85.09,19.99,84.77,20.29z"/>
                  </g>
                </g>
              </svg>
            </Link>
          </div>
        </div>
      </div>
    );
  }
}
export default withSceneContext(ButtonsPanel);