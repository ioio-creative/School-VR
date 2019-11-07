/*
  Timeline Panel should be something that show the all entity's name and events happen in the time interval ( = )
  ▫▫▫▫▫▫▫▫▫▫▫
   ┌────────┐
   │ AFRAME ◲
   └────────┘
   ==========
*/
import React, {Component, Fragment} from 'react';

import {withSceneContext} from 'globals/contexts/sceneContext';
import {LanguageContextConsumer, LanguageContextMessagesConsumer} from 'globals/contexts/languageContext';

import Draggable from 'react-draggable';
// import {Resizable} from 'react-resizable';
import {Rnd as ResizableAndDraggable} from 'react-rnd';
// import EntitiesList from 'containers/panelItem/entitiesList';
import {roundTo, jsonCopy} from 'globals/helperfunctions';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';

import './timelinePanel.css';

const Events = require('vendor/Events.js');
const uuid = require('uuid/v1');

function getScaleIndicatorText(totaltime, scale, elWidth) {
  const listEl = [];
  const textScale = (scale >= 50 ? 1 : 5);
  const scalePx = textScale * scale;
  for (let i = 0; (i < (totaltime + textScale) || elWidth > i ) ; i+=textScale) {
    listEl.push(<div key={i} className="indicator" style={{marginRight: scalePx}}>
      <span>
        {i}
      </span>
    </div>);
  }
  return listEl;
}

