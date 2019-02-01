/*
  Left Panel should be similar to slides in powerpoint ( ▭ )
  ▫▫▫▫▫▫▫▫▫▫▫
  ▭ ┌──────┐
  ▭ │AFRAME│
  ▭ └──────◲
*/
import React, {Component} from 'react';

import './slidesPanel.css';

const Events = require('vendor/Events.js');

// function Items(props) {
//   // let a = props.abouts
//   return (<div className="row"></div>);
// }
function FetchSnapshot(props) {
  if (props.data.length) {
    return props.data.map(function(snapshot) {
      return (
        <div className="saved_snapshot" onClick={()=>{props.editor.moveCamera(snapshot.camera)}}>
          <img src={snapshot.image} alt="camera_view"/>
        </div>
      );
    });
  } else {
    return (<div className="saved_snapshot empty_snapshow">+</div>);
  }
  
}
function GetLeftPanelContent(props) {
  // if (props.isedit) {
  //   return <EntitiesList />;
  // } else {
    return (<div>
      {/* <EntitiesList /> */}
      <FetchSnapshot data={props.snapshot} editor={props.editor} />
    </div>);
  // }
}
class SlidePanel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedSlide: null,
      animateIndex: 0
    };
    this.animateTick = null;
  }
  componentDidMount() {
  }
  componentWillUnmount() {
  }
  addSlide() {
    Events.emit('addSlide');
  }
  selectSlide(slideId) {
    Events.emit('setTimelinePositionSelected', null, slideId);
  }
  render() {
    const props = this.props;
    return (
      <div id="slides-panel">
        <div className="slides-wrap">
          {Object.keys(props.slideList).map(slideId => {
            const selectedSlide = props.slideList[slideId];
            const totalTime = selectedSlide['totalTime'];
            return (
              <div key={slideId}
                className={"slide" + (props.selectedSlide === slideId? " selected":"" )}
                onClick={()=>{this.selectSlide(slideId)}}
                onMouseEnter={()=>{
                  const self= this;
                  if (selectedSlide['slideImages'].length > 0) {
                    this.animateTick = setInterval(function(){
                      self.setState((currentState) => {
                        return {
                          selectedSlide: slideId,
                          animateIndex: (currentState['animateIndex'] + 1)  % selectedSlide['slideImages'].length
                        }
                      });
                    }, 200);
                  }
                }}
                onMouseLeave={() => {
                  clearInterval(this.animateTick);
                  this.setState({
                      selectedSlide: null,
                      animateIndex: 0
                  });
                }}
              >
                <div className="slideControl">
                  <div className="dot"></div>
                  <div className="actions">
                    <div className="action duplicate" onClick={(e)=>{
                      e.preventDefault();
                      e.stopPropagation();
                      Events.emit('duplicateSlide', slideId);
                    }}>
                      duplicate
                    </div>
                    <div className="action remove" onClick={(e)=>{
                      e.preventDefault();
                      e.stopPropagation();
                      Events.emit('removeSlide', slideId);
                    }}>
                      remove
                    </div>
                  </div>
                </div>
                <div className="preview-imgsequence">
                  {selectedSlide['slideImages'] && selectedSlide['slideImages'].map((src, idx) => {
                    return (<img
                      className={((this.state.selectedSlide === slideId && this.state.animateIndex === idx)? 'active': '')}
                      key={idx} 
                      src={src}
                    />);
                  })}
                </div>
                <div className="slide-info">
                  {Math.floor(totalTime / 60).toString().padStart(2,'0') + ':' + Math.floor(totalTime % 60).toString().padStart(2,'0')}
                </div>  
              </div>
            );
          })}
          <div className="slide add-slide" onClick={this.addSlide}></div>
        </div>
      </div>
    );
  }
}
export default SlidePanel;