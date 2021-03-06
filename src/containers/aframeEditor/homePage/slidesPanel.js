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

import './slidesPanel.css';

//const Events = require('vendor/Events.js');



class SortableList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      sourceElement: null,
      originalIdx: null,
      newIdx: null,
      currentElement: null,
      startX: null,
      startY: null,
      isHoverDeleteEl: false,
    };
    [
      'onSortStart',
      'onSorting',
      'onSortEnd',
    ].forEach(methodName => {
      this[methodName] = this[methodName].bind(this);
    })    
  }

  componentDidMount() {}

  componentWillUnmount() {
    if (this.state.currentElement) {
      document.removeEventListener('mousemove', this.onSorting);
      document.removeEventListener('mouseup', this.onSortEnd);
      this.state.currentElement.removeEventListener('touchmove', this.onSorting);
      this.state.currentElement.removeEventListener('touchend', this.onSortEnd);
    }
  }

  onSortStart(event) {
    const props = this.props;
    if (props.children.length < 2) { return; }
    
    const state = this.state;
    const pointer = event.changedTouches ? event.changedTouches[ 0 ] : event;
    const targetElement = event.currentTarget;
    const originalIdx = [...targetElement.parentNode.children].indexOf(targetElement);
    const targetElementCloned = event.currentTarget.cloneNode(true);
    const onSortStart = props.onSortStart;
    const onSortEnd = props.onSortEnd;
    if (props.disabled) { 
      if (typeof(onSortEnd) === "function") {
        onSortEnd(
          originalIdx,
          originalIdx
        );
      }
      return;
    }
    if (typeof(onSortStart) === "function") {
      onSortStart(
        originalIdx
      );
    }
    targetElementCloned.classList.add('cloned');
    targetElementCloned.classList.remove('selected');
    const eventType = event.type;
    targetElement.parentNode.appendChild(targetElementCloned);
    TweenMax.set(targetElementCloned, {
      position: 'absolute',
      left: targetElement.offsetLeft,
      top: targetElement.offsetTop,
      order: ''
    });
    TweenMax.set(targetElement, {
      autoAlpha: 0.6
    });
    this.setState({
      sourceElement: targetElement,
      originalIdx: originalIdx,
      newIdx: originalIdx,
      currentElement: targetElementCloned,
      startX: pointer.pageX,
      startY: pointer.pageY
    }, _=> {
      switch (eventType) {
        case 'mousedown': {
          document.addEventListener('mousemove', this.onSorting);
          document.addEventListener('mouseup', this.onSortEnd);
          break;
        }
        case 'touchstart': {
          targetElementCloned.addEventListener('touchmove', this.onSorting);
          targetElementCloned.addEventListener('touchend', this.onSortEnd);
          break;
        }
      }
    })
  }

  onSorting(event) {
    const props = this.props;
    if (props.disabled) { return; }
    const pointer = event.changedTouches ? event.changedTouches[ 0 ] : event;
    const state = this.state;
    const currentElement = state.currentElement;
    const newState = {
      newIdx: Math.round((pointer.pageX - state.startX) / state.sourceElement.offsetWidth) + state.originalIdx,
      isHoverDeleteEl: false
    };
    if (props.deleteDropEl) {
      const deleteArea = props.deleteDropEl.getBoundingClientRect();
      if ((pointer.pageX >= deleteArea.left && pointer.pageX <= deleteArea.left + deleteArea.width) &&
      (pointer.pageY >= deleteArea.top && pointer.pageY <= deleteArea.top + deleteArea.height)) {
        // is on delete element
        newState['isHoverDeleteEl'] = true;
      }
    }
    this.setState(newState);
    TweenMax.set(currentElement, {
      x: pointer.pageX - state.startX,
      y: pointer.pageY - state.startY
    })
  }

  onSortEnd(event) {
    const props = this.props;
    const state = this.state;
    if (props.disabled) { return; }
    const pointer = event.changedTouches ? event.changedTouches[ 0 ] : event;
    const onSortEnd = props.onSortEnd;
    const onSlideDelete = props.onSlideDelete;
    const sourceEl = state.sourceElement;
    const placeholderEl = state.currentElement;
    document.removeEventListener('mousemove', this.onSorting);
    document.removeEventListener('mouseup', this.onSortEnd);
    placeholderEl.removeEventListener('touchmove', this.onSorting);
    placeholderEl.removeEventListener('touchend', this.onSortEnd);
    placeholderEl.parentNode.removeChild(placeholderEl);
    // test if the slide is in rubbish bin area
    if (props.deleteDropEl) {
      const deleteArea = props.deleteDropEl.getBoundingClientRect();
      if ((pointer.pageX >= deleteArea.left && pointer.pageX <= deleteArea.left + deleteArea.width) &&
      (pointer.pageY >= deleteArea.top && pointer.pageY <= deleteArea.top + deleteArea.height)) {
        // fire delete event
        if (typeof(onSlideDelete) === "function") {
          onSlideDelete(state.originalIdx);
        }
        TweenMax.set(sourceEl, {
          autoAlpha: 1
        });
        this.setState({
          sourceElement: null,
          currentElement: null,
          originalIdx: null,
          newIdx: null
        })
        return;
      }
    }

    // sort      
    // fire sorted event
    if (typeof(onSortEnd) === "function") {
      onSortEnd(
        state.originalIdx,
        state.newIdx
      );
    }
    TweenMax.set(sourceEl, {
      autoAlpha: 1
    });
    this.setState({
      sourceElement: null,
      currentElement: null,
      originalIdx: null,
      newIdx: null
    })
  }
  
  render() {
    const props = this.props;
    const state = this.state;
    const items = props.children;
    let children = React.Children.map(
      items, 
      (child, idx) => {
        let currentIdx = idx;
        if (state.originalIdx !== null) {
          if (idx === state.originalIdx) {
            currentIdx = state.newIdx;
          } else {
            if (currentIdx > state.originalIdx) {
              currentIdx--;
            }
            if (currentIdx >= state.newIdx) {
              currentIdx++;
            }
          }
        }
        return React.cloneElement(child, {
          style: {
            order: currentIdx
          },
          onMouseDown: (event) => {
            const originalMouseDownEvent = child.props.onMouseDown;
            if (typeof(originalMouseDownEvent) === "function") {
              originalMouseDownEvent(event);
            }
            this.onSortStart(event);
          },
          onTouchStart: (event) => {
            const originalTouchStartEvent = child.props.onTouchStart;
            if (typeof(originalTouchStartEvent) === "function") {
              originalTouchStartEvent(event);
            }
            this.onSortStart(event);
          }
        })
      }
    );
    
    return <div className={`sortable-list ${state.isHoverDeleteEl? ' prepare-delete': ''}`}>
      {children}
    </div>
  }
}

