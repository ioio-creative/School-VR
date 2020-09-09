import React, { Component } from 'react';
import { Link } from 'react-router-dom';

import {
  LanguageContextConsumer,
  LanguageContextMessagesConsumer
} from 'globals/contexts/locale/languageContext';

import MenuComponent from 'components/menuComponent';
import CrossButton from 'components/crossButton';
import DefaultLoading from 'components/loading/defaultLoading';

import ipcHelper from 'utils/ipc/ipcHelper';
import routes from 'globals/routes';
import { funcFactoryForCompareFileStatsByProperty } from 'utils/saveLoadProjectHelper/listProjectsAsync';
import { formatDateTime } from 'utils/dateTime/formatDateTime';
import { getAbsoluteUrlFromRelativeUrl } from 'utils/setStaticResourcesPath';
import handleErrorWithUiDefault from 'utils/errorHandling/handleErrorWithUiDefault';
import isInViewport from 'utils/ui/isInViewport';
import isNonEmptyArray from 'utils/variableType/isNonEmptyArray';

import iconPlus from 'media/icons/plus.svg';

import './ProjectListPage.css';

class ProjectItem extends Component {
  constructor(props) {
    super(props);

    // constants
    this.defaultThumbnailSrc = getAbsoluteUrlFromRelativeUrl(
      'images/ProjectListPage/thumbnail1.svg'
    );

    // state
    this.state = {
      isShowProjectHandles: false,
      isShowOptionOverlay: false
    };
  }

  /* methods */

  showProjectHandles = _ => {
    if (!this.state.isShowProjectHandles) {
      this.setState({
        isShowProjectHandles: true
      });
    }
  };

  hideProjectHandles = _ => {
    if (this.state.isShowProjectHandles) {
      this.setState({
        isShowProjectHandles: false
      });
    }
  };

  /* end of methods */

  /* event handlers */

  handleItemMouseEnter = _ => {
    this.showProjectHandles();
  };

  handleItemMouseLeave = _ => {
    this.hideProjectHandles();
  };

  handleItemOptionMouseEnter = () => {
    this.setState({
      isShowOptionOverlay: true
    });
  };

  handleItemOptionMouseLeave = () => {
    this.setState({
      isShowOptionOverlay: false
    });
  };

  handleItemRenameClick = _ => {
    ipcHelper.saveSchoolVrFileDialog((err, data) => {
      if (err) {
        handleErrorWithUiDefault(err);
        return;
      }

      const project = this.props.item;
      const oldFilePath = project.savedProjectFilePath;
      const newFilePath = data.filePath;

      ipcHelper.renameFile(oldFilePath, newFilePath, err => {
        if (err) {
          handleErrorWithUiDefault(err);
          return;
        }

        this.props.handleItemRenameClickFunc(project);
      });
    });
  };

  handleItemCopyToNewClick = _ => {
    ipcHelper.saveSchoolVrFileDialog((err, data) => {
      if (err) {
        handleErrorWithUiDefault(err);
        return;
      }

      const project = this.props.item;
      const src = project.savedProjectFilePath;
      const dest = data.filePath;

      ipcHelper.copyFile(src, dest, err => {
        if (err) {
          handleErrorWithUiDefault(err);
          return;
        }

        this.props.handleItemCopyToNewClickFunc(project);
      });
    });
  };

  handleItemDeleteClick = _ => {
    const props = this.props;
    const project = props.item;

    const message = 'Are you sure you want to delete this project?';
    const detail = project.savedProjectFilePath;
    ipcHelper.showYesNoWarningMessageBox(message, detail, (err, data) => {
      if (err) {
        handleErrorWithUiDefault(err);
        return;
      }

      const btnId = data.buttonId;
      const isDelete = btnId === 0;
      if (isDelete) {
        ipcHelper.deleteFile(project.savedProjectFilePath, (err, data) => {
          if (err) {
            handleErrorWithUiDefault(err);
            return;
          }

          props.handleItemDeleteClickFunc(project);
        });
      }
    });
  };

  /* end of event handlers */

