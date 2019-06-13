import React, {Component, Fragment} from 'react';
import {SketchPicker} from 'react-color';
import iconPrev from 'media/icons/prev.svg';

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
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        borderRadius: 15

      }}>
        <div style={{
          position: 'fixed',
          top: '0px',
          right: '0px',
          bottom: '0px',
          left: '0px',
        }} onClick={this.handleClose} />
        <div className="back-button" 
          onClick={this.handleClose}>
          <img src={iconPrev} alt="Back"/>
        </div>
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
              picker: {
                background: '#03141c',
                width: '100%',
                //height: '100%',
                boxSizing: 'border-box',
                borderRadius: 15,
                paddingTop: 0,
              },
              hue: {
                position: 'relative',
                height: '20px',
                overflow: 'hidden'
              },
              saturation: {
                paddingBottom: '30%'
              }
            },
            disableAlpha: {
              hue: {
                height: '20px'
              },
              color: {
                height: '20px'
              }
            }
          }}
        />
      </div> : null }
    </Fragment>
  }
}

export default ColorPicker;