class SlidePanel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedSlide: null,
      animateIndex: 0,
      isSorting: false,
      showContextMenu: false
    };
    this.animateTick = null;
    this.addSlide = this.addSlide.bind(this);
    this.copySlide = this.copySlide.bind(this);
    this.selectSlide = this.selectSlide.bind(this);
    this.onSortStart = this.onSortStart.bind(this);
    this.onSortEnd = this.onSortEnd.bind(this);
    this.onSlideDelete = this.onSlideDelete.bind(this);
    this.showContextMenu = this.showContextMenu.bind(this);
    this.hideContextMenu = this.hideContextMenu.bind(this);
  }
  componentDidMount() {
    // for (let i = 4; i > 0; i--) {
    //   this.props.sceneContext.addSlide();
    // }
  }
  componentWillUnmount() {
  }
  addSlide() {
    // Events.emit('addSlide');
    this.props.sceneContext.addSlide();
  }
  copySlide() {
    const props = this.props;
    const sceneContext = props.sceneContext;
    const selectedSlideId = sceneContext.getCurrentSlideId();
    this.props.sceneContext.addSlide(selectedSlideId);
  }
  previewAll() {
    console.log('preview all');
  }
  onSortStart() {
    this.setState({
      isSorting: true
    })
  }
  onSortEnd(oldIdx, newIdx) {
    this.setState({
      isSorting: false
    })
    if (this.props.isEditing === false) {
      this.selectSlide(oldIdx);
      this.props.sceneContext.playSlide();
    } else {
      this.props.sceneContext.sortSlide(oldIdx, newIdx);
    }
  }
  onSlideDelete(slideIdx) {
    this.setState({
      isSorting: false
    })
    this.props.sceneContext.deleteSlide(slideIdx);
  }
  selectSlide(slideIdx) {
    const slidesList = this.props.sceneContext.getSlidesList();
    const selectedSlideId = slidesList[slideIdx].id;
    const autoPlay = this.props.isEditing === false;
    this.props.sceneContext.selectSlide(selectedSlideId, autoPlay);
    // Events.emit('setTimelinePositionSelected', null, slideId);
    if (this.props.socket) {
      this.props.socket.emit('updateSceneStatus', {
        action: 'selectSlide',
        details: {
          slideId: selectedSlideId,
          autoPlay: true
        }
      })
    }
  }
  showContextMenu(e) {
    e.preventDefault();
    if (this.props.isEditing === false) return;
    this.setState({
      showContextMenu: true,
      menuPosition: {
        x: e.clientX,
        y: e.clientY,
      }
    })
  }
  
  hideContextMenu(e) {
    e.preventDefault();
    this.setState({
      showContextMenu: false
    })
  }
  render() {
    const props = this.props;
    const state = this.state;
    const sceneContext = props.sceneContext;
    const slidesList = sceneContext.getSlidesList();    
    const selectedSlideId = sceneContext.getCurrentSlideId();
    
    // console.log(selectedSlideId);
    
    const panelClassList = [];
    if (state.isMinimized) {
      panelClassList.push('mini');
    }
    if (state.isSorting) {
      panelClassList.push('sorting');
    }
    return (
      <div id="slides-panel" className={panelClassList.join(' ')}>
        <div className="slides-wrap" onWheel={(event) => event.currentTarget.scrollBy(event.deltaY / 8, 0)}>
          <div className="slide preview-all" onClick={this.previewAll}></div>
          <SortableList 
            disabled={props.isEditing === false}
            onSortStart={this.onSortStart} 
            onSortEnd={this.onSortEnd}
            onSlideDelete={this.onSlideDelete} 
            deleteDropEl={this.deleteDropEl}
          >
            {slidesList.map((slide, idx) => {
              const slideId = slide['id'];
              const slideImg = slide['image'];
              {/* const totalTime = idx;// slide['totalTime']; */}
              const isSlideSelected = slideId === selectedSlideId;
              return (
                <div key={slideId}
                  className={"slide" + (isSlideSelected ? " selected" : "")}
                  // onClick={()=>{ sceneContext.selectSlide(idx) }}
                  onContextMenu={this.showContextMenu}
                >
                  <div className="slide-idx">{idx + 1}</div>
                  <div className="preview-img">
                    {slideImg && <img
                      // className={((this.state.selectedSlide === slideId && this.state.animateIndex === idx)? 'active': '')}
                      // key={idx} 
                      src={slideImg}
                    />}
                  </div>
                  <div className="slide-info">
                    {/*Math.floor(totalTime / 60).toString().padStart(2,'0') + ':' + Math.floor(totalTime % 60).toString().padStart(2,'0')*/}
                    {sceneContext.getSlideTotalTime(slideId)}
                  </div>  
                </div>
              );
            })}
          </SortableList>
          {props.isEditing !== false &&
            <Fragment>
              <div className="slide add-slide" onClick={this.addSlide}></div>
              <div className="slide delete-slide" ref={ref=>this.deleteDropEl=ref}>
                <svg viewBox="0 -20 43.15 50.54" xmlSpace="preserve">
                  <g>
                    <path fill="currentColor" className="bin-cover"
                      d="M40.72,6.42H30.24V4.85c0-2.68-2.17-4.85-4.85-4.85h-7.64c-2.68,0-4.85,2.17-4.85,4.85v1.58H2.42
                      C1.09,6.42,0,7.51,0,8.85c0,1.34,1.09,2.42,2.42,2.42h38.3c1.34,0,2.42-1.09,2.42-2.42C43.15,7.51,42.06,6.42,40.72,6.42z
                      M17.75,6.42V3.89h7.64v2.53H17.75z"/>
                    <path fill="currentColor" className="bin-body"
                      d="M8.24,15.88c-1.34,0-2.42,1.09-2.42,2.42v23.75c0,4.69,3.8,8.48,8.48,8.48h14.54c4.69,0,8.48-3.8,8.48-8.48
                      V18.3c0-1.34-1.09-2.42-2.42-2.42s-2.42,1.09-2.42,2.42v23.75c0,2.01-1.63,3.64-3.64,3.64H14.3c-2.01,0-3.64-1.63-3.64-3.64V18.3
                      C10.67,16.96,9.58,15.88,8.24,15.88z"/>
                    <path fill="currentColor" className="bin-body"
                      d="M19.15,39.02V18.3c0-1.34-1.09-2.42-2.42-2.42s-2.42,1.09-2.42,2.42v20.72c0,1.34,1.09,2.42,2.42,2.42
                      S19.15,40.36,19.15,39.02z"/>
                    <path fill="currentColor" className="bin-body"
                      d="M28.84,39.02V18.3c0-1.34-1.09-2.42-2.42-2.42S24,16.96,24,18.3v20.72c0,1.34,1.09,2.42,2.42,2.42
                      S28.84,40.36,28.84,39.02z"/>
                  </g>
                </svg>
              </div>
            </Fragment>
          }
        </div>
        <div className="toggle-size" onClick={_=>this.setState({
          isMinimized: !this.state.isMinimized
        })}></div>
        {state.showContextMenu &&
          <div className="context-menu-container" onClick={this.hideContextMenu} onContextMenu={this.hideContextMenu}>
            <div className="content-menu-overlay" />
            <div className="context-menu" style={{
              top: state.menuPosition.y,
              left: state.menuPosition.x,
            }}>
              <div className="menu-item-wrapper">
                <div className="menu-item" onClick={this.copySlide}>Copy Slide</div>
                {/* <div className="seperator" onClick={(e)=>e.preventDefault()}></div>
                <div className="menu-item" onClick={_=>alert('maybe need some slide properties settings here')}>Properties</div> */}
              </div>
            </div>
          </div>
        }
      </div>
    );
  }
}
export default withSceneContext(SlidePanel);