  render() {
    const props = this.props;
    const state = this.state;

    const project = props.item;

    const thumbnailSrc = project.base64ThumbnailStr || this.defaultThumbnailSrc;

    return (
      <div
        className='project-item'
        // https://www.w3schools.com/jsref/tryit.asp?filename=tryjsref_onmousemove_leave_out
        onMouseEnter={this.handleItemMouseEnter}
        onMouseLeave={this.handleItemMouseLeave}
      >
        <div className='project-info-container'>
          <div className='project-info'>
            <div className='project-image'>
              <img src={thumbnailSrc} alt='thumbnail' />
            </div>
            <div className='project-info-text-container'>
              <div className='project-info-text'>
                <div className='project-name'>{project.name}</div>
                <div className='project-lastupdate'>
                  <LanguageContextMessagesConsumer messageId='ProjectItem.Info.LastAccessedLabel' />
                  {` ${project.atime ? formatDateTime(project.atime) : ''}`}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div
          className={`project-handles-container ${
            state.isShowProjectHandles ? 'show' : 'hide'
          } ${state.isShowOptionOverlay ? 'show-overlay' : 'hide-overlay'}`}
        >
          <div className='project-handles'>
            <div className='project-preview-container'>
              <div className='project-preview'>
                <Link
                  to={routes.presenterWithProjectFilePathQuery(project.path)}
                >
                  <LanguageContextMessagesConsumer messageId='ProjectItem.Handles.PreviewLabel' />
                </Link>
              </div>
            </div>
            <div className='project-options-overlay' />
            <div
              className='project-options-container'
              onMouseEnter={this.handleItemOptionMouseEnter}
              onMouseLeave={this.handleItemOptionMouseLeave}
            >
              <div className='project-options'>
                <LanguageContextMessagesConsumer messageId='ProjectItem.Handles.OptionsLabel' />
              </div>
              <div className='project-options-detail'>
                <div
                  className='project-options-detail-item'
                  onClick={this.handleItemRenameClick}
                >
                  <LanguageContextMessagesConsumer messageId='ProjectItem.Handles.RenameLabel' />
                </div>
                <div
                  className='project-options-detail-item'
                  onClick={this.handleItemCopyToNewClick}
                >
                  <LanguageContextMessagesConsumer messageId='ProjectItem.Handles.CopyToNewLabel' />
                </div>
                <div
                  className='project-options-detail-item'
                  onClick={this.handleItemDeleteClick}
                >
                  <LanguageContextMessagesConsumer messageId='ProjectItem.Handles.DeleteLabel' />
                </div>
              </div>
            </div>
            <div className='project-edit-container'>
              <div className='project-edit'>
                <Link to={routes.editorWithProjectFilePathQuery(project.path)}>
                  <LanguageContextMessagesConsumer messageId='ProjectItem.Handles.EditLabel' />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

class ProjectList extends Component {
  /* methods */

  itemFilterPredicate = project => {
    const projectSearchText = this.props.projectSearchText;
    if (projectSearchText === '') {
      return true;
    }
    return project.name.toLowerCase().includes(projectSearchText.toLowerCase());
  };

  /* end of methods */

  /* event handlers */

  handleItemRenameClick = project => {
    this.props.handleItemRenameClickFunc(project);
  };

  handleItemCopyToNewClick = project => {
    this.props.handleItemCopyToNewClickFunc(project);
  };

  handleItemDeleteClick = project => {
    this.props.handleItemDeleteClickFunc(project);
  };

  /* end of event handlers */

  render() {
    const props = this.props;

    const projects = props.items;

    // should still show new project button
    // if (projects.length === 0) {
    //   return null;
    // }

    // filter projects
    const filteredProjects = projects.filter(this.itemFilterPredicate);

    // order projects
    let compareProjectFunc;
    switch (props.projectOrderSelectValue) {
      case 'most-recent':
        compareProjectFunc = funcFactoryForCompareFileStatsByProperty(
          fileStatObj => fileStatObj.atimeMs,
          true
        );
        break;
      case 'least-recent':
        compareProjectFunc = funcFactoryForCompareFileStatsByProperty(
          fileStatObj => fileStatObj.atimeMs,
          false
        );
        break;
      case 'by-name':
        compareProjectFunc = funcFactoryForCompareFileStatsByProperty(
          fileStatObj => fileStatObj.name.toLowerCase(),
          false
        );
        break;
      case 'by-name-reverse':
        compareProjectFunc = funcFactoryForCompareFileStatsByProperty(
          fileStatObj => fileStatObj.name.toLowerCase(),
          true
        );
        break;
    }
    const orderedFilteredProjects = compareProjectFunc
      ? filteredProjects.sort(compareProjectFunc)
      : filteredProjects;

    const displayedProjectElements = orderedFilteredProjects.map(project => {
      return (
        <ProjectItem
          key={project.path}
          item={project}
          handleItemRenameClickFunc={this.handleItemRenameClick}
          handleItemCopyToNewClickFunc={this.handleItemCopyToNewClick}
          handleItemDeleteClickFunc={this.handleItemDeleteClick}
        />
      );
    });

    return (
      <div className='project-list' onScroll={this.handleProjectListScroll}>
        <div
          className='project-item create-new-project'
          ref={props.setCreateNewProjectBlockRefFunc}
        >
          <Link to='/editor'>
            <div className='create-new-project-content'>
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

    // refs
    this.customSelectContainer = null;
    this.setCustomSelectContainerRef = element =>
      (this.customSelectContainer = element);

    this.customSelect = null;
    this.setCustomSelectRef = element => (this.customSelect = element);

    // state
    this.state = {
      selectedValue: 'most-recent'
    };
  }

  /* react life-cycle */

  componentDidMount() {
    this.createCustomSelectStyle();

    /*if the user clicks anywhere outside the select box,
    then close all select boxes:*/
    document.addEventListener('click', this.closeAllSelect);
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.closeAllSelect);
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps.language.code !== this.props.language.code) {
      this.removeCustomSelectStyle();
      this.createCustomSelectStyle();
    }
  }

  /* end of react life-cycle */

  /* event handlers */

  handleProjectOrderSelectChange = newSelectedValue => {
    if (newSelectedValue !== this.state.selectedValue) {
      this.setState({
        selectedValue: newSelectedValue
      });
      this.props.handleSelectChangeFunc(newSelectedValue);
    }
  };

  /* end of event handlers */

  /* methods */

  createCustomSelectStyle = _ => {
    const self = this;

    /*create a new DIV that will act as the selected item:*/
    const a = document.createElement('DIV');
    a.setAttribute('class', 'select-selected');
    a.innerHTML = this.customSelect.options[
      this.customSelect.selectedIndex
    ].innerHTML;
    this.customSelectContainer.appendChild(a);
    /*create a new DIV that will contain the option list:*/
    const b = document.createElement('DIV');
    b.setAttribute('class', 'select-items select-hide');
    for (let j = 1; j < this.customSelect.length; j++) {
      /*for each option in the original select element,
      create a new DIV that will act as an option item:*/
      const c = document.createElement('DIV');
      const cValue = this.customSelect.options[j].getAttribute('value');
      c.innerHTML = this.customSelect.options[j].innerHTML;
      c.setAttribute('data-value', cValue);
      c.addEventListener('click', function (e) {
        /*when an item is clicked, update the original select box,
          and the selected item:*/
        const s = this.parentNode.parentNode.getElementsByTagName('select')[0];
        const h = this.parentNode.previousSibling;
        for (let i = 0; i < s.length; i++) {
          if (s.options[i].innerHTML == this.innerHTML) {
            s.selectedIndex = i;
            h.innerHTML = this.innerHTML;
            const y = this.parentNode.getElementsByClassName(
              'same-as-selected'
            );
            for (let k = 0; k < y.length; k++) {
              y[k].removeAttribute('class');
            }
            this.setAttribute('class', 'same-as-selected');
            break;
          }
        }
        h.click();

        self.handleProjectOrderSelectChange(cValue);
      });
      b.appendChild(c);
    }
    this.customSelectContainer.appendChild(b);
    a.addEventListener('click', function (e) {
      /*when the select box is clicked, close any other select boxes,
        and open/close the current select box:*/
      e.stopPropagation();
      self.closeAllSelect(this);
      this.nextSibling.classList.toggle('select-hide');
      this.classList.toggle('select-arrow-active');
    });
  };

  removeCustomSelectStyle = _ => {
    this.customSelectContainer.removeChild(
      document.querySelector(
        '#project-list-page .project-order-select.custom-select .select-selected'
      )
    );
    this.customSelectContainer.removeChild(
      document.querySelector(
        '#project-list-page .project-order-select.custom-select .select-items'
      )
    );
  };

  closeAllSelect = elmnt => {
    /*a function that will close all select boxes in the document,
    except the current select box:*/
    var x,
      y,
      i,
      arrNo = [];
    x = document.getElementsByClassName('select-items');
    y = document.getElementsByClassName('select-selected');
    for (i = 0; i < y.length; i++) {
      if (elmnt == y[i]) {
        arrNo.push(i);
      } else {
        y[i].classList.remove('select-arrow-active');
      }
    }
    for (i = 0; i < x.length; i++) {
      if (arrNo.indexOf(i)) {
        x[i].classList.add('select-hide');
      }
    }
  };

  /* end of methods */

  render() {
    //const state = this.state;
    const { messages } = this.props;
    return (
      <div
        className='project-order-select custom-select'
        ref={this.setCustomSelectContainerRef}
      >
        <select ref={this.setCustomSelectRef}>
          {/* first option is default option */}
          <option value='most-recent'>
            {messages['ProjectOrderSelect.Options.MostRecentLabel']}
          </option>
          <option value='most-recent'>
            {messages['ProjectOrderSelect.Options.MostRecentLabel']}
          </option>
          <option value='least-recent'>
            {messages['ProjectOrderSelect.Options.LeastRecentLabel']}
          </option>
          <option value='by-name'>
            {messages['ProjectOrderSelect.Options.ByNameLabel']}
          </option>
          <option value='by-name-reverse'>
            {messages['ProjectOrderSelect.Options.ByNameReverseLabel']}
          </option>
        </select>
      </div>
    );
  }
}

function ProjectListPageMenu(props) {
  const { history } = props;

  /* event handlers */

  function handleBtnNewClick(event) {
    history.push(routes.editor);
  }

  function handleBtnOpenClick(event) {
    ipcHelper.openSchoolVrFileDialog((err, data) => {
      if (err) {
        handleErrorWithUiDefault(err);
        return;
      }

      const filePaths = data.filePaths;
      if (isNonEmptyArray(filePaths)) {
        history.push(routes.editorWithProjectFilePathQuery(filePaths[0]));
      } else {
        //alert('No files are selected!');
      }
    });
  }

  /* end of event handlers */

  return (
    <MenuComponent
      menuButtons={[
        {
          labelId: 'Menu.FileLabel',
          // onClick: _=> { console.log('file') },
          children: [
            {
              labelId: 'Menu.File.NewLabel',
              onClick: handleBtnNewClick
            },
            {
              labelId: 'Menu.File.OpenLabel',
              onClick: handleBtnOpenClick
            },
            {
              labelId: '-'
            },
            {
              labelId: 'Menu.File.ExitLabel',
              methodNameToInvoke: 'closeApp'
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
    this.setCreateNewProjectBlockRef = element =>
      (this.createNewProjectBlock = element);

    // state
    this.state = {
      projects: [], // array of ProjectFile objects
      projectOrderSelectValue: 'most-recent',
      projectSearchText: '',
      isShowSmallProjectNewButton: false,
      isLoading: false
    };
  }

  /* react lifecycles */

  componentDidMount() {
    this.enumerateProjects();
  }

  /* end of react lifecycles */

  /* methods */

  setLoading = _ => {
    this.setState({
      isLoading: true
    });
  };

  unsetLoading = _ => {
    this.setState({
      isLoading: false
    });
  };

  enumerateProjects = _ => {
    //const props = this.props;
    this.setLoading();
    ipcHelper.listProjects((err, data) => {
      this.unsetLoading();
      if (err) {
        handleErrorWithUiDefault(err);
        return;
      }

      const projectFileStats = data.projectFileObjs;
      this.setState({
        projects: projectFileStats
      });
    });
  };

  showSmallProjectNewButton = _ => {
    if (!this.state.isShowSmallProjectNewButton) {
      this.setState({
        isShowSmallProjectNewButton: true
      });
    }
  };

  hideSmallProjectNewButton = _ => {
    if (this.state.isShowSmallProjectNewButton) {
      this.setState({
        isShowSmallProjectNewButton: false
      });
    }
  };

  /* end of methods */

  /* event handlers */

  handleOuterContainerScroll = event => {
    if (this.createNewProjectBlock) {
      const isCreateNewProjectBlockInViewport = isInViewport(
        this.createNewProjectBlock
      );
      if (isCreateNewProjectBlockInViewport) {
        this.hideSmallProjectNewButton();
      } else {
        this.showSmallProjectNewButton();
      }
    }
  };

  handleProjectOrderSelectChange = newSelectedValue => {
    if (newSelectedValue !== this.state.projectOrderSelectValue) {
      this.setState({
        projectOrderSelectValue: newSelectedValue
      });
    }
  };

  handleProjectSearchTxtChange = event => {
    if (event.target.value !== this.state.projectSearchText) {
      this.setState({
        projectSearchText: event.target.value
      });
    }
  };

  handleSmallProjectNewButtonClick = _ => {
    this.props.history.push(routes.editor);
  };

  handleItemRenameClick = projectToRename => {
    this.enumerateProjects();
  };

  handleItemCopyToNewClick = projectToCopyToNew => {
    this.enumerateProjects();
  };

  handleProjectDeleteClick = projectToDelete => {
    // this.setState((state, props) => {
    //   return {
    //     projects: state.projects.filter(project => project !== projectToDelete)
    //   };
    // });

    this.enumerateProjects();
  };

  /* end of event handlers */

  render() {
    const props = this.props;
    const state = this.state;

    return (
      <div id='project-list-page'>
        <div
          className='outer-container'
          onScroll={this.handleOuterContainerScroll}
        >
          <div className='inner-container'>
            <ProjectListPageMenu history={props.history} />
            <div className='project-top'>
              <div className='project-order'>
                <LanguageContextConsumer
                  render={({ language, messages }) => (
                    <ProjectOrderSelect
                      language={language}
                      messages={messages}
                      handleSelectChangeFunc={
                        this.handleProjectOrderSelectChange
                      }
                    />
                  )}
                />
              </div>
              <div className='project-search'>
                <LanguageContextConsumer
                  render={({ language, messages }) => (
                    <input
                      type='text'
                      name='projectSearchTxt'
                      placeholder={messages['ProjectSearch.PlaceHolderLabel']}
                      value={state.projectSearchText}
                      onChange={this.handleProjectSearchTxtChange}
                    />
                  )}
                />
              </div>
            </div>
            <div
              className={`${
                state.isLoading ? 'show' : 'hide'
              } projects-loading-container`}
            >
              <DefaultLoading />
            </div>
            <div className={`${state.isLoading ? 'hide' : 'show'}`}>
              <ProjectList
                items={state.projects}
                projectOrderSelectValue={state.projectOrderSelectValue}
                projectSearchText={state.projectSearchText}
                setCreateNewProjectBlockRefFunc={
                  this.setCreateNewProjectBlockRef
                }
                handleItemRenameClickFunc={this.handleItemRenameClick}
                handleItemCopyToNewClickFunc={this.handleItemCopyToNewClick}
                handleItemDeleteClickFunc={this.handleProjectDeleteClick}
              />
            </div>
          </div>
          <div
            className={`project-new ${
              state.isShowSmallProjectNewButton ? 'show' : 'hide'
            }`}
          >
            <CrossButton
              backgroundBorderRadius='50%'
              backgroundSize='64px'
              backgroundColor='white'
              strokeLength='25px'
              strokeThickness='5px'
              strokeColor='#205178'
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
