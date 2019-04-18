import React, {Component} from 'react';
import {Link} from 'react-router-dom';

import MenuComponent from 'components/menuComponent';

import routes from 'globals/routes';
import listProjectsAsync from 'utils/saveLoadProject/listProjectsAsync';
import {loadProjectByProjectNameAsync} from 'utils/saveLoadProject/loadProject';
import {invokeIfIsFunction} from 'utils/variableType/isFunction';
import {getAbsoluteUrlFromRelativeUrl} from 'utils/setStaticResourcesPath';

import handleErrorWithUiDefault from 'utils/errorHandling/handleErrorWithUiDefault';

import './ProjectListPage.css';


class ProjectItem extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isShowProjectHandles: false
    };
  }


  /* methods */

  showProjectHandles = _ => {
    if (!this.state.isShowProjectHandles) {
      this.setState({
        isShowProjectHandles: true
      });
    }
  }

  hideProjectHandles = _ => {
    if (this.state.isShowProjectHandles) {
      this.setState({
        isShowProjectHandles: false
      });
    }
  }

  /* end of methods */


  /* event handlers */

  handleItemClick = _ => {
    invokeIfIsFunction(this.props.onClick);
  }

  handleItemDoubleClick = _ => {
    invokeIfIsFunction(this.props.onDoubleClick);
  }

  handleItemMouseEnter = _ => {    
    this.showProjectHandles();    
  }

  handleItemMouseLeave = _ => {
    this.hideProjectHandles();    
  }

  /* end of event handlers */


  render() {
    const props = this.props;
    const state = this.state;

    const project = props.item;
    const addFocusClass = (existingClass) =>
      (existingClass + (props.isFocus ? " focus" : ""));

    return (    
      <div className="project-item"
        onClick={this.handleItemClick}
        onDoubleClick={this.handleItemDoubleClick}
        // https://www.w3schools.com/jsref/tryit.asp?filename=tryjsref_onmousemove_leave_out     
        onMouseEnter={this.handleItemMouseEnter}      
        //onMouseLeave={this.handleItemMouseLeave}
      >
        <div className="project-info-container">
          <div className="project-info">
            <div className="project-image">
              <img src={getAbsoluteUrlFromRelativeUrl("images/test1.jpg")} alt={"test"}/>
            </div>
            <div className="project-info-text-container">
              <div className="project-info-text">
                <div className="project-name">{"site_visit_2018"}</div>
                <div className="project-lastupdate">{`Last edited 2018/11/13`}</div>
              </div>
            </div>
          </div>
        </div>      
        <div className={`project-handles-container ${state.isShowProjectHandles ? 'show' : 'hide'}`}>
          <div className="project-handles">
            <div className="project-preview-container">
              <div className="project-preview">Preview</div>
            </div>
            <div className="project-options">Options</div>
            <div className="project-edit-container">
              <div className="project-edit">Edit</div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

  
function ProjectList(props) {
  const items = props.items;

  if (items.length === 0) {
    return null;
  }

  const projects = items.map((project, idx) => {
    //console.log(project);
    return (
      <ProjectItem 
        key={project.path}
        idx={idx}
        isFocus={props.focusedItemIdx === idx}
        item={project}
        onClick={props.handleItemClickFunc}
        onDoubleClick={props.handleItemDoubleClickFunc}
      />
    );
  });

  /*
  <ul className="projects-listing">
    <li className="project-block create-new-project" onClick={null}>
      <Link to={routes.editor}>
        <div className="project-content-wrapper">+</div>
      </Link>
    </li>
    {projects}
  </ul>
  */

  return (      
    <div className="project-list">
      {projects}
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
  }


  /* react lifecycles */

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

  /* end of react lifecycles */


  /* methods */

  enumerateProjects = _ => {
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

  /* end of methods */


  /* event handlers */

  // Click on blank
  // Note: It's important to have the background <ul> element has height 100%
  handleBackgroundClick = _ => {
    if (this.state.focusedItemIdx !== this.defaultFocusedItemIdx) {
      this.setState({
        focusedItemIdx: this.defaultFocusedItemIdx
      });
    }
  }

  // Click on item
  handleProjectItemClick = (evnt, itemIdx) => {
    // if (this.state.focusedItemIdx !== itemIdx) {
    //   this.setState({
    //     focusedItemIdx: itemIdx
    //   });
    // }
    // evnt.stopPropagation();
  }

  /**
   * handleProjectItemDoubleClick
   * Double click on item
   * @param {CustomedFileStats} projectFileStat 
   */
  handleProjectItemDoubleClick = (projectFileStat) => {        
    // const projectName = projectFileStat.fileNameWithoutExtension;
    // loadProjectByProjectNameAsync(projectName)
    //   .catch(err => handleErrorWithUiDefault(err));
  }

  // Refresh when in focus again
  handleWindowFocus = _ => {
    this.enumerateProjects();
  }

  /* end of event handlers */

  render() {
    //const props = this.props;
    const state = this.state;

    return (
      <div id="project-list-page">
        <MenuComponent 
          menuButtons={[
            /*{
              text: 'File',
              // onClick: _=> { console.log('file') },
              children: [
                {
                  text: 'New',
                  onClick: _=>{ console.log('new') }
                },
                {
                  text: 'Open',
                  onClick: _=>{ console.log('open') }
                },
                {
                  text: '-'
                },
                {
                  text: 'Exit',
                  onClick: _=>{ console.log('exit') }
                }
              ]
            }*/
          ]}
        />
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
