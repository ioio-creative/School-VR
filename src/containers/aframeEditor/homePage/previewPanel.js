/*
  Left Panel should be similar to slides in powerpoint ( ▭ )
  ▫▫▫▫▫▫▫▫▫▫▫
  ▭ ┌──────┐
  ▭ │AFRAME│
  ▭ └──────◲
*/
import React, {Component, Fragment} from 'react';

import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';

import {withSceneContext} from 'globals/contexts/sceneContext';

import {TweenMax} from 'gsap';
// import {SortableContainer, SortableElement} from 'react-sortable-hoc';
// import EntitiesList from 'containers/panelItem/entitiesList';

import './previewPanel.css';

const Events = require('vendor/Events.js');

class PreviewPanel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedSlide: null,
      animateIndex: 0,
      isSorting: false,
      showContextMenu: false
    };
    this.animateTick = null;
    this.backButtonClick = this.backButtonClick.bind(this);
  }
  componentDidMount() {
  }
  componentWillUnmount() {
  }
  backButtonClick(event) {
    event.preventDefault();
    this.props.sceneContext.editor.open();
  }
  render() {
    const props = this.props;
    const state = this.state;
    const sceneContext = props.sceneContext;
    const slidesList = sceneContext.getSlidesList();
    const currentSlide = sceneContext.getCurrentSlideId();
    const currentSlideIdx = slidesList.findIndex(slide => slide.id === currentSlide);
    const prevSlide = (currentSlideIdx < 1? null: slidesList[currentSlideIdx - 1]['id']);
    const nextSlide = (currentSlideIdx > slidesList.length - 2? null: slidesList[currentSlideIdx + 1]['id']);
    
    return (
      <div id="preview-panel" >
      <div className="slideFunctions-panel">
          <div className="buttons-group">
            <div className={`button-prevSlide${currentSlideIdx === 0? ' disabled': ''}`}
              onClick={() => {
                if (prevSlide) {
                  sceneContext.selectSlide(prevSlide);
                  if (state.socket) {
                    state.socket.emit('updateSceneStatus', {
                      action: 'selectSlide',
                      details: {
                        slideId: prevSlide,
                        autoPlay: false
                      }
                    })
                  }
                }
              }}
            >
              <FontAwesomeIcon icon="angle-left"/>
            </div>
            <div className="button-playSlide"
              onClick={() => {
                sceneContext.playSlide();
                if (state.socket) {
                  state.socket.emit('updateSceneStatus', {
                    action: 'playSlide'
                  })
                }
              }}
            >
              <FontAwesomeIcon icon="play"/>              
            </div>
            <div className={`button-nextSlide${currentSlideIdx === slidesList.length - 1? ' disabled': ''}`} onClick={() => {
                if (nextSlide) {
                  sceneContext.selectSlide(nextSlide);
                  if (state.socket) {
                    state.socket.emit('updateSceneStatus', {
                      action: 'selectSlide',
                      details: {
                        slideId: nextSlide,
                        autoPlay: false
                      }
                    })
                  }
                }
              }}>
              <FontAwesomeIcon icon="angle-right"/>            
            </div>
          </div>
          <div className="buttons-group">
            <select value={currentSlide}
              onChange={e => {
                sceneContext.selectSlide(e.currentTarget.value);
                if (state.socket) {
                  state.socket.emit('updateSceneStatus', {
                    action: 'selectSlide',
                    details: {
                      slideId: e.currentTarget.value,
                      autoPlay: false
                    }
                  })
                }
              }}
            >
              {
                slidesList.map((slide, idx) => {
                  return <option key={slide.id} value={slide.id}>Slide {idx + 1}</option>
                })
              }
            </select>
          </div>
          <div className="buttons-group">
            {/* <Link to={routes.editorWithProjectFilePathQuery(projectFilePathToLoad)}>Exit</Link> */}
            <a onClick={this.backButtonClick}>Back</a>
          </div>
        </div>
      
      </div>
    );
  }
}
export default withSceneContext(PreviewPanel);