import React, {Component, Fragment} from 'react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Rnd as ResizableAndDraggable} from 'react-rnd';
import {roundTo} from 'globals/helperfunctions';

class OpacityPicker extends Component {
  constructor(props) {
    super(props);
    this.state = {
      displayOpacityPicker: false,
      opacity: props.opacity
    }
    this.callback = this.props.onUpdate || function() {};
    this.props.currentEntity.el.setAttribute(props.field, 'opacity:' + props.opacity);
    this.handleClick = this.handleClick.bind(this);
    this.handlePreviewClick = this.handlePreviewClick.bind(this);
    this.handleClose = this.handleClose.bind(this);
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
  handlePreviewClick() {
    this.setState({ displayOpacityPicker: !this.state.displayOpacityPicker });
  }
  handleClose() {
    this.setState({ displayOpacityPicker: false })
    // update final color
    // console.log('final color: ', this.state.color)
    const callback = this.callback;
    if (typeof(callback) === "function") {
      callback(this.state.opacity);
    }
  }
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
      <div className="opacity-preview" 
        onClick={ this.handlePreviewClick }
      />
      { this.state.displayOpacityPicker ? 
        <div className="opacity-panel">
          <div style={{
            position: 'fixed',
            top: '0px',
            right: '0px',
            bottom: '0px',
            left: '0px',
          }} onClick={this.handleClose} />
          <div className="back-button"
            onClick={this.handleClose}>
            back
          </div>
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
              maxHeight={3}
              default={{
                x: 0,
                y: 0
              }}
              size={{
                height: 3,
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
        </div>: null}
    </div>;
  }
}
export default OpacityPicker;