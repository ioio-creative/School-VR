import React, {Component} from 'react';

import listProjectsAsync from 'utils/saveLoadProject/listProjectsAsync';
import {loadProjectAsync} from 'utils/saveLoadProject/loadProject';

import handleErrorWithUiDefault from 'utils/errorHandling/handleErrorWithUiDefault';

import './ProjectListPage.css';


function ProjectItem(props) {
  const project = props.item;
  const addFocusClass = (existingClass) =>
    (existingClass + (props.isFocus ? " focus" : ""));
  return (
    <div className={addFocusClass("file")}
      onClick={evnt => props.handleClickFunc(evnt, props.idx)}
      onDoubleClick={_ => props.handleDoubleClickFunc(project)}
    >
      <div className={addFocusClass("icon")}>
        {/* <img src={getAbsoluteUrlFromRelativeUrl(`fileExplorer/icons/${props.type}.png`)} /> */}
        <div className={addFocusClass("name")}>{project.path}</div>
      </div>
    </div>
  );
}


function ProjectList(props) {
  const items = props.items;

  if (items.length === 0) {
    return null;
  }

  const projects = items.map((project, idx) => {
    return (
      <ProjectItem 
        key={project.path}
        idx={idx}
        isFocus={props.focusedItemIdx === idx}
        item={project}
        handleClickFunc={props.handleItemClickFunc}
        handleDoubleClickFunc={props.handleItemDoubleClickFunc}
      />
    );
  });

  return (
    <div className="project-list">
      <div className="project-list-container">
        {projects}
      </div>
    </div>
  );
}


class ProjectListPage extends Component {
  constructor(props) {
    super(props);

    this.defaultFocusedItemIdx = -1;

    this.state = {
      projects: [],
      focusedItemIdx: this.defaultFocusedItemIdx
    };

    this.enumerateProjects = this.enumerateProjects.bind(this);

    this.handleBackgroundClick = this.handleBackgroundClick.bind(this);
    this.handleProjectItemClick = this.handleProjectItemClick.bind(this);
    this.handleProjectItemDoubleClick = this.handleProjectItemDoubleClick.bind(this);

    this.handleWindowFocus = this.handleWindowFocus.bind(this);  
  }

  componentDidMount() {
    window.addEventListener('focus', this.handleWindowFocus);
    this.enumerateProjects();
  }

  componentWillUnmount() {
    window.removeEventListener('focus', this.handleWindowFocus);
  }

  // componentDidUpdate(prevProps, prevState) {
  //   if (this.props.currentPath !== prevProps.currentPath) {
  //     this.enumerateProjects();
  //   }
  // }

  enumerateProjects() {
    //const props = this.props;
    listProjectsAsync()
      .then(projectFileStats => {
        this.setState({
          projects: projectFileStats
        });
      })
      .catch(err => {        
        alert(err);
      });
  }

  /* event handlers */

  // Click on blank
  // Note: It's important to have the background <ul> element has height 100%
  handleBackgroundClick() {
    if (this.state.focusedItemIdx !== this.defaultFocusedItemIdx) {
      this.setState({
        focusedItemIdx: this.defaultFocusedItemIdx
      });
    }
  }

  // Click on item
  handleProjectItemClick(evnt, itemIdx) {
    if (this.state.focusedItemIdx !== itemIdx) {
      this.setState({
        focusedItemIdx: itemIdx
      });
    }
    evnt.stopPropagation();
  }

  /**
   * handleProjectItemDoubleClick
   * Double click on item
   * @param {CustomedFileStats} projectFileStat 
   */
  handleProjectItemDoubleClick(projectFileStat) {        
    const projectName = projectFileStat.fileNameWithoutExtension;
    loadProjectAsync(projectName)
      .catch(err => handleErrorWithUiDefault(err));
  }

  // Refresh when in focus again
  handleWindowFocus() {
    this.enumerateProjects();
  }

  /* end of event handlers */

  render() {
    //const props = this.props;
    const state = this.state;
    
    return (
      <div className="project-list-page">
        <ProjectList
          items={state.projects}
          handleItemClickFunc={this.handleProjectItemClick}
          handleItemDoubleClickFunc={this.handleProjectItemDoubleClick}
        />        
      </div>
    );
  }
}

export default ProjectListPage;
