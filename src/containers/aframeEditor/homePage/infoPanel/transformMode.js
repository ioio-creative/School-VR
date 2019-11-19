import React, {Component} from 'react';
// import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';

// import iconTranslate from 'media/icons/translate.svg';
// import iconRotate from 'media/icons/rotate.svg';
// import iconScale from 'media/icons/scale.svg';

import {LanguageContextConsumer} from 'globals/contexts/locale/languageContext';

import './transformMode.css';

var Events = require('vendor/Events.js');

class TransformMode extends Component {
  constructor(props) {
    super(props);
    this.state = {
      editorMode: null, // props.modes[0]
    }
    this.callback = this.props.onUpdate || function() {};
    this.updateEntity = this.updateEntity.bind(this);
    // console.log('constructor');
  }
  componentDidMount() {
    // console.log('componentDidMount');
    // Events.emit('transformmodechanged', this.props.modes[0]);
    Events.on('objectchanged', this.updateEntity)
    // this.changeTransformMode(this.props.modes[0]);
  }
  updateEntity(object) {
    this.callback(
      object.el.getAttribute('position'),
      object.el.getAttribute('rotation'),
      object.el.getAttribute('scale')
    );
  }
  changeTransformMode(newMode) {
    this.setState({
      editorMode: newMode
    }, _=> {
      if (newMode) {
        Events.emit('transformmodechanged', newMode);
        Events.emit('enablecontrols');
      } else {
        Events.emit('disablecontrols');
      }
    });
  }
  componentWillUnmount() {
    Events.removeListener('objectchanged', this.updateEntity);
  }
  render() {
    const props = this.props;
    if (Object.prototype.toString.call(props.modes) !== "[object Array]" || props.modes.length === 0) {
      return null;
    }
    return (
      <LanguageContextConsumer render={
        ({ language, messages }) => (
          <>
            {props.modes.map((mode, idx) => {
              switch (mode) {
                case 'translate': {
                  return <button 
                    key="translate"
                    className={(this.state.editorMode === "translate"? "selected": "")}
                    onClick={()=>{this.changeTransformMode('translate')}}
                    title={messages['EditThingPanel.TransformModes.TranslateTooltip']}
                  >
                    <svg 
                      viewBox="0 0 34.09 34.09"
                      xmlSpace="preserve"
                    >
                      <g>
                        <polyline className="st145" points="19.8,3.94 17,1 14.39,4.12  "/>
                        <polyline className="st145" points="14.29,30.09 17.09,33.03 19.7,29.91  "/>
                        <line className="st145" x1="17.05" y1="1.09" x2="17.05" y2="33.09"/>
                        <polyline className="st145" points="30.15,19.8 33.09,17 29.97,14.39  "/>
                        <polyline className="st145" points="4,14.29 1.06,17.09 4.18,19.7  "/>
                        <line className="st145" x1="33" y1="17.05" x2="1" y2="17.05"/>
                      </g>
                    </svg>
                    <div>{messages['EditThingPanel.TransformModes.TranslateLabel']}</div>
                  </button>;
                }
                case 'rotate': {
                  return <button 
                    key="rotate"
                    className={(this.state.editorMode === "rotate"? "selected": "")}
                    onClick={()=>{this.changeTransformMode('rotate')}}
                    title={messages['EditThingPanel.TransformModes.RotateTooltip']}
                  >
                    <svg 
                      viewBox="0 0 31.63 31.06" 
                      xmlSpace="preserve"
                    >
                      <g>
                        <path className="st144" d="M11.77,1.67c5.08-1.59,10.85-0.32,14.8,3.78c5.55,5.77,5.38,14.95-0.39,20.5"/>
                        <path className="st144" d="M19.85,29.4c-4.95,1.55-10.58,0.39-14.53-3.52c-5.7-5.63-5.76-14.81-0.13-20.51"/>
                        <polyline className="st145" points="5.64,8.5 6.39,4.5 2.34,4.2  "/>
                        <polyline className="st145" points="25.86,22.19 25.18,26.19 29.24,26.42  "/>
                      </g>
                    </svg>
                    <div>{messages['EditThingPanel.TransformModes.RotateLabel']}</div>
                  </button>;
                }
                case 'scale': {
                  return <button 
                    key="scale"
                    className={(this.state.editorMode === "scale"? "selected": "")}
                    onClick={()=>{this.changeTransformMode('scale')}}
                    title={messages['EditThingPanel.TransformModes.ScaleTooltip']}
                  >
                    <svg viewBox="0 0 24.73 24.73" xmlSpace="preserve">
                      <g>
                        <polyline className="st145" points="23.57,5.06 23.66,1 19.61,1.36  "/>
                        <polyline className="st145" points="1.17,19.65 1.08,23.71 5.13,23.36  "/>
                        <line className="st145" x1="23.63" y1="1.1" x2="1" y2="23.73"/>
                        <polyline className="st145" points="19.66,23.6 23.73,23.69 23.37,19.64  "/>
                        <polyline className="st145" points="5.07,1.21 1.01,1.11 1.37,5.16  "/>
                        <line className="st145" x1="23.63" y1="23.66" x2="1" y2="1.03"/>
                      </g>
                    </svg>
                    <div>{messages['EditThingPanel.TransformModes.ScaleLabel']}</div>
                  </button>;
                }
              }
            })}
          </>
        )
      } />        
    )
  }
}
export default TransformMode;