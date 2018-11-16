/*
  info generation of right panel
*/
import React, {Component} from 'react';
import {roundTo, addToAsset, rgba2hex} from 'globals/aframeEditor/helperfunctions';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {Rnd as ResizableAndDraggable} from 'react-rnd';

import './infoTypeBackground.css';

var Events = require('vendor/Events.js');

class InfoTypeBackground extends Component {
  constructor(props) {
    super(props);
    const self = this;
    this.changeObjectField = this.changeObjectField.bind(this);
  }
  componentDidMount() {
  }
  componentDidUpdate() {
  }
  componentWillUnmount() {
  }
  changeObjectField(field, value) {
    const tmp = {};
    tmp[field] = value;
    Events.emit('updateSelectedEntityAttribute', tmp);
  }
  render() {
    const props = this.props;
    const data = props.timelineObj[props.timelinePosition];
    const color = rgba2hex(data.background.color);
    return (
      <div className="animatable-params">
        <div className="attribute-col color-col">
          <label title={color}>
            <div className="field-label">Color:</div><div className="color-preview" style={{backgroundColor: color}}/>
            <input type="color" value={color} onChange={(event) => this.changeObjectField('background.color', event.target.value)} hidden/>
          </label>
        </div>
      </div>
    );
  }
}
export default InfoTypeBackground;