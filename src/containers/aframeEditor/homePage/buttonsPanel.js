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
import {LanguageContextConsumer, LanguageContextMessagesConsumer} from 'globals/contexts/locale/languageContext';

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
          <LanguageContextConsumer render={
            ({ language, messages }) => (
              <div className="buttons-list-wrapper">                
                <button onClick={()=>this.addNewEntity('a-box')} title={messages['AddThingsPanel.ThreeD.AddBoxTooltip']}>
                  <img src={iconCube} alt=""/>
                </button>
                <button onClick={()=>this.addNewEntity('a-sphere')} title={messages['AddThingsPanel.ThreeD.AddSphereTooltip']}>
                  <img src={iconSphere} alt=""/>
                </button>
                {/* <button onClick={()=>this.addNewEntity('a-tetrahedron')} title={messages['AddThingsPanel.ThreeD.AddTetrahedronTooltip']}>
                  <img src={iconPyramid} alt=""/>
                </button> */}
                <button onClick={()=>this.addNewEntity('a-pyramid')} title={messages['AddThingsPanel.ThreeD.AddPyramidTooltip']}>
                  <img src={iconPyramid} alt=""/>
                </button>
                <button onClick={()=>this.addNewEntity('a-cylinder')} title={messages['AddThingsPanel.ThreeD.AddCylinderTooltip']}>
                  <img src={iconCylinder} alt=""/>
                </button>
                <button onClick={()=>this.addNewEntity('a-cone')} title={messages['AddThingsPanel.ThreeD.AddConeTooltip']}>
                  <img src={iconCone} alt=""/>
                </button>
              </div>
            )
          } />          
        </div>
        <div className="seperator"></div>
        <div className="buttons-list buttons-2d">
          <LanguageContextConsumer render={
            ({ language, messages }) => (
              <div className="buttons-list-wrapper">
                <button onClick={()=>this.addNewEntity('a-image')} title={messages['AddThingsPanel.TwoD.AddImageTooltip']}>
                  <img src={iconImage} alt=""/>
                </button>
                <button onClick={()=>this.addNewEntity('a-video')} title={messages['AddThingsPanel.TwoD.AddVideoTooltip']}>
                  <img src={iconVideo} alt=""/>
                </button>
                <button onClick={()=>this.addNewEntity('a-text')} className="addText" title={messages['AddThingsPanel.TwoD.AddTextTooltip']}>
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
                <button onClick={()=>this.addNewEntity('a-sky')} title={messages['AddThingsPanel.TwoD.AddSkyTooltip']}>
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
                
                <button onClick={()=>this.addNewEntity('a-navigation')} title={messages['AddThingsPanel.TwoD.AddNavigationTooltip']}>
                  <img src={iconNavigation} alt=""/>
                </button>
              </div>
            )
          } />          
        </div>
        <div className="buttons-list buttons-presentation">
          <LanguageContextConsumer render={
            ({ language, messages }) => (
              <div className="buttons-list-wrapper">
                <button className="button-undo" onClick={sceneContext.undo} title={messages['Menu.Edit.UndoLabel']}>
                  <img src={iconUndo} alt={messages['Menu.Edit.UndoLabel']} />
                </button>
                <button className="button-redo" onClick={sceneContext.redo} title={messages['Menu.Edit.RedoLabel']}>
                  <img src={iconRedo} alt={messages['Menu.Edit.RedoLabel']} />
                </button>
                <div className="seperator"></div>
                <button className="button-resetView" onClick={this.resetView} title={messages['PresentationPreparationPanel.ResetViewTooltip']}>
                  <img src={iconResetView} alt={messages['PresentationPreparationPanel.ResetViewTooltip']} />
                </button>
                <div className="seperator"></div>
                <button className="button-preview"
                  onClick={this.toggleEditor}
                  // disable it to prevent press space trigger it when hide
                  disabled={!(sceneContext.editor && sceneContext.editor.opened)}
                  title={messages['PresentationPreparationPanel.PlayTimelineTooltip']}
                >
                  <img src={iconPreview} alt={messages['PresentationPreparationPanel.PlayTimelineTooltip']} />
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
                      
                      <text x="45" y="27" style={{fill: 'white', fontSize: '18px'}}>
                        <LanguageContextMessagesConsumer messageId="PresentationPreparationPanel.ShareLabel" />
                      </text>
                    </g>
                  </svg>
                </Link>
              </div>
            )
          } />          
        </div>
      </div>
    );
  }
}
export default withSceneContext(ButtonsPanel);