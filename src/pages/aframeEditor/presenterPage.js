import React, {Component, Fragment} from 'react';
// import SystemPanel from 'containers/aframeEditor/homePage/systemPanel';
import {withRouter, Prompt} from 'react-router-dom';

import {withSceneContext} from 'globals/contexts/sceneContext';

import MenuComponent from 'components/menuComponent';

import ButtonsPanel from 'containers/aframeEditor/homePage/buttonsPanel';
import AFramePanel from 'containers/aframeEditor/homePage/aFramePanel';
import InfoPanel from 'containers/aframeEditor/homePage/infoPanel';
import SlidesPanel from 'containers/aframeEditor/homePage/slidesPanel';
import TimelinePanel from 'containers/aframeEditor/homePage/timelinePanel';
// import AssetsPanel from 'containers/aframeEditor/homePage/assetsPanel';

import Editor from 'vendor/editor.js';
// import {addEntityAutoType} from 'utils/aFrameEntities';
// import {roundTo, jsonCopy} from 'globals/helperfunctions';
// import {TweenMax, TimelineMax, Linear} from 'gsap';

import './presenterPage.css';
const Events = require('vendor/Events.js');
const uuid = require('uuid/v1');

// const jsonSchemaValidator = require('jsonschema').Validator;
// const validator = new jsonSchemaValidator();
// const schema = require('schema/aframe_schema_20181108.json');

class PresenterPage extends Component {
  constructor(props) {
    super(props);
    this.inited = false;
    this.state = {
      entitiesList: []
    }
    this.onEditorLoad = this.onEditorLoad.bind(this);
    Events.on('editor-load', this.onEditorLoad);

  }
  componentDidMount() {
    const props = this.props;
    this.editor = new Editor();
    this.inited = true;
  }
  onEditorLoad(editor) {
    const props = this.props;
    const savedProjectStr = localStorage.getItem('schoolVRSave');
    if (props.match.params.projectId === undefined || !savedProjectStr) {
      props.sceneContext.newProject();
    } else {
      props.sceneContext.loadProject(JSON.parse(savedProjectStr));
    }
    editor.close();
  }
  componentDidUpdate() {
  }
  componentWillUnmount() {
    Events.removeListener('editor-load', this.onEditorLoad);
    this.editor = null;
  }
  render() {
    const state = this.state;
    const sceneContext = this.props.sceneContext;
    return (
      <div id="presenter">
        {/* <Prompt
          when={true}
          message='You have unsaved changes, are you sure you want to leave?'
        /> */}
        {/* <SystemPanel projectName={this.projectName} /> */}
        <MenuComponent 
          // projectName="Untitled_1"
          menuButtons={[
            {
              label: 'File',
              // onClick: _=> { console.log('file') },
              children: [
                {
                  label: 'New',
                  disabled: false,
                  onClick: _=> { 
                    console.log('new');
                    // test open file with user defined extension
                    // const fileDialog = document.createElement('input');
                    // fileDialog.type = 'file';
                    // fileDialog.multiple = true;
                    // fileDialog.accept = ['image/x-png','image/gif'];
                    // fileDialog.click();
                  }
                },
                {
                  label: 'Open',
                  disabled: false,
                  onClick: _=> { console.log('open') }
                },
                {
                  label: '-'
                },
                {
                  label: 'Exit',
                  disabled: false,
                  onClick: _=> { console.log('exit') }
                }
              ]
            }
          ]}
        />
        {/* <ButtonsPanel /> */}
        <AFramePanel />
        <SlidesPanel isEditing={false} />
        {/* <TimelinePanel /> */}
        {/* <InfoPanel /> */}
      </div>
    );
  }
}

export default withSceneContext(withRouter(PresenterPage));
