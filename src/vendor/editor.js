// import * as THREE from 'three';
import AFRAME from 'aframe';
import { CameraHelper } from './threejs/CameraHelper';

const AFrameExtras = require('aframe-extras');
// use the THREE in aframe
const THREE = AFRAME.THREE;
const tween = AFRAME.TWEEN;

const Events = require('./Events');
const Viewport = require('./viewport').default;

function Editor () {
  this.modules = {};
  this.sceneEl = {};
  this.on = Events.on;
  this.opened = false;
  // Detect if the scene is already loaded
  if (document.readyState === 'complete' || document.readyState === 'loaded') {
    this.onDomLoaded();
  } else {
    document.addEventListener('DOMContentLoaded', this.onDomLoaded.bind(this));
  }
  // DEBUG USE, can be removed later
  AFRAME.EDITOR = this;
}

Editor.prototype = {
  /**
   * Callback once the DOM is completely loaded so we could query the scene
   */
  onDomLoaded: function () {
    this.sceneEl = AFRAME.scenes[0];

    if (!this.sceneEl) {
      setTimeout(this.onDomLoaded.bind(this), 100);
      return; 
    }
    if (this.sceneEl.hasLoaded) {
      this.onSceneLoaded();
    } else {
      this.sceneEl.addEventListener('loaded', this.onSceneLoaded.bind(this));
    }
  },

  /**
   * Callback when the a-scene is loaded
   */
  onSceneLoaded: function () {
    this.container = document.querySelector('.a-canvas');

    const self = this;

    // Wait for camera if necessary.
    if (!AFRAME.scenes[0].camera) {
      AFRAME.scenes[0].addEventListener('camera-set-active', function waitForCamera () {
        AFRAME.scenes[0].removeEventListener('camera-set-active', waitForCamera);
        self.onSceneLoaded();
      });
      return;
    }

    this.currentCameraEl = AFRAME.scenes[0].camera.el;
    this.currentCameraEl.setAttribute('data-aframe-editor-original-camera', '');

    // If the current camera is the default, we should prevent AFRAME from
    // remove it once when we inject the editor's camera
    if (this.currentCameraEl.hasAttribute('data-aframe-default-camera')) {
      this.currentCameraEl.removeAttribute('data-aframe-default-camera');
      this.currentCameraEl.setAttribute('data-aframe-editor', 'default-camera');
    }

    this.editorCameraEl = document.createElement('a-entity');
    // keep this to hide the camera form real editor
    this.editorCameraEl.isInspector = true;
    this.editorCameraEl.addEventListener('componentinitialized', evt => {
      if (evt.detail.name !== 'camera') { return; }
      this.EDITOR_CAMERA = this.editorCameraEl.getObject3D('camera');
      this.initUI();
      this.initModules();
      Events.emit('editor-load', this);
    });
    this.editorCameraEl.setAttribute('camera', {far: 10000, fov: 50, near: 0.05, active: true});
    this.editorCameraEl.setAttribute('data-aframe-editor', 'camera');
    this.editorCameraEl.setAttribute('wasd-controls', true);
    AFRAME.scenes[0].appendChild(this.editorCameraEl);

  },

  initModules: function () {
    for (var moduleName in this.modules) {
      var module = this.modules[moduleName];
      console.log('Initializing module <%s>', moduleName);
      module.init(this.sceneEl);
    }
  },

  initUI: function () {
    this.EDITOR_CAMERA.position.set(20, 10, 20);
    this.EDITOR_CAMERA.lookAt(new THREE.Vector3());
    this.EDITOR_CAMERA.updateMatrixWorld();
    this.camera = this.EDITOR_CAMERA;

    this.initEvents();

    this.selected = null;

    window.dispatchEvent(new Event('editor-loaded'));

    this.scene = this.sceneEl.object3D;
    this.helpers = {};
    this.sceneHelpers = new THREE.Scene();
    this.sceneHelpers.userData.source = 'EDITOR';
    this.sceneHelpers.visible = true; // false;
    this.editorActive = false;

    this.viewport = new Viewport(this);
    Events.emit('windowresize');

    var scope = this;

    function addObjects (object) {
      for (var i = 0; i < object.children.length; i++) {
        var obj = object.children[i];
        for (var j = 0; j < obj.children.length; j++) {
          scope.addObject(obj.children[j]);
        }
      }
    }
    addObjects(this.sceneEl.object3D);

    document.addEventListener('model-loaded', event => {
      this.addObject(event.target.object3D);
    });

    // Events.on('selectedentitycomponentchanged', event => {
    //   this.addObject(event.target.object3D);
    // });

    // Events.on('selectedentitycomponentcreated', event => {
    //   this.addObject(event.target.object3D);
    // });

    this.scene.add(this.sceneHelpers);

    this.open();
    // this.close();
  },

  removeObject: function (object) {
    const el = object.el;
    Events.emit('objectbeforeremoved', el);
    if (el) {
      el.pause();
      this.deselect();
      // Remove just the helper as the object will be deleted by Aframe
      this.removeHelpers(el.object3D);
  
      // need to do delete if the object still exist
      if (el.parentNode) {
        el.parentNode.removeChild(el);
      }
      // el.destroy();
      Events.emit('objectremoved', el.object3D);
    }
  },

  addHelper: (function () {
    var geometry = new THREE.SphereBufferGeometry(2, 4, 2);
    var material = new THREE.MeshBasicMaterial({ color: 0xff0000, visible: false });

    return function (object) {
      var helper;
      if (object instanceof THREE.Camera) {
        // no camera helper
        // return;
        this.cameraHelper = helper = new CameraHelper(object, 0.1);
      } else if (object instanceof THREE.PointLight) {
        // hide all lights controls 
        return;
        // helper = new THREE.PointLightHelper(object, 1);
      } else if (object instanceof THREE.DirectionalLight) {
        // hide all lights controls 
        return;
        // helper = new THREE.DirectionalLightHelper(object, 1);
      } else if (object instanceof THREE.SpotLight) {
        // hide all lights controls 
        return;
        // helper = new THREE.SpotLightHelper(object, 1);
      } else if (object instanceof THREE.HemisphereLight) {
        // hide all lights controls 
        return;
        // helper = new THREE.HemisphereLightHelper(object, 1);
      } else if (object instanceof THREE.SkinnedMesh) {
        helper = new THREE.SkeletonHelper(object);
      } else {
        // no helper for this object type
        return;
      }

      var parentId = object.parent.id;

      // Helpers for object already created, remove every helper
      if (this.helpers[parentId]) {
        for (var objectId in this.helpers[parentId]) {
          this.sceneHelpers.remove(this.helpers[parentId][objectId]);
        }
      } else {
        this.helpers[parentId] = {};
      }

      var picker = new THREE.Mesh(geometry, material);
      picker.name = 'picker';
      picker.userData.object = object;
      picker.userData.source = 'EDITOR';
      helper.add(picker);
      helper.fromObject = object;
      helper.userData.source = 'EDITOR';

      this.sceneHelpers.add(helper);
      this.helpers[parentId][object.id] = helper;

      Events.emit('helperadded', helper);
    };
  })(),

  removeHelpers: function (object) {
    var parentId = object.id;
    if (this.helpers[parentId]) {
      for (var objectId in this.helpers[parentId]) {
        var helper = this.helpers[parentId][objectId];
        Events.emit('helperremoved', helper);
        this.sceneHelpers.remove(helper);
      }
      delete this.helpers[parentId];
    }
  },

  selectEntity: function (entity) {
    // console.log(entity);
    if (entity && !entity.components['camera'] && entity.parentEl !== AFRAME.scenes[0]) {
      entity = entity.parentEl;
    }
    this.selectedEntity = entity;
    if (entity) {
      this.select(entity.object3D);
    } else {
      this.select(null);
    }
    Events.emit('enablecontrols', false);

    // edited: 07052019
    // forgot the reason to add these two lines
    // comment out since it will trigger select twice times
    // if (emit === undefined) {
    //   Events.emit('entityselected', entity);
    // }
  },
  enableControls: function(isEnable) {
    Events.emit('enablecontrols', !!isEnable);
  },
  initEvents: function () {
    window.addEventListener('keydown', evt => {
      // Alt + Ctrl + i: Shorcut to toggle the editor
      // var shortcutPressed = evt.keyCode === 73 && evt.ctrlKey && evt.altKey;
      // j: Shorcut to toggle the editor
      var shortcutPressed = ((evt.keyCode === 32) && evt.ctrlKey);
      if (shortcutPressed) {
        this.toggle();
      }
    });

    Events.on('entityselected', entity => {
      this.selectEntity(entity, false);
    });

    Events.on('objectselectedfromtimeline', (obj, enableControls) => {
      this.selectFromTimeline(obj, enableControls);
    });

    Events.on('editormodechanged', active => {
      const sceneEl = this.sceneEl;
      this.editorActive = active;
      this.sceneHelpers.visible = this.editorActive;
      setTimeout(()=>{
        sceneEl.resize();
      }, 100);
    });

    Events.on('createnewentity', definition => {
      this.createNewEntity(definition);
    });

    Events.on('selectedentitycomponentchanged', event => {
      this.addObject(event.target.object3D);
    });

    Events.on('removeObject', obj => {
      this.removeObject(obj);
    })
    Events.on('takeSnapshot', callback => {
      callback(this.takeSnapshot());
    });

    const editorinstance = this;
    
    Events.on('getEditorInstance', callback => {
      callback(editorinstance);
    });
    document.addEventListener('child-detached', event => {
      var entity = event.detail.el;
      editorinstance.removeObject(entity.object3D);
    });
    // 20181111: add to handle add entity from other sources...
    document.addEventListener('child-attached', event => {
      const entity = event.detail.el;
      editorinstance.addObject(entity.object3D);  
    });

    // key events
    document.addEventListener('keyup', event => {
      // esc btn
      if (event.which === 27 && editorinstance.selected) {
        editorinstance.deselect();
      }
      // print screen
      if (event.which === 44) {
        editorinstance.takeSnapshot();
      }

      // delete btn
      // always deleted when editing values
      // if (event.which === 46 && editorinstance.opened && editorinstance.selected) {
      //   // check if camera
      //   if (editorinstance.selected.el.components['camera']) {
      //     return;
      //   }
      //   let el = editorinstance.selected.el;
      //   Events.emit('objectbeforeremoved', el);
      //   el.pause();
      //   editorinstance.deselect();
      //   // editorinstance.removeObject(el.object3D);
      //   el.parentNode.removeChild(el);
      // }
    });

    Events.on('dommodified', mutations => {
      if (!mutations) { return; }
      mutations.forEach(mutation => {
        if (mutation.type !== 'childList') { return; }
        Array.prototype.slice.call(mutation.removedNodes).forEach(removedNode => {
          if (this.selectedEntity === removedNode) {
            this.selectEntity(null);
          }
        });
      });
    });
  },
  selectById: function (id) {
    if (id === this.camera.id) {
      this.select(this.camera);
      return;
    }
    this.select(this.scene.getObjectById(id, true));
  },
  selectFromTimeline: function (object, enableControls) {
    // if (this.selected === object) {
    //   return;
    // }
    this.selected = object;
    Events.emit('objectselected', object, enableControls);
  },
  // Change to select object
  select: function (object) {
    if (this.selected === object) {
      return;
    }
    this.selected = object;
    Events.emit('objectselected', object);
  },
  deselect: function () {
    this.select(null);
  },
  /**
   * Reset the current scene, removing its content.
   */
  clear: function () {
    this.camera.copy(this.EDITOR_CAMERA);
    this.deselect();
    AFRAME.scenes[0].innerHTML = '';
    Events.emit('editorcleared');
  },
  /**
   * Helper function to add a new entity with a list of components
   * @param  {object} definition Entity definition to add:
   *                             {element: 'a-entity', components: {geometry: 'primitive:box'}}
   * @return {Element}            Entity created
   */
  createNewEntity: function (definition, parentEl) {
    var entity = document.createElement(definition.element);
    var parentEl = parentEl || this.sceneEl;
    // load default attributes
    for (var attr in definition.components) {
      entity.setAttribute(attr, definition.components[attr]);
    }

    // Ensure the components are loaded before update the UI
    entity.addEventListener('loaded', () => {
      this.addEntity(entity);
      entity.object3D.el = entity;
    });

    // this.sceneEl.appendChild(entity);
    parentEl.appendChild(entity);
    return entity;
  },
  takeSnapshot: function() {
    var renderer = this.sceneEl.renderer;
    var scene = this.sceneEl.object3D;
    var camera = this.currentCameraEl.getObject3D('camera');
    // save current selected object
    var selected = this.selected;
    var helper_status = [];
    for (let i = 0; i < this.sceneHelpers.children.length; i++){
      helper_status[i] = this.sceneHelpers.children[i].visible;
      this.sceneHelpers.children[i].visible = false;
    }
    this.deselect();
    renderer.render(scene, camera);
    // if (selected) {
      this.select(selected);
    // }
    for (let i = 0; i < this.sceneHelpers.children.length; i++){
      this.sceneHelpers.children[i].visible = helper_status[i];
    }
    var result = {
      'camera': {
        'position': camera.getWorldPosition(),
        'rotation' : camera.getWorldRotation()
      },
      'image': renderer.domElement.toDataURL()
    };
    Events.emit('snapshotcreated', result);
    return result;
  },
  moveCamera: function(camera) {
    // move the camera to the position and rotation provided
    // console.log('moveCamera',camera);
    let editorinstance = this;
    let viewCamera = this.currentCameraEl;
    let current_position = viewCamera.getAttribute('position');
    let current_rotation = viewCamera.getAttribute('rotation');
    let new_position = camera.position;
    let new_rotation = camera.rotation;
    var coords = { pos_x: current_position.x, pos_y: current_position.y, pos_z: current_position.z, rot_x: THREE.Math.degToRad(current_rotation.x), rot_y: THREE.Math.degToRad(current_rotation.y), rot_z: THREE.Math.degToRad(current_rotation.z) };
    var newcoords = { pos_x: new_position.x, pos_y: new_position.y, pos_z: new_position.z, rot_x: new_rotation.x, rot_y: new_rotation.y, rot_z: new_rotation.z };
    // var tween = AFRAME.TWEEN
    var c = coords;
    var z = new tween.Tween(c)
    .to(newcoords,1000)
    .onUpdate(function(){
      viewCamera.setAttribute('position',{x:c.pos_x,y:c.pos_y,z:c.pos_z});
      viewCamera.setAttribute('rotation',{x:THREE.Math.radToDeg(c.rot_x),y:THREE.Math.radToDeg(c.rot_y),z:THREE.Math.radToDeg(c.rot_z)});
      viewCamera.components['look-controls'].yawObject.rotation.x = c.rot_x;
      viewCamera.components['look-controls'].yawObject.rotation.y = c.rot_y;
      viewCamera.components['look-controls'].yawObject.rotation.z = c.rot_z;
      viewCamera.components['look-controls'].pitchObject.rotation.x = c.rot_x;
      viewCamera.components['look-controls'].pitchObject.rotation.y = c.rot_y;
      viewCamera.components['look-controls'].pitchObject.rotation.z = c.rot_z;

    }).onComplete(function(){
      // console.log('animate complete');
      Events.emit('objectchanged',viewCamera);
      // update the info box if camera is selected
      if (editorinstance.selected && editorinstance.selected.el === viewCamera) {
        Events.emit('refreshsidebarobject3d',viewCamera.object3D);
      }
    })
    z.start();
    // viewCamera.setAttribute('position',camera.position);
    // // this is need for correct display the line, setAttribute('rotation', ...)
    // viewCamera.setAttribute('rotation',{x: THREE.Math.radToDeg(camera.rotation.x),y: THREE.Math.radToDeg(camera.rotation.y),z: THREE.Math.radToDeg(camera.rotation.z)});
    // viewCamera.components['look-controls'].yawObject.rotation.copy(camera.rotation);
    // viewCamera.components['look-controls'].pitchObject.rotation.copy(camera.rotation);

    // // update the controls position
    // Events.emit('objectchanged',viewCamera);
    // // update the info box if camera is selected
    // if (this.selected && this.selected.el === viewCamera) {
    //   Events.emit('refreshsidebarobject3d',viewCamera.object3D);
    // }
  },
  addEntity: function (entity) {
      this.addObject(entity.object3D);
      this.selectEntity(entity);
  },
  /**
   * Toggle the editor
   */
  toggle: function () {
    if (this.opened) {
      this.close();
    } else {
      this.open();
    }
  },
  /**
   * Open the editor UI
   */
  open: function () {
    this.sceneEl = AFRAME.scenes[0];
    this.opened = true;

    if (!this.sceneEl.hasAttribute('aframe-editor-motion-capture-replaying')) {
      this.sceneEl.pause();
      this.sceneEl.exitVR();
    }

    if (this.sceneEl.hasAttribute('embedded')) {
      // Remove embedded styles, but keep track of it.
      // this.sceneEl.removeAttribute('embedded');
      this.sceneEl.setAttribute('aframe-editor-removed-embedded');
    }

    document.body.classList.add('aframe-editor-opened');
    Events.emit('editormodechanged', true);    
  },
  /**
   * Closes the editor and gives the control back to the scene
   * @return {[type]} [description]
   */
  close: function () {
    this.opened = false;
    Events.emit('editormodechanged', false);
    this.sceneEl.play();
    if (this.sceneEl.hasAttribute('aframe-editor-removed-embedded')) {
      // this.sceneEl.setAttribute('embedded', '');
      this.sceneEl.removeAttribute('aframe-editor-removed-embedded');
    }
    document.body.classList.remove('aframe-editor-opened');
    this.sceneEl.resize();
  },
  addObject: function (object) {
    var scope = this;
    object.traverse(child => {
      if (!child.el || !child.el.isInspector) {
        scope.addHelper(child, object);
      }
    });

    Events.emit('objectadded', object);
    Events.emit('scenegraphchanged');
  }
};

// v1
// const editor = new Editor();

// DEBUG USE, can be removed later
// AFRAME.EDITOR = editor;

// export default editor;
// v1 end
// v2 test
// initial the editor in the react rather then auto initial here
export default Editor;
// v2
