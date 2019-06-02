import React, {Component, Fragment} from 'react';
import {SketchPicker} from 'react-color';

class ColorPicker extends Component {
  constructor(props) {
    super(props);
    this.state = {
      displayColorPicker: false,
      color: props.color
    }
    this.callback = this.props.onUpdate || function() {};
    this.props.currentEntity.el.setAttribute(props.field, 'color:' + props.color);
    this.handleClick = this.handleClick.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }
  componentDidUpdate(prevProps, prevState) {
    const props = this.props;
    // const state = this.state;
    // console.log(props.timelineId, prevProps.timelineId, props.timelinePosition, prevProps.timelinePosition);
    if (props.timelinePosition !== prevProps.timelinePosition) {
      const element = this.props.currentEntity.el;
      element.setAttribute(props.field, 'color:' + props.color);
      if (element.children) {
        Array.prototype.slice.call(element.children).forEach(child => {
          child.setAttribute(props.field, 'color:' + props.color);
        })
      }
      this.setState({
        color: props.color
      })
    }
    return true;
  }
  handleClick() {
    this.setState({ displayColorPicker: !this.state.displayColorPicker })
  };
  handleClose() {
    this.setState({ displayColorPicker: false })
    // update final color
    // console.log('final color: ', this.state.color)
    const callback = this.callback;
    if (typeof(callback) === "function") {
      callback(this.state.color);
    }
  };
  handleChange(color) {
    // console.log(color);
    const props = this.props;
    const element = props.currentEntity.el;
    this.setState({ color: color.hex });
    element.setAttribute(props.field, 'color:' + color.hex);
    if (element.children) {
      Array.prototype.slice.call(element.children).forEach(child => {
        child.setAttribute(props.field, 'color:' + color.hex);
      })
    }
  };
  render() {
    // const props = this.props;
    const state = this.state;
    return <Fragment>
      <div className="color-preview" 
        style={{backgroundColor: state.color}}
        onClick={ this.handleClick }
      />
      { this.state.displayColorPicker ? <div style={{
        position: 'absolute',
        zIndex: 2,
      }}>
        <div style={{
          position: 'fixed',
          top: '0px',
          right: '0px',
          bottom: '0px',
          left: '0px',
        }} onClick={this.handleClose} />
        <SketchPicker
          color={state.color}
          onChange={this.handleChange}
          disableAlpha={true}
          presetColors={[
            "#FF0000",
            "#FF8000",
            "#FFFF00",
            "#008000",
            "#0000FF",
            "#8000FF",
            "#FFFFFF",
            "#000000",
          ]}
          styles={{
            default: {
              hue: {
                position: 'relative',
                height: '24px',
                overflow: 'hidden'
              }
            },
            disableAlpha: {
              hue: {
                height: '24px'
              },
              color: {
                height: '24px'
              }
            }
          }}
        />
      </div> : null }
    </Fragment>
  }
}

export default ColorPicker;