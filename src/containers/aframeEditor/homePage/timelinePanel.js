/*
  Timeline Panel should be something that show the all entity's name and events happen in the time interval ( = )
  ▫▫▫▫▫▫▫▫▫▫▫
   ┌────────┐
   │ AFRAME ◲
   └────────┘
   ==========
*/
import React, {Component, Fragment} from 'react';
import Draggable from 'react-draggable';
import {Rnd as ResizableAndDraggable} from 'react-rnd';
// import EntitiesList from 'containers/panelItem/entitiesList';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'

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

class timelinePanel extends Component {
  constructor(props) {
    super(props);
    this.scaleLimit = {
      min: 10,
      max: 70
    };
    this.state = {
      timeScale: 25,
      editingName: null,
      timelineListElWidth: 0
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
    this.handleResize = this.handleResize.bind(this);
    this.changeCurrentTime = this.changeCurrentTime.bind(this);
    // this.selectEntityTimelinePosition = this.selectEntityTimelinePosition.bind(this)
  }
  componentDidMount() {
    window.addEventListener('resize', this.handleResize);
    this.handleResize();
  }
  // componentDidUpdate() {
  //   // console.log('componentDidUpdate');
  //   this.forceUpdate();
  // }
  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize);
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
    if (this.needUpdate) {
      window.cancelAnimationFrame(this.needUpdate);
    }
    const self = this;
    this.needUpdate = window.requestAnimationFrame(function() {
      self.recalculateFreezeElPosition();
    });
  }
  changeCurrentTime(event, data) {
    // this.setState({
    //   'currentTime': data.x / this.state.timeScale
    // })
    this.currentTime= data.x / this.state.timeScale;
    Events.emit('setTimelineTime', data.x / this.state.timeScale);
    // console.log(this.timePointer);
  }
  startChangeTimelineTime(event, entityId, timelineId) {
    // this.setState({
    //   selectedTimeline: timelineId
    // })
    this.selectEntityTimelinePosition(event, entityId, timelineId, this.props.selectedTimelinePosition);
    // this.selectEntity(event, entityId, timelineId);
    // this.sortedTimeline = this.props.entities[entityId]['timeline'].sort((tlA, tlB) => tlA.start > tlB.start);
    const selectedTimeline = this.props.entitiesList[entityId]['slide'][this.props.selectedSlide]['timeline'][timelineId];
    this.lastValidStart = selectedTimeline['start'];
    this.initialWidth = selectedTimeline['duration'];
    this.lastValidWidth = 0;
  }
  changeTimelineTime(event, entityId, timelineId, xPos, width) {
    // console.log(data);
    if (width === undefined) {
      width = this.lastValidWidth;
    }
    const allTimeline = this.props.entitiesList[entityId]['slide'][this.props.selectedSlide]['timeline'];
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
  changedTimelineTime(event, entityId, timelineId, xPos, width) {
    if (width === undefined) {
      width = this.lastValidWidth;
    }
    const allTimeline = this.props.entitiesList[entityId]['slide'][this.props.selectedSlide]['timeline'];
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
    // hack the draggable position ...
    this.resizableAndDraggable[timelineId]['draggable']['state']['x'] = this.lastValidStart * this.state.timeScale;
    Events.emit('updateTimeline', entityId, this.props.selectedSlide, timelineId, this.lastValidStart, this.initialWidth + this.lastValidWidth / this.state.timeScale);
  }
  addTimeline(event, entityId, slideId) {
    if (event.target === event.currentTarget) {
      const newStartTime = Math.floor((event.clientX - event.currentTarget.getBoundingClientRect().left) / this.state.timeScale);
      Events.emit('addTimeline', entityId, slideId, newStartTime);
    }
  }
  changeEntityName(event, entityId) {
    Events.emit('updateEntityName', entityId, event.currentTarget.value);
  }
  selectEntity(event, entityId) {
    // console.log(event.currentTarget);
    Events.emit('objectselected', this.props.entitiesList[entityId]['el']['object3D']);
    this.setState({
      // 'updated': uuid(),
      selectedTimeline: null
    })
    // this.props.entities[entityId]['el'].setAttribute('el-name', event.currentTarget.value);
  }
  // selectEntityTimeline(event, entityId, timelineId) {
  //   // event.stopPropagation();
  //   Events.emit('setTimelinePositionSelected', entityId, this.props.selectedSlide, timelineId);
  //   // Events.emit('objectselected', this.props.entities[entityId]['el']['object3D']);
  //   event.stopPropagation();
  // }
  selectEntityTimelinePosition(event, entityId, timelineId, position) {
    Events.emit('setTimelinePositionSelected', entityId, this.props.selectedSlide, timelineId, position);
    event.preventDefault();
    event.stopPropagation();
  }
  changeTimeScale(scale) {
    const projectedScale = (this.state.timeScale >= 50? 5 * scale: scale);
    const newTimeScale = Math.min(Math.max(this.state.timeScale + projectedScale, this.scaleLimit.min), this.scaleLimit.max);
    this.setState({
      timeScale: newTimeScale
    })
    this.timePointer.current.state.x = newTimeScale * this.props.currentTime;
    for (let timelineId in this.resizableAndDraggable) {
      if (this.resizableAndDraggable[timelineId]) {
        const draggable = this.resizableAndDraggable[timelineId]["draggable"];
        const entity = this.props.entitiesList[this.timelineEntity[timelineId]];
        const timeline = entity["slide"][this.props.selectedSlide]['timeline'][timelineId];
        draggable.state.x = newTimeScale * timeline.start;
      }
    }
  }
  recalculateFreezeElPosition() {
    const entitiesList = this.entitiesList;
    const timeIndicatorWrap = this.timeIndicatorWrap;
    const entitiesListWrap = this.entitiesListWrap;
    entitiesListWrap.style.marginTop = -entitiesList.scrollTop;
    timeIndicatorWrap.style.marginLeft = -entitiesList.scrollLeft;
  }
  render() {
    const props = this.props;
    const entitiesList = props.entitiesList;
    const selectedEntity = props.selectedEntity;
    const totalTime = props.totalTime;
    const currentTime = props.currentTime;
    return (
      <div id="timeline-panel" className="panel opened" onClick={(event)=>{
          this.contextMenu.style.display = 'none';
          {/* this.selectEntityTimelinePosition(event); */}
        }}
        ref={(ref) =>this.timelinePanel = ref}
      >
        <div className="panel-header">
          <div className="header-text">Timeline</div>
          <div className="timer">
            <span className="current-time">
              {
                Math.floor(currentTime / 60).toString().padStart(2,'0') + ':' + 
                Math.floor(Math.round((currentTime * 100) % 6000) / 100).toString().padStart(2,'0') + '.' + 
                (Math.round(currentTime % 60 * 100) % 100).toString().padEnd(2,'0')
              }
            </span>
            <span>&nbsp;/&nbsp;</span>
            <span className="total-time">
              {Math.floor(totalTime / 60).toString().padStart(2,'0') + ':' + Math.floor(totalTime % 60).toString().padStart(2,'0')}
            </span>
          </div>
          <div className="preview-timeline"
            onClick={() => {
              Events.emit('previewTimeline');
            }}
          >
            <FontAwesomeIcon icon="play" />
          </div>
          <div className="toggle-panel" onClick={() => {
            this.timelinePanel.classList.toggle('opened');
          }} />
          <div className="time-scale-controls">
            <button disabled={(this.scaleLimit.min === this.state.timeScale)} onClick={() => { this.changeTimeScale(-1); }}>-</button>
            <button disabled={(this.scaleLimit.max === this.state.timeScale)} onClick={() => { this.changeTimeScale(1); }}>+</button>
          </div>
        </div>
        <div className="panel-body">
          <div className="totaltime-data" onClick={()=> Events.emit('previewTimeline')}>
            &nbsp;
          </div>
          <div className="time-scaler">
            <div className="scroll-wrap" ref={ref => this.timeIndicatorWrap = ref}>
              <Draggable 
                ref={this.timePointer}
                axis="x" grid={[this.state.timeScale, 0]}
                bounds={{left: 0, right: totalTime * this.state.timeScale}}
                position={{x: props.currentTime * this.state.timeScale, y: 0}}
                onStart={()=>this.timelinePanel.classList.add('timepointer-dragging')}
                onDrag={this.changeCurrentTime} 
                onStop={()=>this.timelinePanel.classList.remove('timepointer-dragging')}
              >
                <div className="time-pointer" />
              </Draggable>
              {getScaleIndicatorText(totalTime, this.state.timeScale, this.state.timelineListElWidth)}
            </div>
          </div>
          <div className="entities-list">
            <div className="scroll-wrap" ref={ref => this.entitiesListWrap = ref}>
              {entitiesList && Object.keys(entitiesList).reverse().map((entityId) => {
                const entity = entitiesList[entityId];
                return (
                  <div key={entityId} className={"entity-row" + (selectedEntity === entityId? ' selected': '')}>
                    {!entity.isSystem && entity['type'] !== 'a-camera' && selectedEntity === entityId &&
                      <div className="delete-btn" onClick={() => {
                        Events.emit('deleteEntity', props.selectedEntity);
                      }}>
                        <FontAwesomeIcon icon="trash-alt" />
                      </div>
                    }
                    <div className="entity-name"
                      onClick={(event) => {
                        console.log('Ctrl pressed: ', event.ctrlKey);
                        this.selectEntityTimelinePosition(event, entityId)
                      }}
                      onDoubleClick={(event) => this.setState({editingName: entityId})}
                    >
                      {this.state.editingName == entityId ? 
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
          <div className="timeline-list" onScroll={this.handleScroll} ref={ref=> this.timelineListEl = ref}>
            {entitiesList && Object.keys(entitiesList).reverse().map((entityId) => {
              const entity = entitiesList[entityId];
              const selectedSlide = props.selectedSlide;
              let selectedTimeline = {};
              if (entity['slide'][selectedSlide]) {
                selectedTimeline = entity['slide'][selectedSlide]['timeline'];
              }
              return (
                <div key={entityId} 
                  className={"entity-row" + 
                    (selectedEntity === entityId? ' selected': '') +
                    (" item-count-" + Object.keys(selectedTimeline).length)
                  }
                >
                  <div className="entity-timeline" onClick={(event) => {
                      if (!this.dragging) {
                        event.preventDefault();
                        this.addTimeline(event, entityId, selectedSlide);
                      }
                    }}
                    empty-text="Add animation +"
                    style={{width: Math.max(this.state.timelineListElWidth, totalTime * this.state.timeScale)}}
                  >
                    {Object.keys(selectedTimeline).map((timelineId) => {
                      const self = this;
                      const timelineData = selectedTimeline[timelineId];
                      this.timelineEntity[timelineId] = entityId;
                      return (
                        <ResizableAndDraggable
                          ref={(ref)=>this.resizableAndDraggable[timelineId] = ref}
                          key={timelineId}
                          className={selectedEntity === entityId && props.selectedTimeline === timelineId? "time-span selected": "time-span"}
                          default={{
                            x: timelineData.start * self.state.timeScale,
                            y: 0,
                            height: 24,
                            width: timelineData.duration * this.state.timeScale
                          }}
                          size={{
                            height: 24,
                            width: timelineData.duration * this.state.timeScale
                          }}
                          resizeGrid={[self.state.timeScale, 0]}
                          dragGrid={[self.state.timeScale, 0]}
                          dragAxis='x'
                          enableResizing={{
                            top: false, right: true, bottom: false, left: true,
                            topRight: false, bottomRight: false, bottomLeft: false, topLeft: false
                          }}
                          onClick={(event) =>{
                            if (!self.dragging) {
                              this.selectEntityTimelinePosition(event, entityId, timelineId);
                            }
                          }}
                          onDragStart={(event, data)=>{
                            event.preventDefault();
                            self.dragging = true;
                            self.startChangeTimelineTime(event, entityId, timelineId);
                          }}
                          onDrag={(event, data) => {
                            self.changeTimelineTime(event, entityId, timelineId, data.lastX);
                          }}
                          onDragStop={(event, data) => {
                            self.changedTimelineTime(event, entityId, timelineId, data.lastX);
                            setTimeout(function(){
                              self.dragging = false;
                            }, 0);
                          }}
                          onResizeStart={(event, dir, ref, delta,pos)=>{
                            event.preventDefault();
                            self.dragging = true;
                            {/* console.log('onResizeStart: ', event, dir, ref, delta,pos); */}
                            self.startChangeTimelineTime(event, entityId, timelineId);
                          }}
                          onResize={(event, dir, ref, delta, pos)=>{
                            {/* console.log('onResize: ', event, dir, ref, delta, pos); */}
                            self.changeTimelineTime(event, entityId, timelineId, pos.x, delta.width);
                          }}
                          onResizeStop={(event, dir, ref, delta, pos)=>{
                            {/* console.log('onResizeStop: ', event, dir, ref, delta, pos); */}
                            event.preventDefault();
                            self.changedTimelineTime(event, entityId, timelineId, pos.x, delta.width);
                            setTimeout(function(){
                              self.dragging = false;
                            }, 0);
                          }}
                          dragHandleClassName="drag-handle"
                          title={timelineData.start + ' - ' + (timelineData.start + timelineData.duration)}
                        >
                          <div className="drag-handle"></div>
                          <div 
                            className={"position-select start-attribute" + (selectedEntity === entityId && props.selectedTimeline === timelineId && props.selectedTimelinePosition === "startAttribute"? " selected": "")}
                            onClick={(event) => this.selectEntityTimelinePosition(event, entityId, timelineId, "startAttribute") }
                          />
                          <div 
                            className={"position-select end-attribute" + (selectedEntity === entityId && props.selectedTimeline === timelineId && props.selectedTimelinePosition === "endAttribute"? " selected": "")}
                            onClick={(event) => this.selectEntityTimelinePosition(event, entityId, timelineId, "endAttribute") }
                          />
                        </ResizableAndDraggable>
                      );
                    })}
                  </div>
                </div>
              )
            })}
          </div>
          <div className="context-menu" style={{position: 'fixed', zIndex: 1, display: 'none'}} ref={(ref)=>this.contextMenu = ref}>
            delete
          </div>
        </div>
      </div>
    );
  }
}
export default timelinePanel;