import React, {Component} from 'react';

import listProjectsAsync from 'utils/saveLoadProject/listProjectsAsync';

import './ProjectListPage.css';


function ProjectItem(props) {
  const item = props.item;
  const addFocusClass = (existingClass) =>
    (existingClass + (props.isFocus ? " focus" : ""));
  return (
    <div className={addFocusClass("file")}
    
    >
      <div className={addFocusClass("icon")}>
        {/* <img src={getAbsoluteUrlFromRelativeUrl(`fileExplorer/icons/${props.type}.png`)} /> */}
        <div className={addFocusClass("name")}>{item}</div>
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
        item={project.path}
        handleClickFunc={props.handleFileItemClick}
        handledDoubleClickFunc={props.handleFileItemDoubleClick}
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
    this.handleFileItemClick = this.handleFileItemClick.bind(this);
    this.handleFileItemDoubleClick = this.handleFileItemDoubleClick.bind(this);

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

  // Click on file
  handleFileItemClick(evnt, fileItemIdx) {
    if (this.state.focusedItemIdx !== this.fileItemIdx) {
      this.setState({
        focusedItemIdx: fileItemIdx
      });
    }
    evnt.stopPropagation();
  }

  // Double click on file
  handleFileItemDoubleClick(filePath, mime) {    
    this.props.handleFileItemClickFunc(filePath, mime);
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
        />        
      </div>
    );
  }
}

export default ProjectListPage;