class TimelinePanel extends Component {
  constructor(props) {
    super(props);
    this.scaleLimit = {
      min: 10,
      max: 70
    };
    this.state = {
      timeScale: 25,
      editingName: null,
      timelineListElWidth: 0,
      entitiesList: [],
      fetchedEntitiesList: {},
      showContextMenu: false
    };
    this.entitiesList = {
      scrollLeft: 0,
      scrollTop: 0
    };
    this.timelineEntity = {};
    this.timePointer = React.createRef();
    this.resizableAndDraggable = {};
    this.dragging = false;
    this.handleScroll = this.handleScroll.bind(this);
    this.handleWheel = this.handleWheel.bind(this);
    this.handleResize = this.handleResize.bind(this);
    this.changeCurrentTime = this.changeCurrentTime.bind(this);
    this.selectEntity = this.selectEntity.bind(this);
    this.deleteEntity = this.deleteEntity.bind(this);
    
    this.showContextMenu = this.showContextMenu.bind(this);
    this.hideContextMenu = this.hideContextMenu.bind(this);

    this.copyEntity = this.copyEntity.bind(this);
    // this.selectEntityTimelinePosition = this.selectEntityTimelinePosition.bind(this)
  }
  componentDidMount() {
    window.addEventListener('resize', this.handleResize);
    this.timelineListEl.addEventListener('wheel', this.handleWheel, {passive: false});
    this.handleResize();
  }
  componentDidUpdate() {
    // console.log('componentDidUpdate');
    
    // this.forceUpdate();
  }
  static getDerivedStateFromProps(nextProps, prevState) {
    // fetch the sceneContext
    const currentEntitiesList = nextProps.sceneContext.getEntitiesList();
    const fetchedList = {};
    currentEntitiesList.forEach(entity => {
      const entityId = entity['id'];
      fetchedList[entityId] = jsonCopy(entity);
      fetchedList[entityId]['timelines'] = {};
      entity.timelines.forEach(timeline => {
        fetchedList[entityId]['timelines'][timeline['id']] = timeline;
      })
    })
    return {
      entitiesList: currentEntitiesList,
      fetchedEntitiesList: fetchedList
    };
  }
  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize);
    this.timelineListEl.removeEventListener('wheel', this.handleWheel);
  }
  handleResize(event) {
    this.setState({
      timelineListElWidth: this.timelineListEl.getBoundingClientRect().width
    });
  }
  handleScroll(event) {
    this.entitiesList = {
      scrollLeft: event.currentTarget.scrollLeft,
      scrollTop: event.currentTarget.scrollTop
    }
    // console.log('handleScroll', this.entitiesList);
    if (this.needUpdate) {
      window.cancelAnimationFrame(this.needUpdate);
    }
    const self = this;
    this.needUpdate = window.requestAnimationFrame(function() {
      self.recalculateFreezeElPosition();
    });
  }
  handleWheel(event) {
    // seems need handle the horizontal scroll too...
    event.preventDefault();
    // edge no scrollBy ...
    if (event.shiftKey) {
      this.timelineListEl.scrollLeft += Math.sign(event.deltaY) * 32;
    } else {
      this.timelineListEl.scrollTop += Math.sign(event.deltaY) * 32;
    }
  }
  changeCurrentTime(event, data) {
    // this.setState({
    //   'currentTime': data.x / this.state.timeScale
    // })
    this.currentTime= data.x / this.state.timeScale;
    this.props.sceneContext.updateCurrentTime(this.currentTime);
    // Events.emit('setTimelineTime', data.x / this.state.timeScale);
    // console.log(this.timePointer);
  }
  startChangeTimelineTime(event, entityId, timelineId) {
    const allTimeline = this.state.fetchedEntitiesList[entityId]['timelines'];
    const selectedTimeline = allTimeline[timelineId];
    this.lastValidStart = selectedTimeline['start'];
    this.initialWidth = selectedTimeline['duration'];
    this.lastValidWidth = 0;
  }
  changeTimelineTime(event, entityId, timelineId, xPos, width = this.lastValidWidth) {
    const allTimeline = this.state.fetchedEntitiesList[entityId]['timelines'];
    const newStartTime = Math.round(xPos / this.state.timeScale);
    // const thisTimeline = allTimeline[timelineId];
    const newEndTime = Math.round(newStartTime + this.initialWidth + width / this.state.timeScale);
    // thisTimeline.start = newStartTime;
    // save the time data if not overlapping others
    let isValid = newStartTime < newEndTime;
    Object.keys(allTimeline).filter(tl => tl !== timelineId).forEach(searchTimelineId => {
      const searchTimeline = allTimeline[searchTimelineId];
      const tlStart = searchTimeline.start;
      const tlEnd = tlStart + searchTimeline.duration;
      if (newEndTime > tlStart && newStartTime < tlEnd) {
        isValid = false;
      }
    })
    if (newStartTime < 0) {
      isValid = false;
    }
    if (isValid) {
      this.lastValidStart = newStartTime;
      this.lastValidWidth = width;
    }
  }
  changedTimelineTime(event, entityId, timelineId, xPos, width = this.lastValidWidth) {
    this.changeTimelineTime(event, entityId, timelineId, xPos, width);
    // hack the draggable position ...
    this.resizableAndDraggable[entityId][timelineId]['draggable']['state']['x'] = this.lastValidStart * this.state.timeScale;
    // Events.emit('updateTimeline', entityId, this.props.selectedSlide, timelineId, this.lastValidStart, this.initialWidth + this.lastValidWidth / this.state.timeScale);
    this.props.sceneContext.updateTimeline({
      start: this.lastValidStart,
      duration: this.initialWidth + this.lastValidWidth / this.state.timeScale
    }, timelineId);
  }
  addTimeline(event, entityId, slideId) {
    if (event.target === event.currentTarget) {
      const newStartTime = Math.floor((event.clientX - event.currentTarget.getBoundingClientRect().left) / this.state.timeScale);
      this.props.sceneContext.addTimeline(entityId, newStartTime);
      // Events.emit('addTimeline', entityId, slideId, newStartTime);
    }
  }
  changeEntityName(event, entityId) {
    // Events.emit('updateEntityName', entityId, event.currentTarget.value);
    // this.props.sceneContext.selectEntity(entityId); // selectEntity
    // this.props.sceneContext.updateEntity(); // selectEntity
    this.props.sceneContext.updateEntity({
      name: event.target.value
    }, entityId); // selectEntity
  }
  selectEntity(event, entityId) {
    this.props.sceneContext.selectEntity(entityId); // selectEntity
  }
  deleteEntity(entityId) {
    this.props.sceneContext.deleteEntity(entityId); // selectEntity
  }
  // selectEntityTimeline(event, entityId, timelineId) {
  //   // event.stopPropagation();
  //   Events.emit('setTimelinePositionSelected', entityId, this.props.selectedSlide, timelineId);
  //   // Events.emit('objectselected', this.props.entities[entityId]['el']['object3D']);
  //   event.stopPropagation();
  // }
  selectEntityTimelinePosition(event, entityId, timelineId, dir) {
    // console.log(entityId, this.props.selectedSlide);
    // Events.emit('setTimelinePositionSelected', entityId, this.props.selectedSlide, timelineId, position);
    // this.props.sceneContext.selectEntity(entityId);
    // this.props.sceneContext.selectTimeline(timelineId);
    const position = (
      dir === "left"? "startAttribute" :
      dir === "right"? "endAttribute" :
      ""
    );
    this.props.sceneContext.selectTimelinePosition(position, timelineId, entityId);
    event.preventDefault();
    event.stopPropagation();
  }
  changeTimeScale(scale) {
    const state = this.state;
    const entitiesList = state.fetchedEntitiesList;
    const projectedScale = (this.state.timeScale >= 50? 5 * scale: scale);
    const newTimeScale = Math.min(Math.max(this.state.timeScale + projectedScale, this.scaleLimit.min), this.scaleLimit.max);
    this.setState({
      timeScale: newTimeScale
    })
    this.timePointer.current.state.x = newTimeScale * this.props.currentTime;
    for (let entityId in this.resizableAndDraggable) {
      const entity = entitiesList[entityId];
      const timelines = this.resizableAndDraggable[entityId];
      for (let timelineId in timelines) {
        if (timelines[timelineId]) {
          const draggable = timelines[timelineId]["draggable"];
          const timeline = entity['timelines'][timelineId];
          draggable.state.x = newTimeScale * timeline.start;
        }
      }
    }
  }
  recalculateFreezeElPosition() {
    const entitiesList = this.entitiesList;
    const timeIndicatorWrap = this.timeIndicatorWrap;
    const entitiesListWrap = this.entitiesListWrap;
    entitiesListWrap.style.marginTop = -entitiesList.scrollTop + 'px';
    timeIndicatorWrap.style.marginLeft = -entitiesList.scrollLeft + 'px';
  }

  showContextMenu(e) {
    e.preventDefault();
    // if (this.props.isEditing === false) return;
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

  copyEntity() {
    this.props.sceneContext.copyEntity();
  }

  render() {
    const props = this.props;
    const state = this.state;
    const sceneContext = props.sceneContext;
    const entitiesList = state.entitiesList;
    const selectedEntityId = sceneContext.getCurrentEntityId();
    const selectedTimelineId = sceneContext.getCurrentTimelineId();
    const selectedTimelinePosition = sceneContext.getCurrentTimelinePosition();
    const totalTime = sceneContext.getSlideTotalTime();
    const currentTime = sceneContext.getCurrentTime();
    // console.log(currentTime);
    return (
      <div id="timeline-panel" className="panel opened" onClick={(event)=>{
          {/* this.contextMenu.style.display = 'none'; */}
          {/* this.selectEntityTimelinePosition(event); */}
        }}
        ref={(ref) =>this.timelinePanel = ref}
      >
        <div className="panel-header">
          <div className="header-text">
            <LanguageContextMessagesConsumer messageId="TimelinePanel.HeaderLabel" />
          </div>
          <div className="timer">
            <span className="current-time">
              {
                Math.floor(currentTime / 60).toString().padStart(2,'0') + ':' + 
                Math.floor(Math.round((currentTime * 100) % 6000) / 100).toString().padStart(2,'0') + '.' + 
                (Math.round(currentTime % 60 * 100) % 100).toString().padStart(2,'0')
              }
            </span>
            <span>&nbsp;/&nbsp;</span>
            <span className="total-time">
              {Math.floor(totalTime / 60).toString().padStart(2,'0') + ':' + Math.floor(totalTime % 60).toString().padStart(2,'0')}
            </span>
          </div>
          <div className="preview-timeline"
            onClick={() => {
              /* todo */
              // Events.emit('previewTimeline');
              if (sceneContext.slideIsPlaying) {
                sceneContext.stopSlide();
              } else {
                sceneContext.playSlide();
              }
            }}
          >
            {sceneContext.slideIsPlaying ?
              <FontAwesomeIcon icon="pause" />:
              <FontAwesomeIcon icon="play" />
            }
          </div>
          <div className="toggle-panel" onClick={() => {
            this.timelinePanel.classList.toggle('opened');
            let newY= 0;
            if (selectedEntityId !== undefined) {
              const selectedEntityIdx = entitiesList.findIndex(el => el.id === selectedEntityId);
              newY = (entitiesList.length - selectedEntityIdx - 1) * 32;
            }
            this.timelineListEl.scrollTo(this.timelineListEl.scrollLeft, newY);
          }} />
          <div className="time-scale-controls">
            <button disabled={(this.scaleLimit.min === state.timeScale)} onClick={() => { this.changeTimeScale(-1); }}>-</button>
            <button disabled={(this.scaleLimit.max === state.timeScale)} onClick={() => { this.changeTimeScale(1); }}>+</button>
          </div>
        </div>
        <div className="panel-body">
          {/* <div className="totaltime-data" onClick={()=> Events.emit('previewTimeline')}>
            &nbsp;
          </div> */}
          <div className="time-scaler">
            <div className="scroll-wrap" ref={ref => this.timeIndicatorWrap = ref}>
              <Draggable 
                ref={this.timePointer}
                axis="x" grid={[state.timeScale, 0]}
                bounds={{left: 0, right: totalTime * state.timeScale}}
                position={{x: currentTime * state.timeScale, y: 0}}
                onStart={()=>this.timelinePanel.classList.add('timepointer-dragging')}
                onDrag={this.changeCurrentTime} 
                onStop={()=>this.timelinePanel.classList.remove('timepointer-dragging')}
              >
                <div className="time-pointer" />
              </Draggable>
              {getScaleIndicatorText(totalTime, state.timeScale, state.timelineListElWidth)}
            </div>
          </div>
          <div className="entities-list">
            <div className="scroll-wrap" ref={ref => this.entitiesListWrap = ref}>
              {entitiesList.slice(0).reverse().map((entity) => {
                const entityId = entity['id'];
                return (
                  <div key={entityId} className={"entity-row" + (selectedEntityId === entityId? ' selected': '')}>
                    {!entity.isSystem && entity['type'] !== 'a-camera' && selectedEntityId === entityId &&
                      <div className="delete-btn" onClick={() => {
                        {/* Events.emit('deleteEntity', props.selectedEntityId); */}
                        this.deleteEntity(entityId);
                      }}>
                        <FontAwesomeIcon icon="trash-alt" />
                      </div>
                    }
                    <div className="entity-name"
                      onClick={(event) => {
                        {/* console.log('Ctrl pressed: ', event.ctrlKey); */}
                        console.log('entityId: ', [entityId, selectedEntityId]);
                        this.selectEntity(event, entityId)
                      }}
                      onContextMenu={(event) => {
                        this.selectEntity(event, entityId);
                        if (entity['type'] !== 'a-camera') {
                          this.showContextMenu(event);
                        }
                      }}
                      onDoubleClick={(event) => this.setState({editingName: entityId})}
                    >
                      {entityId !== null && state.editingName == entityId ? 
                        <input type="text" 
                          onChange={(event) => this.changeEntityName(event, entityId)} 
                          onBlur={(event) => this.setState({editingName: null})}
                          maxLength={10}
                          onKeyPress={(event) => {
                            if (event.which === 13) {
                              this.setState({editingName: null})
                            }
                          }}
                          value={entity.name}
                          autoFocus={true}
                        /> :
                        <div>{entity.name}</div>
                      }
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
          <LanguageContextConsumer render={
            ({ language, messages }) => (
              <div className="timeline-list" onScroll={this.handleScroll} ref={ref=> this.timelineListEl = ref}>
                {/* slice(0) to shallow copy */}
                {entitiesList.slice(0).reverse().map((entity) => {
                  const entityId = entity['id'];
                  {/* const selectedSlide = props.selectedSlide; */}
                  const entityTimelines = sceneContext.getTimelinesList(entityId);
                  // if (entity['slide'][selectedSlide]) {
                  //   entityTimelines = entity['slide'][selectedSlide]['timeline'];
                  // }
                  {/* console.log(state.timelineListElWidth, totalTime * state.timeScale); */}
                  this.resizableAndDraggable[entityId] = {};
                  return (
                    <div key={entityId} 
                      className={"entity-row" + 
                        (selectedEntityId === entityId? ' selected': '') +
                        (" item-count-" + entityTimelines.length)
                      }
                      style={{
                        width: Math.max(state.timelineListElWidth, (Math.ceil(totalTime / 5) * 5 + 1) * state.timeScale) - 10
                      }}
                    >                  
                      <div className="entity-timeline" onClick={(event) => {
                          if (!this.dragging) {
                            event.preventDefault();
                            this.addTimeline(event, entityId);
                          }
                        }}
                        empty-text={messages['TimelinePanel.AddAnimationLabel']}
                        style={{width: Math.max(state.timelineListElWidth, (Math.ceil(totalTime / 5) * 5 + 1) * state.timeScale) - 10}}
                      >
                        {entityTimelines.map((timelineData) => {
                          const self = this;
                          // const timelineData = selectedTimeline[timelineId];
                          const timelineId = timelineData['id'];
                          // this.timelineEntity[timelineId] = entityId;
                          return (
                            <ResizableAndDraggable
                              ref={(ref)=>this.resizableAndDraggable[entityId][timelineId] = ref}
                              key={timelineId + '_' + timelineData.start + '_' + timelineData.duration}
                              className={`time-span${((selectedEntityId === entityId && selectedTimelineId === timelineId)? " selected": "")}`}
                              default={{
                                x: timelineData.start * state.timeScale,
                                y: 5,
                                height: 24,
                                width: timelineData.duration * state.timeScale
                              }}
                              size={{
                                height: 24,
                                width: timelineData.duration * state.timeScale
                              }}
                              resizeGrid={[state.timeScale, 0]}
                              dragGrid={[state.timeScale, 0]}
                              dragAxis='x'
                              enableResizing={{
                                top: false, right: true, bottom: false, left: true,
                                topRight: false, bottomRight: false, bottomLeft: false, topLeft: false
                              }}
                              // remove the style assigned by the js, let css handle it
                              resizeHandleStyles={{
                                left: {top: '',left: '',width: '',height: '',cursor: ''},
                                right: {top: '',right: '',width: '',height: '',cursor: ''}
                              }}
                              resizeHandleClasses={{
                                left: `position-select start-attribute resize-handle${(selectedEntityId === entityId && selectedTimelineId === timelineId && selectedTimelinePosition === "startAttribute")? ' selected': ''}`,
                                right: `position-select end-attribute resize-handle${(selectedEntityId === entityId && selectedTimelineId === timelineId && selectedTimelinePosition === "endAttribute")? ' selected': ''}`
                              }}
                              onClick={(event) =>{
                                if (!self.dragging) {
                                  this.selectEntityTimelinePosition(event, entityId, timelineId);
                                }
                              }}
                              onDragStart={(event, data)=>{
                                event.preventDefault();
                                this.selectEntityTimelinePosition(event, entityId, timelineId);
                                self.dragging = true;
                                self.startChangeTimelineTime(event, entityId, timelineId);
                              }}
                              onDrag={(event, data) => {
                                this.changeTimelineTime(event, entityId, timelineId, data.lastX);
                              }}
                              onDragStop={(event, data) => {
                                this.changedTimelineTime(event, entityId, timelineId, data.lastX);
                                setTimeout(function(){
                                  self.dragging = false;
                                }, 0);
                              }}
                              onResizeStart={(event, dir, ref, delta, pos)=>{
                                event.preventDefault();
                                this.selectEntityTimelinePosition(event, entityId, timelineId, dir);
                                this.dragging = true;
                                {/* console.log('onResizeStart: ', event, dir, ref, delta,pos); */}
                                this.startChangeTimelineTime(event, entityId, timelineId);
                                ref.classList.add('resizing');
                              }}
                              onResize={(event, dir, ref, delta, pos)=>{
                                {/* console.log('onResize: ', event, dir, ref, delta, pos); */}
                                this.changeTimelineTime(event, entityId, timelineId, pos.x, delta.width);
                                {/* !ref.classList.contains('resizing') && ref.classList.add('resizing'); */}
                                {/* ref.style.cursor = "col-resize"; */}
                                {/* ref.classList.add('resizing'); */}
                              }}
                              onResizeStop={(event, dir, ref, delta, pos)=>{
                                {/* console.log('onResizeStop: ', event, dir, ref, delta, pos); */}
                                event.preventDefault();
                                ref.classList.remove('resizing');
                                {/* ref.style.cursor = ""; */}
                                this.changedTimelineTime(event, entityId, timelineId, pos.x, delta.width);
                                setTimeout(function(){
                                  self.dragging = false;
                                }, 0);
                              }}
                              dragHandleClassName="drag-handle"
                              title={timelineData.start + ' - ' + (timelineData.start + timelineData.duration)}
                            >
                              <div className="drag-handle"></div>
                              {/* <div 
                                className={"position-select start-attribute" + (props.selectedTimeline === timelineId && props.selectedTimelinePosition === "startAttribute"? " selected": "")}
                                onClick={(event) => this.selectEntityTimelinePosition(event, entityId, timelineId, "startAttribute") }
                              />
                              <div 
                                className={"position-select end-attribute" + (props.selectedTimeline === timelineId && props.selectedTimelinePosition === "endAttribute"? " selected": "")}
                                onClick={(event) => this.selectEntityTimelinePosition(event, entityId, timelineId, "endAttribute") }
                              /> */}
                            </ResizableAndDraggable>
                          );
                        })}
                      </div>                                        
                    </div>
                  )
                })}
              </div>
            )
          } />
          {state.showContextMenu &&
            <div className="context-menu-container" onClick={this.hideContextMenu} onContextMenu={this.hideContextMenu}>
              <div className="content-menu-overlay" />
              <div className="context-menu" style={{
                top: state.menuPosition.y,
                left: state.menuPosition.x,
              }}>
                <div className="menu-item-wrapper">
                  <div className="menu-item" onClick={this.copyEntity}>Copy Object</div>
                </div>
              </div>
            </div>
          }
        </div>
      </div>
    );
  }
}
export default withSceneContext(TimelinePanel);