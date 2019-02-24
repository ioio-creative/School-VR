/*
  Buttons Panel should be similar to buttons in powerpoint ( ▫ )
  ▫▫▫▫▫▫▫▫▫▫
  ┌────────┐
  │ AFRAME │
  └────────◲
*/
import React, {Component} from 'react';
import {Link} from 'react-router-dom';

import * as btns from 'containers/aframeEditor/panelItem/editorFunctions';
import * as entityFunction from 'utils/aframeEditor/aFrameEntities';
import './buttonsPanel.css';

const Events = require('vendor/Events.js');

class ButtonsPanel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      editor_open: false
    };
    this.toggleEditor = this.toggleEditor.bind(this);
  }
  componentDidMount() {
  }
  componentWillUnmount() {
  }
  toggleEditor() {
    this.props.editor.toggle();
  }
  render() {
    return (
      <div id="buttons-panel">
        <div className="buttons-list buttons-3d">
          <div className="buttons-list-wrapper">
            <button onClick={() => { entityFunction.addNewBox() }}>
              <svg id="button-box" width="50" height="50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30.86 35.64">
                <polygon fill="#90baba" points="15.43 35.64 0 26.73 0 8.91 15.43 17.82 15.43 35.64"/>
                <polygon fill="#9de0de" points="15.43 17.82 0 8.91 15.43 0 30.86 8.91 15.43 17.82"/>
                <polygon fill="#5faaa6" points="30.86 26.73 15.43 35.64 15.43 17.82 30.86 8.91 30.86 26.73"/>
              </svg>
            </button>
            <button onClick={() => { entityFunction.addNewSphere() }}>
              <svg id="button-ball" width="50" height="50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 35.64 35.64">
                <linearGradient id="ball-linear-gradient" x1="8.91" y1="2.38" x2="26.73" y2="33.25" gradientUnits="userSpaceOnUse">
                  <stop offset="0" stopColor="#9de0de"/>
                  <stop offset="0.3" stopColor="#9de0de"/>
                  <stop offset="0.47" stopColor="#98dcda"/>
                  <stop offset="0.66" stopColor="#8bd0ce"/>
                  <stop offset="0.85" stopColor="#75bdba"/>
                  <stop offset="1" stopColor="#5faaa6"/>
                </linearGradient>
                <circle fill="url(#ball-linear-gradient)" cx="17.82" cy="17.82" r="17.82"/>
              </svg>
            </button>
            <button onClick={() => { entityFunction.addNewTetrahedron() }}>
              <svg id="button-pyramid" width="50" height="50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 33.45 35.64">
                <polygon fill="#9de0de" points="0 25.98 16.72 35.64 16.72 0 0 25.98"/>
                <polygon fill="#5faaa6" points="33.45 25.98 16.72 0 16.72 35.64 16.72 35.64 33.45 25.98"/>
              </svg>
            </button>
            <button onClick={() => { entityFunction.addNewCylinder() }}>
              <svg id="button-cylinder" width="50" height="50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20.59 35.64">
                <path fill="#9de0de" d="M3,1.74a16.08,16.08,0,0,1,14.55,0c4,2.32,4,6.1,0,8.41A16.11,16.11,0,0,1,3,10.15C-1,7.82-1,4.06,3,1.74Z"/>
                <path fill="#5faaa6" d="M17.57,10.15A16.08,16.08,0,0,1,3,10.15C1,9,0,7.46,0,6H0V29.7c0,1.52,1,3.05,3,4.2a16.08,16.08,0,0,0,14.55,0c2-1.16,3-2.68,3-4.2V5.94C20.59,7.46,19.58,9,17.57,10.15Z"/>
              </svg>
            </button>
            <button onClick={() => { entityFunction.addNewCone() }}>
              <svg id="button-cone" width="50" height="50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30.98 35.63">
                <linearGradient id="cone-linear-gradient" x1="6.27" y1="14.34" x2="30.77" y2="28.49" gradientUnits="userSpaceOnUse">
                  <stop offset="0" stopColor="#9de0de"/>
                  <stop offset="0.25" stopColor="#93d7d5"/>
                  <stop offset="0.67" stopColor="#79c0bd"/>
                  <stop offset="1" stopColor="#5faaa6"/>
                </linearGradient>
                <path fill="url(#cone-linear-gradient)" d="M29.81,23.24,15.49,0,1.22,23.18A5.92,5.92,0,0,0,0,26.68C0,29,1.51,31.26,4.54,33c6,3.49,15.86,3.49,21.9,0C31,30.35,32.13,26.47,29.81,23.24Z"/>
              </svg>
            </button>
          </div>
        </div>
        <div className="buttons-list buttons-2d">
          <div className="buttons-list-wrapper">
            {/* <button onClick={() => entityFunction.addNewGif()}>
              addNewGif
            </button> */}
            <button className="new-text-button" onClick={() => entityFunction.addNewText()}>
              T
            </button>
            <button onClick={() => entityFunction.addNewTriangle()}>
              addNewTriangle
            </button>
            {/* <button onClick={() => entityFunction.addNewVideo()}>
              addNewVideo
            </button> */}
            {entityFunction.addNewImage()}
            {/* {btns.addNewGif()} */}
            {entityFunction.addNewGif()}
            {/* {btns.addNewVideo()} */}
            {entityFunction.addNewVideo()}
            {btns.addNewVideoSphere()}
            {btns.addNewImageSphere()}
          </div>
        </div>
      </div>
      );
  }
}
export default ButtonsPanel;
