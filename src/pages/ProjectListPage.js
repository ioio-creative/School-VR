import React, {Component} from 'react';
import {Link} from 'react-router-dom';

import MenuComponent from 'components/menuComponent';
import CrossButton from 'components/crossButton';

import ipcHelper from 'utils/ipc/ipcHelper';
import routes from 'globals/routes';
import {funcFactoryForCompareFileStatsByProperty} from 'utils/saveLoadProjectHelper/listProjectsAsync';
import {formatDateTime} from 'utils/dateTime/formatDateTime';
import {getAbsoluteUrlFromRelativeUrl} from 'utils/setStaticResourcesPath';
import handleErrorWithUiDefault from 'utils/errorHandling/handleErrorWithUiDefault';
import isInViewport from 'utils/ui/isInViewport';
import isNonEmptyArray from 'utils/variableType/isNonEmptyArray';

import iconPlus from 'media/icons/plus.svg';

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

    const thumbnailSrc = project.base64ThumbnailStr || getAbsoluteUrlFromRelativeUrl("images/ProjectListPage/thumbnail1.svg");

    return (    
      <div className="project-item"
        // https://www.w3schools.com/jsref/tryit.asp?filename=tryjsref_onmousemove_leave_out     
        onMouseEnter={this.handleItemMouseEnter}      
        onMouseLeave={this.handleItemMouseLeave}
      >
        <div className="project-info-container">
          <div className="project-info">
            <div className="project-image">              
              <img src={thumbnailSrc} alt={"thumbnail"}/>
            </div>
            <div className="project-info-text-container">
              <div className="project-info-text">
                <div className="project-name">{project.name}</div>
                <div className="project-lastupdate">{`Last accessed ${project.atime ? formatDateTime(project.atime) : ""}`}</div>
              </div>
            </div>
          </div>
        </div>      
        <div className={`project-handles-container ${state.isShowProjectHandles ? 'show' : 'hide'}`}>
          <div className="project-handles">
            <div className="project-preview-container">
              <div className="project-preview">
                <Link to={routes.presenterWithProjectFilePathQuery(project.path)}>Preview</Link>
              </div>
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
    return project.name.toLowerCase().includes(projectSearchText.toLowerCase());
  }

  render() {
    const props = this.props;

    const items = props.items;

    // should still show new project button
    // if (items.length === 0) {
    //   return null;
    // }

    const projects = items;

    // filter projects
    const filteredProjects = projects.filter(this.projectFilterPredicate);

    // order projects
    let compareProjectFunc;
    switch (props.projectOrderSelectValue) {
      case "most-recent":
        compareProjectFunc = funcFactoryForCompareFileStatsByProperty(fileStatObj => fileStatObj.atimeMs, true);
        break;
      case "least-recent":
        compareProjectFunc = funcFactoryForCompareFileStatsByProperty(fileStatObj => fileStatObj.atimeMs, false);
        break;
      case "by-name":
        compareProjectFunc = funcFactoryForCompareFileStatsByProperty(fileStatObj => fileStatObj.name.toLowerCase(), false);
        break;
      case "by-name-reverse":
        compareProjectFunc = funcFactoryForCompareFileStatsByProperty(fileStatObj => fileStatObj.name.toLowerCase(), true);
        break;
    }
    const orderedFilteredProjects = compareProjectFunc ? filteredProjects.sort(compareProjectFunc) : filteredProjects;

    const displayedProjectElements = orderedFilteredProjects.map((project) => {  
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
          <Link to='/editor'>
            <div className="create-new-project-content">
              <img src={iconPlus} />
            </div>
          </Link>
        </div>
        {displayedProjectElements}
      </div>
    );
  }
}


// https://www.w3schools.com/howto/tryit.asp?filename=tryhow_custom_select
class ProjectOrderSelect extends Component {
  constructor(props) {
    super(props);

    // ref
    this.customSelectContainer = null;
    this.setCustomSelectContainerRef = element => this.customSelectContainer = element;

    this.customSelect = null;
    this.setCustomSelectRef = element => this.customSelect = element;

    // state
    this.state = {
      selectedValue: "most-recent"
    };
  }


  /* react life-cycle */

  componentDidMount() {
    this.createCustomSelectStyle();

    /*if the user clicks anywhere outside the select box,
    then close all select boxes:*/
    document.addEventListener("click", this.closeAllSelect);
  }

  componentWillUnmount() {
    document.removeEventListener("click", this.closeAllSelect);
  }

  /* end of react life-cycle */


  /* event handlers */

  handleProjectOrderSelectChange = (newSelectedValue) => {
    if (newSelectedValue !== this.state.selectedValue) {
      this.setState({
        selectedValue: newSelectedValue
      });
      this.props.handleSelectChangeFunc(newSelectedValue);
    }
  }

  /* end of event handlers */


  /* methods */

