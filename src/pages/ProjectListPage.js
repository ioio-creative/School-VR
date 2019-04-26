import React, {Component} from 'react';
import {Link} from 'react-router-dom';

import MenuComponent from 'components/menuComponent';

import routes from 'globals/routes';
import listProjectsAsync from 'utils/saveLoadProject/listProjectsAsync';
import {setCurrentLoadedProjectFilePath} from 'utils/saveLoadProject/loadProject';
import {invokeIfIsFunction} from 'utils/variableType/isFunction';
import {formatDateTime} from 'utils/dateTime/formatDateTime';
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

  handleItemMouseEnter = _ => {    
    this.showProjectHandles();    
  }

  handleItemMouseLeave = _ => {
    this.hideProjectHandles();    
  }

  handleProjectEditButtonClick = _ => {
    const props = this.props;
    const project = props.item;
    setCurrentLoadedProjectFilePath(project.savedProjectFilePath);
    props.history.push(routes.editorByProjectNameWithValue(project.name));
  }

  /* end of event handlers */


  render() {
    const props = this.props;
    const state = this.state;

    const project = props.item;

    return (    
      <div className="project-item"
        // https://www.w3schools.com/jsref/tryit.asp?filename=tryjsref_onmousemove_leave_out     
        onMouseEnter={this.handleItemMouseEnter}      
        onMouseLeave={this.handleItemMouseLeave}
      >
        <div className="project-info-container">
          <div className="project-info">
            <div className="project-image">
              <img src={getAbsoluteUrlFromRelativeUrl("images/test1.jpg")} alt={"test"}/>
            </div>
            <div className="project-info-text-container">
              <div className="project-info-text">
                <div className="project-name">{project.name}</div>
                <div className="project-lastupdate">{`Last edited ${project.lastModifiedDateTime ? formatDateTime(project.lastModifiedDateTime) : ""}`}</div>
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
              <div className="project-edit"
                onClick={this.handleProjectEditButtonClick}>
                Edit
              </div>
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

  const history = props.history;

  const projects = items.map((project) => {  
    return (
      <ProjectItem 
        key={project.path}
        item={project}

        history={history}
      />
    );
  });

  return (
    <div className="project-list">
      <div className="project-item create-new-project">
        <Link to={routes.editorByProjectNameWithValue(null)}>
          <div className="create-new-project-content">+</div>
        </Link>
      </div>
      {projects}
    </div>
  );
}


class ProjectListPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      projects: []  // array of ProjectFile objects     
    };
  }


  /* react lifecycles */

  componentDidMount() {
    this.enumerateProjects();
  }

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
        handleErrorWithUiDefault(err);
      });
  }

  /* end of methods */


  /* event handlers */

  // Click on item
  handleProjectItemClick = (evnt, itemIdx) => {
    
  }

  /* end of event handlers */

  render() {
    const props = this.props;
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
          
          history={props.history}
        />
      </div>
    );
  }
}

export default ProjectListPage;