/*
  info generation of right panel
*/
import React, {Component} from 'react';
import {roundTo, addToAsset, rgba2hex} from 'globals/helperfunctions';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
// import {SketchPicker} from 'react-color';
import TransformMode from './transformMode';
import ColorPicker from './colorPicker';
import OpacityPicker from './opacityPicker';

import {Rnd as ResizableAndDraggable} from 'react-rnd';
// import ABox from 'utils/aBox';

import './infoTypeBox.css';

var Events = require('vendor/Events.js');

class StaticInfoRenderer extends Component {
  constructor(props) {
    super(props);
    const self = this;
    this.editor = null;
    this.state = {
      editorMode: null,
      displayColorPicker: false,
      // color: currentEntity[props.timelinePosition]['material']['color'],
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
      this.changeTransformMode('translate');
    } else if (props.animatableAttributes.rotation) {
      this.changeTransformMode('rotate');
    } else if (props.animatableAttributes.scale) {
      this.changeTransformMode('scale');
    }
    Events.on('editor-load', obj => {
      this.editor = obj;
    })
      // Events.emit('transformmodechanged', 'translate');
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
    const currentEntity = props.sceneContext.getCurrentEntity();
    // console.log(props, prevProps);
    // console.log(currentEntity.id, prevProps.timelineObj.id);
    // console.log(props.timelinePosition, prevProps.timelinePosition);
    if (
      currentEntity.id !== prevProps.entityId
      // props.timelinePosition !== prevProps.timelinePosition
    ) {
      // console.log('reset');
      // this.changeTransformMode(null);
      if (props.animatableAttributes.position) {
        this.changeTransformMode('translate');
      } else if (props.animatableAttributes.rotation) {
        this.changeTransformMode('rotate');
      } else if (props.animatableAttributes.scale) {
        this.changeTransformMode('scale');
      }
    }

    // if (state.additionalAttributes.radiusTop !== currentEntity[props.timelinePosition])
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
    const props = this.props;
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
    props.sceneContext.updateDefaultAttributes(
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
    props.sceneContext.updateDefaultAttributes(
      tmp
    );
    // Events.emit('updateSelectedEntityAttribute', tmp);

  }
  
  render() {
    const props = this.props;
    const state = this.state;
    const currentEntity = props.sceneContext.getCurrentEntity();
    const data = currentEntity['components'];
    // console.log(data.ttfFont, animatableAttributes.ttfFont && animatableAttributes.ttfFont.indexOf('fontSize') !== -1);
    // const color = rgba2hex(data.material.color);

    const animatableAttributes = props.animatableAttributes;
    const transformModes = [];
    if (animatableAttributes.position) {
      transformModes.push('translate');
    }
    if (animatableAttributes.rotation) {
      transformModes.push('rotate');
    }
    if (animatableAttributes.scale) {
      transformModes.push('scale');
    }
    // ABox
    return (
      <div className="animatable-params">
        {transformModes.length && 
          <div className="vec3D-btn-col">
            <TransformMode 
              modes={transformModes} 
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
        {animatableAttributes.material && animatableAttributes.material.indexOf('color') !== -1 &&
          <div className="attribute-col color-col" onClick={() => this.changeTransformMode(null)}>
            <div title={rgba2hex(data.material.color)}>
              <div className="field-label">Color:</div>
              <ColorPicker key={currentEntity.id + data.material.color}
                field={'material'}
                color={rgba2hex(data.material.color)} 
                timelineId={currentEntity.id} 
                timelinePosition={''} 
                onUpdate={(newColor) => {
                  this.changeObjectField('material.color', newColor)
                }}
                currentEntity={currentEntity}
              />
            </div>
            {/* <input type="color" value={color} onInput={(event) => this.changeObjectField('material.color', event.target.value)} hidden/> */}
          </div>
        }
        {animatableAttributes.material && animatableAttributes.material.indexOf('opacity') !== -1 &&
          <div className="attribute-col opacity-col" onClick={() => this.changeTransformMode(null)}>
            <div className="field-label">Opacity:</div>
            <OpacityPicker key={currentEntity.id}
              field={'material'}
              opacity={data.material.opacity} 
              timelineId={currentEntity.id} 
              timelinePosition={''} 
              onUpdate={(newOpacity) => {
                this.changeObjectField('material.opacity', newOpacity)
              }}
              currentEntity={currentEntity}
            />
          </div>
        }
        {animatableAttributes.ttfFont && animatableAttributes.ttfFont.indexOf('color') !== -1 &&
          <div className="attribute-col color-col" onClick={() => this.changeTransformMode(null)}>
            <div title={data.ttfFont.color}>
              <div className="field-label">Text Color:</div>
              <ColorPicker key={currentEntity.id + data.ttfFont.color}
                field={'ttfFont'}
                color={data.ttfFont.color} 
                timelineId={currentEntity.id} 
                timelinePosition={''} 
                onUpdate={(newColor) => {
                  this.changeObjectField('ttfFont.color', newColor)
                }}
                currentEntity={currentEntity}
              />
            </div>
            {/* <input type="color" value={color} onInput={(event) => this.changeObjectField('material.color', event.target.value)} hidden/> */}
          </div>
        }
        {animatableAttributes.ttfFont && animatableAttributes.ttfFont.indexOf('opacity') !== -1 &&
          <div className="attribute-col opacity-col" onClick={() => this.changeTransformMode(null)}>
            <div className="field-label">Text Opacity:</div>
            <OpacityPicker key={currentEntity.id}
              field={'ttfFont'}
              opacity={data.ttfFont.opacity} 
              timelineId={currentEntity.id} 
              timelinePosition={''} 
              onUpdate={(newOpacity) => {
                this.changeObjectField('ttfFont.opacity', newOpacity)
              }}
              currentEntity={currentEntity}
            />
          </div>
        }
        {animatableAttributes.ttfFont && animatableAttributes.ttfFont.indexOf('fontSize') !== -1 &&
          <div className="attribute-col opacity-col" onClick={() => this.changeTransformMode(null)}>
            <div className="field-label">Font Size:</div>
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
          </div>
        }
        {animatableAttributes.geometry && animatableAttributes.geometry.indexOf('radiusTop') !== -1 &&
          <div className="attribute-col opacity-col" onClick={() => this.changeTransformMode(null)}>
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
          <div className="attribute-col opacity-col" onClick={() => this.changeTransformMode(null)}>
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
        <div className="attribute-col preview-col">
          <canvas ref={ref=>{
            {/* props.model.setEditorInstance(this.editor) */}
            props.model.setCameraPreviewEl(ref)
            props.model.setEditorInstance(props.sceneContext.editor)
          }} onClick={_=> {
            props.model.renderCameraPreview(props.sceneContext);
          }} />
        </div>}
      </div>
    );
  }
}
export default StaticInfoRenderer;