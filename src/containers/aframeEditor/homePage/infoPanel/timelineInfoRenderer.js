/*
  info generation of right panel
*/
import React, {Component} from 'react';
import {rgba2hex} from 'globals/helperfunctions';
import transformModeId from 'globals/constants/transformModeId';
import isNonEmptyArray from 'utils/variableType/isNonEmptyArray';
// import {SketchPicker} from 'react-color';
import TransformMode from './transformMode';
import ColorPicker from './colorPicker';
import OpacityPicker from './opacityPicker';

// import ABox from 'utils/aBox';

import {LanguageContextMessagesConsumer} from 'globals/contexts/locale/languageContext';

import './infoTypeBox.css';

var Events = require('vendor/Events.js');

class TimelineInfoRenderer extends Component {
  constructor(props) {
    super(props);
    const self = this;
    this.editor = null;
    this.state = {
      editorMode: null,
      displayColorPicker: false,
      // color: props.timelineObj[props.timelinePosition]['material']['color'],
      additionalAttributes: {}
      // const color = rgba2hex(data.material.color)
    };
    this.changeObjectField = this.changeObjectField.bind(this);
    this.changeObjectMultipleFields = this.changeObjectMultipleFields.bind(this);
    this.changeTransformMode = this.changeTransformMode.bind(this);
    this.events = {
      // transformmodechanged: (mode) => {
      //   self.setState({
      //     editorMode: mode
      //   });
      // }
    };

    // this.handleClick = this.handleClick.bind(this);
    // this.handleClose = this.handleClose.bind(this);
    // this.handleChange = this.handleChange.bind(this);
  }
  componentDidMount() {
    const props = this.props;

    if (props.animatableAttributes.position) {
      this.changeTransformMode(transformModeId.translate);
    } else if (props.animatableAttributes.rotation) {
      this.changeTransformMode(transformModeId.rotate);
    } else if (props.animatableAttributes.scale) {
      this.changeTransformMode(transformModeId.scale);
    }
    Events.on('editor-load', obj => {
      this.editor = obj;
    })
      // Events.emit('transformmodechanged', transformModeId.translate);
  }
  // static getDerivedStateFromProps(nextProps, nextState) {
  //   console.log('getDerivedStateFromProps');
  //   return {
  //     displayColorPicker: false,
  //     color: nextProps.timelineObj[nextProps.timelinePosition]['material']['color']
  //   }
  // }
  componentDidUpdate(prevProps, prevState) {
    const props = this.props;
    const state = this.state;
    // console.log(props, prevProps);
    // console.log(props.timelineObj.id, prevProps.timelineObj.id);
    // console.log(props.timelinePosition, prevProps.timelinePosition);
    if (
      props.timelineObj.id !== prevProps.timelineObj.id ||
      props.timelinePosition !== prevProps.timelinePosition
    ) {
      // console.log('reset');
      // this.changeTransformMode(null);
      if (props.animatableAttributes.position) {
        this.changeTransformMode(transformModeId.translate);
      } else if (props.animatableAttributes.rotation) {
        this.changeTransformMode(transformModeId.rotate);
      } else if (props.animatableAttributes.scale) {
        this.changeTransformMode(transformModeId.scale);
      }
    }

    // if (state.additionalAttributes.radiusTop !== props.timelineObj[props.timelinePosition])
    return true;
  }
  componentWillUnmount() {
    for (let eventName in this.events) {
      Events.removeListener(eventName, this.events[eventName]);
    }
  }
  changeTransformMode(transformMode) {
    // const sceneContext = props.sceneContext;
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
    const { sceneContext } = this.props;    
    const tmp = {};
    let pointer = tmp;
    field.split('.').forEach((key, idx, arr) => {
      if (idx === arr.length - 1) {
        pointer[key] = value
      } else {
        pointer[key] = {}
        pointer = pointer[key]
      }
    })
    // tmp[field] = value;
    // console.log(tmp);
    sceneContext.updateTimelinePositionAttributes(
      tmp
    );
    // Events.emit('updateSelectedEntityAttribute', tmp);
  }
  changeObjectMultipleFields(objs) {
    const props = this.props;
    const tmp = {};
    Object.keys(objs).forEach(field => {
      const value = objs[field];
      let pointer = tmp;
      field.split('.').forEach((key, idx, arr) => {
        if (idx === arr.length - 1) {
          pointer[key] = value
        } else {
          if (!pointer[key])
            pointer[key] = {}
          pointer = pointer[key]
        }
      })
      // console.log(tmp);
      // console.log(pointer);
    })
    // tmp[field] = value;
    props.sceneContext.updateTimelinePositionAttributes(
      tmp
    );
    // Events.emit('updateSelectedEntityAttribute', tmp);

  }
  
