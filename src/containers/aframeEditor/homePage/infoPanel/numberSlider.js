import React, {Component, Fragment} from 'react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Rnd as ResizableAndDraggable} from 'react-rnd';
import {roundTo} from 'globals/helperfunctions';

class OpacityPicker extends Component {
  constructor(props) {
    super(props);
    this.state = {
      opacity: props.opacity
    }
    this.callback = this.props.onUpdate || function() {};
    this.props.currentEntity.el.setAttribute(props.field, 'opacity:' + props.opacity);
    this.handleClick = this.handleClick.bind(this);
    // this.handleClose = this.handleClose.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleChanged = this.handleChanged.bind(this);
  }
  componentDidUpdate(prevProps, prevState) {
    const props = this.props;
    if (props.timelinePosition !== prevProps.timelinePosition) {
      const element = props.currentEntity.el;
      element.setAttribute(props.field, 'opacity:' + props.opacity);
      if (element.children) {
        Array.prototype.slice.call(element.children).forEach(child => {
          child.setAttribute(props.field, 'opacity:' + props.opacity);
        })
      }
      this.setState({
        opacity: props.opacity
      })
    }
    return true;
  }
  handleClick() {
    // ~~! int value of the opposite opacity, 0 -> 1, 0.x -> 0
    this.setState(prevState => {
      const newOpacity = ~~!prevState.opacity;
      return {
        opacity: newOpacity
      }
    }, _=> {
      this.handleChanged();
    })
  };
  handleChanged(newOpacity) {
    // console.log(newOpacity);
    const props = this.props;
    const element = props.currentEntity.el;
    if (newOpacity) {
      this.setState({
        opacity: newOpacity
      }, _=> {
        element.setAttribute(props.field, 'opacity:' + newOpacity);
        if (element.children) {
          Array.prototype.slice.call(element.children).forEach(child => {
            child.setAttribute(props.field, 'opacity:' + newOpacity);
          })
        }
        this.callback(newOpacity);
      });
    } else {
      element.setAttribute(props.field, 'opacity:' + this.state.opacity);
      if (element.children) {
        Array.prototype.slice.call(element.children).forEach(child => {
          child.setAttribute(props.field, 'opacity:' + this.state.opacity);
        })
      }
      this.callback(this.state.opacity);
    }
  };
  handleChange(newOpacity) {
    // console.log(color);
    const props = this.props;
    const element = props.currentEntity.el;
    this.setState({ opacity: newOpacity });
    element.setAttribute(props.field, 'opacity:' + newOpacity);
    if (element.children) {
      Array.prototype.slice.call(element.children).forEach(child => {
        child.setAttribute(props.field, 'opacity:' + newOpacity);
      })
    }
  };
  // update
  render() {
    const props = this.props;
    const state = this.state;
    return <div className="opacity-control">
      <div className="hide-button" onClick={this.handleClick}>
        {state.opacity?
          <FontAwesomeIcon icon="eye-slash" />:
          <FontAwesomeIcon icon="eye" />
        }
      </div>
      <div className="opacity-drag-control"
        title={state.opacity * 100 + '%'}
        ref={ref=> this.opacityControl = ref}
        onClick={(event) => {

          const clickPercent = (event.clientX - event.currentTarget.getBoundingClientRect().left) / event.currentTarget.getBoundingClientRect().width;
          {/* this.changeObjectField('material.opacity', roundTo(clickPercent, 2)); */}
          this.handleChanged(clickPercent);
        }}
      >
        <ResizableAndDraggable
          className="current-opacity"
          disableDragging={true}
          bounds="parent"
          minWidth={0}
          maxWidth="100%"
          default={{
            x: 0,
            y: 0
          }}
          size={{
            height: 24,
            width: state.opacity * 100 + '%'
          }}
          dragAxis='x'
          enableResizing={{
            top: false, right: true, bottom: false, left: false,
            topRight: false, bottomRight: false, bottomLeft: false, topLeft: false
          }}
          onResizeStart={(event, dir, ref, delta,pos)=>{

          }}
          onResize={(event, dir, ref, delta, pos)=>{
            {/* console.log(event, dir, ref, delta, pos); */}
            {/* console.log(ref.getBoundingClientRect().width, this.opacityControl.getBoundingClientRect().width); */}
            this.handleChange(roundTo(ref.getBoundingClientRect().width / (this.opacityControl.getBoundingClientRect().width - 1), 2));
          }}
          onResizeStop={(event, dir, ref, delta, pos)=>{
            {/* console.log(delta.width, this.opacityControl.getBoundingClientRect().width); */}
            // this.opacityInput.value = delta.width;
            // this.opacityInput.value = (150 + delta.width) / 150;
            {/* this.changeObjectField('material.opacity', roundTo(state.opacity + delta.width / this.opacityControl.getBoundingClientRect().width, 2)); */}
            this.handleChanged();
          }}
        >
          <div className="current-opacity" />
        </ResizableAndDraggable>  
      </div>
      {/* <input type="text" value={state.opacity} ref={(ref) => this.opacityInput = ref} onChange={(event) => this.changeObjectField('material.opacity', event.target.value)} hidden/> */}
    </div>;
  }
}
export default OpacityPicker;