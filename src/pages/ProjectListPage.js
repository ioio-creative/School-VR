import React, {Component} from 'react';
import {Link} from 'react-router-dom';

import MenuComponent from 'components/menuComponent';
import CrossButton from 'components/crossButton';

import routes from 'globals/routes';
import listProjectsAsync from 'utils/saveLoadProject/listProjectsAsync';
import {formatDateTime} from 'utils/dateTime/formatDateTime';
import {getAbsoluteUrlFromRelativeUrl} from 'utils/setStaticResourcesPath';
import handleErrorWithUiDefault from 'utils/errorHandling/handleErrorWithUiDefault';
import isInViewport from 'utils/ui/isInViewport';

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
              <img src={getAbsoluteUrlFromRelativeUrl("images/ProjectListPage/test1.jpg")} alt={"test"}/>
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
            <div className="project-options-container">
              <div className="project-options">Options</div>
            </div>            
            <div className="project-edit-container">
              <div className="project-edit">
                <Link to={routes.editorWithProjectFilePathQuery(project.path)}>Edit</Link>                
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

  
class ProjectList extends Component {
  projectFilterPredicate = project => {
    const projectSearchText = this.props.projectSearchText;
    if (projectSearchText === "") {
      return true;
    }
    return project.name.includes(projectSearchText);
  }

  render() {
    const props = this.props;

    const items = props.items;

    if (items.length === 0) {
      return null;
    }

    const projects = items;
    const filteredProjects = projects.filter(this.projectFilterPredicate);

    const filteredProjectElements = filteredProjects.map((project) => {  
      return (
        <ProjectItem 
          key={project.path}
          item={project}
        />
      );
    });

    return (
      <div className="project-list" onScroll={this.handleProjectListScroll}>
        <div className="project-item create-new-project" ref={props.setCreateNewProjectBlockRefFunc}>
          <Link to={routes.editor}>
            <div className="create-new-project-content">+</div>
          </Link>
        </div>
        {filteredProjectElements}
      </div>
    );
  }
}


class ProjectListPage extends Component {
  constructor(props) {
    super(props);

    // ref
    this.createNewProjectBlock = null;
    this.setCreateNewProjectBlockRef = element => this.createNewProjectBlock = element;

    // state
    this.state = {
      projects: [],  // array of ProjectFile objects
      projectSearchText: "",
      isShowSmallProjectNewButton: false,
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

  showSmallProjectNewButton = _ => {
    if (!this.state.isShowSmallProjectNewButton) {
      this.setState({
        isShowSmallProjectNewButton: true
      });
    }
  }

  hideSmallProjectNewButton = _ => {
    if (this.state.isShowSmallProjectNewButton) {
      this.setState({
        isShowSmallProjectNewButton: false
      });
    }
  }

  /* end of methods */


  /* event handlers */  

  handleOuterContainerScroll = (event) => {
    if (this.createNewProjectBlock) {
      const isCreateNewProjectBlockInViewport = isInViewport(this.createNewProjectBlock);
      if (isCreateNewProjectBlockInViewport) {
        this.hideSmallProjectNewButton();
      } else {
        this.showSmallProjectNewButton();
      }
    }    
  }  

  handleProjectSearchTxtChange = (event) => {
    this.setState({
      projectSearchText: event.target.value
    });
  }

  handleSmallProjectNewButtonClick = _ => {
    this.props.history.push(routes.editor);
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
        <div className="outer-container" onScroll={this.handleOuterContainerScroll}>
          <div class="inner-container">
            <div className="project-top">              
              <div className="project-search">
                <input type="text" name="projectSearchTxt"
                  placeholder="project name"
                  value={state.projectSearchText}
                  onChange={this.handleProjectSearchTxtChange}
                />             
              </div>
            </div>
            <ProjectList          
              items={state.projects}
              projectSearchText={state.projectSearchText}
              setCreateNewProjectBlockRefFunc={this.setCreateNewProjectBlockRef}
            />
          </div>
          <div className={`project-new ${state.isShowSmallProjectNewButton ? 'show' : 'hide'}`}>
            <CrossButton
              backgroundBorderRadius="50%"
              backgroundSize="64px"
              backgroundColor="white"
              strokeLength="25px"
              strokeThickness="5px"
              strokeColor="#205178"
              onClick={this.handleSmallProjectNewButtonClick}
              rotationInDeg={45}
            />
          </div>
        </div>        
      </div>
    );
  }
}

export default ProjectListPage;