  render() {
    const props = this.props;
    const state = this.state;
    const currentEntity = props.sceneContext.getCurrentEntity();
    const data = props.timelineObj[props.timelinePosition];
    // console.log(data.ttfFont, animatableAttributes.ttfFont && animatableAttributes.ttfFont.indexOf('fontSize') !== -1);
    // const color = rgba2hex(data.material.color);

    const animatableAttributes = props.animatableAttributes;
    const transformModes = [];
    if (animatableAttributes.position) {
      transformModes.push(transformModeId.translate);
    }
    if (animatableAttributes.rotation) {
      transformModes.push(transformModeId.rotate);
    }
    if (animatableAttributes.scale) {
      transformModes.push(transformModeId.scale);
    }    
    // ABox
    return (
      <div className="animatable-params">
        {
          isNonEmptyArray(transformModes) && 
          <div className={`vec3D-btn-col buttons-${transformModes.length}`}>
            <TransformMode 
              modes={transformModes}
              isInTimeline={true}
              onUpdate={(newPosition, newRotation, newScale) => {
                this.changeObjectMultipleFields({
                  'position': newPosition,
                  'rotation': newRotation,
                  'scale': newScale
                });
              }}
            />
          </div>
        }
        <div className="attribute-buttons-wrapper">

          {animatableAttributes.material && animatableAttributes.material.indexOf('color') !== -1 &&
            <div className="attribute-button color-col" title={rgba2hex(data.material.color)} onClick={_ => this.changeTransformMode(null)}>
              <ColorPicker key={props.timelineObj.id + data.material.color}
                field={'material'}
                color={rgba2hex(data.material.color)} 
                timelineId={props.timelineObj.id} 
                timelinePosition={props.timelinePosition} 
                onUpdate={(newColor) => {
                  this.changeObjectField('material.color', newColor)
                }}
                currentEntity={currentEntity}
              />
              <div className="field-label">
                <LanguageContextMessagesConsumer messageId="EditThingPanel.Color.ColorLabel" />
              </div>
            </div>
          }
          {animatableAttributes.material && animatableAttributes.material.indexOf('opacity') !== -1 &&
            <div className="attribute-button opacity-col" onClick={() => this.changeTransformMode(null)}>
              <OpacityPicker key={props.timelineObj.id}
                field={'material'}
                opacity={data.material.opacity} 
                timelineId={props.timelineObj.id} 
                timelinePosition={props.timelinePosition} 
                onUpdate={(newOpacity) => {
                  this.changeObjectField('material.opacity', newOpacity)
                }}
                currentEntity={currentEntity}
              />
              <div className="field-label">
                <LanguageContextMessagesConsumer messageId="EditThingPanel.Color.OpacityLabel" />
              </div>
            </div>
          }
          {animatableAttributes.ttfFont && animatableAttributes.ttfFont.indexOf('color') !== -1 &&
            <div className="attribute-button color-col" title={data.ttfFont.color} onClick={() => this.changeTransformMode(null)}>
              <ColorPicker key={props.timelineObj.id + data.ttfFont.color}
                field={'ttfFont'}
                color={data.ttfFont.color} 
                timelineId={props.timelineObj.id} 
                timelinePosition={props.timelinePosition} 
                onUpdate={(newColor) => {
                  this.changeObjectField('ttfFont.color', newColor)
                }}
                currentEntity={currentEntity}
              />
              <div className="field-label">Text Color</div>
            </div>
          }
          {animatableAttributes.ttfFont && animatableAttributes.ttfFont.indexOf('opacity') !== -1 &&
            <div className="attribute-button opacity-col" onClick={() => this.changeTransformMode(null)}>
              <OpacityPicker key={props.timelineObj.id}
                field={'ttfFont'}
                opacity={data.ttfFont.opacity} 
                timelineId={props.timelineObj.id} 
                timelinePosition={props.timelinePosition} 
                onUpdate={(newOpacity) => {
                  this.changeObjectField('ttfFont.opacity', newOpacity)
                }}
                currentEntity={currentEntity}
              />
              <div className="field-label">Text Opacity</div>
            </div>
          }
          {animatableAttributes.ttfFont && animatableAttributes.ttfFont.indexOf('fontSize') !== -1 &&
            <div className="attribute-button opacity-col" onClick={() => this.changeTransformMode(null)}>
              <input type="ttfFont" value={data.ttfFont.fontSize} onInput={(e) => {
                currentEntity.el.setAttribute('ttfFont', {
                  fontSize: e.currentTarget.value
                })
                {/* this.setState((prevState) => {
                  return {
                    additionalAttributes: {
                      ...prevState.additionalAttributes,
                      radiusTop: e.currentTarget.value
                    }
                  }
                }) */}
                this.changeObjectField('ttfFont.fontSize', e.currentTarget.value)
              }} onBlur={(e) => {
                this.changeObjectField('ttfFont.fontSize', e.currentTarget.value)
              }} />
              <div className="field-label">Font Size</div>
            </div>
          }
          {animatableAttributes.geometry && animatableAttributes.geometry.indexOf('radiusTop') !== -1 &&
            <div className="attribute-button opacity-col" onClick={() => this.changeTransformMode(null)}>
              <div className="field-label">Radius Top:</div>
              <input type="text" value={state.additionalAttributes.radiusTop} onInput={(e) => {
                currentEntity.el.setAttribute('geometry', {
                  radiusTop: e.currentTarget.value
                })
                this.setState((prevState) => {
                  return {
                    additionalAttributes: {
                      ...prevState.additionalAttributes,
                      radiusTop: e.currentTarget.value
                    }
                  }
                })
              }} onBlur={(e) => {
                this.changeObjectField('geometry.radiusTop', state.additionalAttributes.radiusTop)
              }} />
            </div>
          }
          {animatableAttributes.geometry && animatableAttributes.geometry.indexOf('radiusBottom') !== -1 &&
            <div className="attribute-button opacity-col" onClick={_ => this.changeTransformMode(null)}>
              <div className="field-label">Radius Bottom:</div>
              <input type="text" value={state.additionalAttributes.radiusBottom} onInput={(e) => {
                currentEntity.el.setAttribute('geometry', {
                  radiusBottom: e.currentTarget.value
                })
                this.setState((prevState) => {
                  return {
                    additionalAttributes: {
                      ...prevState.additionalAttributes,
                      radiusBottom: e.currentTarget.value
                    }
                  }
                })
              }} onBlur={(e) => {
                this.changeObjectField('geometry.radiusBottom', state.additionalAttributes.radiusBottom)
              }} />
            </div>
          }
          {animatableAttributes.cameraPreview &&
          <div className="attribute-button preview-col">
            <canvas ref={ref=>{
              {/* props.model.setEditorInstance(this.editor) */}
              props.model.setCameraPreviewEl(ref)
              props.model.setEditorInstance(props.sceneContext.editor)
              props.model.renderCameraPreview();
            }} />
          </div>}
        </div>
      </div>
    );
  }
}
export default TimelineInfoRenderer;