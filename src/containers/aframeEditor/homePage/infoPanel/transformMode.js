import React, {Component, Fragment} from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
var Events = require('vendor/Events.js');

class TransformMode extends Component {
  constructor(props) {
    super(props);
    this.state = {
      editorMode: props.modes[0]
    }
    this.callback = this.props.onUpdate || function() {};
    this.updateEntity = this.updateEntity.bind(this);
  }
  componentDidMount() {
    // Object.prototype.toString.call(props.modes)
    Events.on('objectchanged', this.updateEntity)
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
    });
    if (newMode) {
      Events.emit('enablecontrols');
      Events.emit('transformmodechanged', newMode);
    } else {
      Events.emit('disablecontrols');
    }
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
      <Fragment>
        {props.modes.map((mode, idx) => {
          switch (mode) {
            case 'translate': {
              return <button 
                key="translate"
                className={(this.state.editorMode === "translate"? "selected": "")}
                onClick={()=>{this.changeTransformMode('translate')}}
                title="Translate"
              >
                <FontAwesomeIcon icon="arrows-alt" />
              </button>;
            }
            case 'rotate': {
              return <button 
                key="rotate"
                className={(this.state.editorMode === "rotate"? "selected": "")}
                onClick={()=>{this.changeTransformMode('rotate')}}
                title="Rotate"
              >
                <FontAwesomeIcon icon="sync-alt" />
              </button>;
            }
            case 'scale': {
              return <button 
                key="scale"
                className={(this.state.editorMode === "scale"? "selected": "")}
                onClick={()=>{this.changeTransformMode('scale')}}
                title="Scale"
              >
                <FontAwesomeIcon icon="expand-arrows-alt" />
              </button>;
            }
          }
        })}
      </Fragment>
    )
  }
}
export default TransformMode;