  createCustomSelectStyle = _ => {
    const self = this;
    
    /*create a new DIV that will act as the selected item:*/
    const a = document.createElement("DIV");
    a.setAttribute("class", "select-selected");
    a.innerHTML = this.customSelect.options[this.customSelect.selectedIndex].innerHTML;
    this.customSelectContainer.appendChild(a);
    /*create a new DIV that will contain the option list:*/
    const b = document.createElement("DIV");
    b.setAttribute("class", "select-items select-hide");
    for (let j = 1; j < this.customSelect.length; j++) {
      /*for each option in the original select element,
      create a new DIV that will act as an option item:*/
      const c = document.createElement("DIV");
      const cValue = this.customSelect.options[j].getAttribute("value");
      c.innerHTML = this.customSelect.options[j].innerHTML;      
      c.setAttribute("data-value", cValue);
      c.addEventListener("click", function(e) {
          /*when an item is clicked, update the original select box,
          and the selected item:*/          
          const s = this.parentNode.parentNode.getElementsByTagName("select")[0];
          const h = this.parentNode.previousSibling;
          for (let i = 0; i < s.length; i++) {
            if (s.options[i].innerHTML == this.innerHTML) {
              s.selectedIndex = i;
              h.innerHTML = this.innerHTML;
              const y = this.parentNode.getElementsByClassName("same-as-selected");
              for (let k = 0; k < y.length; k++) {
                y[k].removeAttribute("class");
              }
              this.setAttribute("class", "same-as-selected");
              break;
            }
          }
          h.click();

          self.handleProjectOrderSelectChange(cValue);
      });
      b.appendChild(c);
    }
    this.customSelectContainer.appendChild(b);
    a.addEventListener("click", function(e) {
        /*when the select box is clicked, close any other select boxes,
        and open/close the current select box:*/
        e.stopPropagation();
        self.closeAllSelect(this);
        this.nextSibling.classList.toggle("select-hide");
        this.classList.toggle("select-arrow-active");
      });
  }

  closeAllSelect = (elmnt) => {
    /*a function that will close all select boxes in the document,
    except the current select box:*/
    var x, y, i, arrNo = [];
    x = document.getElementsByClassName("select-items");
    y = document.getElementsByClassName("select-selected");
    for (i = 0; i < y.length; i++) {
      if (elmnt == y[i]) {
        arrNo.push(i)
      } else {
        y[i].classList.remove("select-arrow-active");
      }
    }
    for (i = 0; i < x.length; i++) {
      if (arrNo.indexOf(i)) {
        x[i].classList.add("select-hide");
      }
    }
  }

  /* end of methods */


  render() {
    const state = this.state;
    return (
      <div className="project-order-select custom-select" ref={this.setCustomSelectContainerRef}>
        <select ref={this.setCustomSelectRef}>
          {/* first option is default option */}
          <option value="most-recent">Most recent</option> 
          <option value="most-recent">Most recent</option> 
          <option value="least-recent">Least recent</option>
          <option value="by-name">By name</option>
          <option value="by-name-reverse">By name reverse</option>
        </select>
      </div>
    )
  }
}


function Menu(props) {
  /* event handlers */

  function handleBtnNewClick(event) {    
    props.history.push(routes.editor);
  };

  function handleBtnOpenClick(event) {
    ipcHelper.openSchoolVrFileDialog((err, data) => {
      if (err) {
        handleErrorWithUiDefault(err);
        return;
      }

      const filePaths = data.filePaths;
      if (isNonEmptyArray(filePaths)) {        
        props.history.push(routes.editorWithProjectFilePathQuery(filePaths[0]));        
      } else {                      
        //alert('No files are selected!');
      }
    });    
  };

  function handleBtnExitClick(event) {
    ipcHelper.closeWindow();
  };

  /* end of event handlers */

  return (
    <MenuComponent 
      menuButtons={[
        {
          text: 'File',
          // onClick: _=> { console.log('file') },
          children: [
            {
              text: 'New',
              onClick: handleBtnNewClick
            },
            {
              text: 'Open',
              onClick: handleBtnOpenClick
            },
            {
              text: '-'
            },
            {
              text: 'Exit',
              onClick: handleBtnExitClick
            }
          ]
        }
      ]}
    />
  );
}


class ProjectListPage extends Component {
  constructor(props) {
    super(props);

    // ref
    this.createNewProjectBlock = null;
    this.setCreateNewProjectBlockRef = element => this.createNewProjectBlock = element;

    // constants
    this.enumerateProjectsRetryIntervalInMillis = 100;

    // variables
    this.enumerateProjectsTimerHandler = null;
    this.isEnumerateProjectsSuccessful = false;

    // state
    this.state = {
      projects: [],  // array of ProjectFile objects
      projectOrderSelectValue: "most-recent",
      projectSearchText: "",
      isShowSmallProjectNewButton: false,
    };
  }


  /* react lifecycles */

  componentDidMount() {
    // mechanism to retry enumerateProjects()
    // because appDirectory.appProjectsDirectory may not have been created at componentDidMount
    this.enumerateProjectsTimerHandler = setInterval(_ => {
      if (!this.isEnumerateProjectsSuccessful) {
        this.enumerateProjects();
      } else {
        clearInterval(this.enumerateProjectsTimerHandler);
        this.enumerateProjectsTimerHandler = null;
      }      
    }, this.enumerateProjectsRetryIntervalInMillis);
    
  }

  /* end of react lifecycles */


  /* methods */

  enumerateProjects = _ => {
    //const props = this.props;
    ipcHelper.listProjects((err, data) => {
      if (err) {
        handleErrorWithUiDefault(err);
        this.isEnumerateProjectsSuccessful = false;
        return;
      }

      this.isEnumerateProjectsSuccessful = true;

      const projectFileStats = data.projectFileObjs;      
      this.setState({
        projects: projectFileStats
      });      
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

  handleProjectOrderSelectChange = (newSelectedValue) => {
    if (newSelectedValue !== this.state.projectOrderSelectValue) {
      this.setState({
        projectOrderSelectValue: newSelectedValue
      });      
    }
  }

  handleProjectSearchTxtChange = (event) => {
    if (event.target.value !== this.state.projectSearchText) {
      this.setState({
        projectSearchText: event.target.value
      });
    }
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
        <div className="outer-container" onScroll={this.handleOuterContainerScroll}>
          <div className="inner-container">
            <Menu 
              history={props.history}
            />
            <div className="project-top">
              <div className="project-order">
                <ProjectOrderSelect
                  handleSelectChangeFunc={this.handleProjectOrderSelectChange}
                />
              </div>           
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
              projectOrderSelectValue={state.projectOrderSelectValue}
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