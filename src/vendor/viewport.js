import AFRAME from 'aframe';

import TransformControls from './threejs/TransformControls-new.js';
import EditorControls from './threejs/EditorControls.js';

const THREE = AFRAME.THREE;

const Events = require('./Events');

function getNumber (value) {
  return parseFloat(value.toFixed(3));
}

function Viewport (editor) {
  var container = {
    dom: editor.container
  };
  var prevActiveCameraEl = editor.currentCameraEl;
  editor.sceneEl.addEventListener('camera-set-active', event => {
    if (editor.opened) {
      // If we're in edit mode, save the newly active camera and activate when exiting.
      if (event.detail.cameraEl !== editor.editorCameraEl) {
        prevActiveCameraEl = event.detail.cameraEl;
      }

      // Force keep the Inspector camera as active.
      if (!event.detail.cameraEl.isInspector) {
        // TODO: Motion capture.
        // editor.editorCameraEl.setAttribute('camera', 'active', 'true');
      }
    }
  });

  // helpers
  var sceneHelpers = editor.sceneHelpers;
  var objects = [];

  var grid = new THREE.GridHelper(30, 60, 0x555555, 0x292929);

  sceneHelpers.add(grid);

  var camera = editor.editorCameraEl.getObject3D('camera');

  var selectionBox = new THREE.BoxHelper();
  selectionBox.material.depthTest = false;
  selectionBox.material.transparent = true;
  selectionBox.material.color.set(0x1faaf2);
  selectionBox.visible = false;
  sceneHelpers.add(selectionBox);

  var objectPositionOnDown = null;
  var objectRotationOnDown = null;
  var objectScaleOnDown = null;

  /**
   * Update the helpers of the object and it childrens
   * @param  {object3D} object Object to update
   */
  function updateHelpers (object) {
    if (editor.helpers[object.id] !== undefined) {
      for (var objectId in editor.helpers[object.id]) {
        editor.helpers[object.id][objectId].update();
      }
    }
  }

  const transformControls = new TransformControls(camera, editor.container);
  transformControls.addEventListener('change', () => {
    const object = transformControls.object;
    if (object === undefined) { return; }

    selectionBox.setFromObject(object).update();

    updateHelpers(object);

    Events.emit('refreshsidebarobject3d', object);

  });

  transformControls.addEventListener('mouseDown', () => {
    var object = transformControls.object;

    objectPositionOnDown = object.position.clone();
    objectRotationOnDown = object.rotation.clone();
    objectScaleOnDown = object.scale.clone();

    controls.enabled = false;
  });

  transformControls.addEventListener('mouseUp', () => {
    var object = transformControls.object;
    if (object !== null) {
      switch (transformControls.getMode()) {
        case 'translate':

          if (!objectPositionOnDown.equals(object.position)) {
            // @todo
          }
          break;

        case 'rotate':
          if (!objectRotationOnDown.equals(object.rotation)) {
            // @todo
          }
          break;

        case 'scale':
          if (!objectScaleOnDown.equals(object.scale)) {
            // @todo
          }
          break;
      }
    }
    controls.enabled = true;
    Events.emit('objectchanged', object);
  });

  // set snap to grid for the controls
  transformControls.setTranslationSnap(0.2);
  transformControls.setRotationSnap(THREE.Math.degToRad( 15 ));
  transformControls.setScaleSnap(0.5);

  sceneHelpers.add(transformControls);
/*
  signals.objectSelected.add(function (object) {
    selectionBox.visible = false;
    if (!editor.selected) {
      // if (!editor.selected || editor.selected.el.helper) {
      return;
    }

    if (object !== null) {
      if (object.geometry !== undefined &&
        object instanceof THREE.Sprite === false) {
        selectionBox.setFromObject(object).update();
        selectionBox.visible = true;
      }

      transformControls.attach(object);
    }
  });
*/

  Events.on('objectchanged', () => {
    if (editor.selectedEntity && editor.selectedEntity.object3DMap['mesh']) {
      selectionBox.update(editor.selected);
    }
  });

  // object picking
  var raycaster = new THREE.Raycaster();
  var mouse = new THREE.Vector2();

  // events
  function getIntersects (point, objects) {
    mouse.set((point.x * 2) - 1, -(point.y * 2) + 1);
    raycaster.setFromCamera(mouse, camera);
    return raycaster.intersectObjects(objects, true);
  }

  var onDownPosition = new THREE.Vector2();
  var onUpPosition = new THREE.Vector2();
  var onDoubleClickPosition = new THREE.Vector2();

  function getMousePosition (dom, x, y) {
    var rect = dom.getBoundingClientRect();
    return [ (x - rect.left) / rect.width, (y - rect.top) / rect.height ];
  }

  function handleClick () {
    if (onDownPosition.distanceTo(onUpPosition) === 0) {
      var intersects = getIntersects(onUpPosition, objects);
      if (intersects.length > 0) {
        var selected = false;
        for (var i = 0; i < intersects.length; i++) {
          var object = intersects[i].object;

          if (object.el && !object.el.getAttribute('visible')) {
            continue;
          }

          // hide this to enable selecting camera
          // if (object.type === 'PerspectiveCamera' ||
          //     (object.el && object.el.getObject3D('camera')) ||
          //     object.parent.camera) {
          //   continue;
          // }

          selected = true;

          if (object.userData.object !== undefined) {
            // helper
            editor.selectEntity(object.userData.object.el, false);
          } else {
            editor.selectEntity(object.el, false);
          }

          break;
        }

        if (!selected) {
          editor.selectEntity(null, false);
        }
      } else {
        editor.selectEntity(null, false);
      }
    }
  }

  function onMouseDown (event) {
    if (event instanceof CustomEvent) {
      return;
    }

    event.preventDefault();

    var array = getMousePosition(editor.container, event.clientX, event.clientY);
    onDownPosition.fromArray(array);

    document.addEventListener('mouseup', onMouseUp, false);
  }

  function onMouseUp (event) {
    if (event instanceof CustomEvent) {
      return;
    }

    var array = getMousePosition(editor.container, event.clientX, event.clientY);
    onUpPosition.fromArray(array);
    handleClick();

    document.removeEventListener('mouseup', onMouseUp, false);
  }

  function onTouchStart (event) {
    var touch = event.changedTouches[ 0 ];
    var array = getMousePosition(editor.container, touch.clientX, touch.clientY);
    onDownPosition.fromArray(array);

    document.addEventListener('touchend', onTouchEnd, false);
  }

  function onTouchEnd (event) {
    var touch = event.changedTouches[ 0 ];
    var array = getMousePosition(editor.container, touch.clientX, touch.clientY);
    onUpPosition.fromArray(array);
    handleClick();
    document.removeEventListener('touchend', onTouchEnd, false);
  }

  function onDoubleClick (event) {
    var array = getMousePosition(editor.container, event.clientX, event.clientY);
    onDoubleClickPosition.fromArray(array);

    var intersects = getIntersects(onDoubleClickPosition, objects);

    if (intersects.length > 0) {
      var intersect = intersects[ 0 ];
      Events.emit('objectfocused', intersect.object);
    }
  }

  // controls need to be added *after* main logic,
  // otherwise controls.enabled doesn't work.
  var controls = new EditorControls(camera, editor.container);

  function disableControls () {
    editor.container.removeEventListener('mousedown', onMouseDown);
    editor.container.removeEventListener('touchstart', onTouchStart);
    editor.container.removeEventListener('dblclick', onDoubleClick);
    transformControls.dispose();
    controls.enabled = false;
  }

  function enableControls () {
    editor.container.addEventListener('mousedown', onMouseDown, false);
    editor.container.addEventListener('touchstart', onTouchStart, false);
    editor.container.addEventListener('dblclick', onDoubleClick, false);
    transformControls.activate();
    controls.enabled = true;
  }
  enableControls();

  controls.addEventListener('change', () => {
    transformControls.update();
    // gaTrackChangeEditorCamera();
    // editor.signals.cameraChanged.dispatch(camera);
  });

  Events.on('editorcleared', () => {
    controls.center.set(0, 0, 0);
  });

  Events.on('transformmodechanged', mode => {
    transformControls.setMode(mode);
  });

  Events.on('gettransformmode', callback => {
    callback(transformControls.getMode());
  });

  Events.on('snapchanged', dist => {
    transformControls.setTranslationSnap(dist);
  });

  Events.on('translationsnapchanged', dist => {
    transformControls.setTranslationSnap(dist);
  });
  Events.on('rotationsnapchanged', deg => {
    transformControls.setRotationSnap(THREE.Math.degToRad(deg));
  });
  Events.on('scalesnapchanged', percentOfInitScale => {
    transformControls.setScaleSnap(percentOfInitScale);
  });

  Events.on('spacechanged', space => {
    transformControls.setSpace(space);
  });

  Events.on('objectselected', object => {
    selectionBox.visible = false;
    transformControls.detach();
    if (object && object.el) {
      if (object.el.getObject3D('mesh')) {
        selectionBox.setFromObject(object).update();
        selectionBox.visible = true;
      } else if (object.el.getObject3D('camera')) {
        selectionBox.setFromObject(object).update();
        // hide the blue frame box when selected camera
        selectionBox.visible = false;
      }

      transformControls.attach(object);
    }
  });

  Events.on('objectfocused', object => {
    controls.focus(object);
    // ga('send', 'event', 'Viewport', 'selectEntity');
  });

  Events.on('geometrychanged', object => {
    if (object !== null) {
      selectionBox.setFromObject(object).update();
    }
  });

  Events.on('objectadded', object => {
    object.traverse(child => {
      if (objects.indexOf(child) === -1) {
        objects.push(child);
      }
    });
  });

  Events.on('objectchanged', object => {
    if (editor.selected === object) {
      // Hack because object3D always has geometry :(
      if (object.geometry && object.geometry.vertices && object.geometry.vertices.length > 0) {
        selectionBox.setFromObject(object).update();
      }
      // transformControls.update();
    }

    transformControls.update();
    if (object instanceof THREE.PerspectiveCamera) {
      object.updateProjectionMatrix();
    }

    updateHelpers(object);
  });

  Events.on('selectedentitycomponentchanged', () => {
    Events.emit('objectchanged', editor.selectedEntity.object3D);
  });

  Events.on('objectremoved', object => {
    object.traverse(child => {
      objects.splice(objects.indexOf(child), 1);
    });
  });
  Events.on('helperadded', helper => {
    objects.push(helper.getObjectByName('picker'));
    updateHelpers(helper.fromObject.parent);
  });
  Events.on('helperremoved', object => {
    objects.splice(objects.indexOf(object.getObjectByName('picker')), 1);
  });
  Events.on('windowresize', () => {
    camera.aspect = container.dom.offsetWidth / container.dom.offsetHeight;
    camera.updateProjectionMatrix();
    // renderer.setSize(container.dom.offsetWidth, container.dom.offsetHeight);
  });
  Events.on('gridvisibilitychanged', showGrid => {
    grid.visible = showGrid;
  });
  Events.on('togglegrid', () => {
    grid.visible = !grid.visible;
  });
  Events.on('disablecontrols', active => {
    transformControls.showX = false;
    transformControls.showY = false;
    transformControls.showZ = false;
    // disableControls();    
  })
  // Events.on('enablecontrols', active => {
  //   transformControls.showX = true;
  //   transformControls.showY = true;
  //   transformControls.showZ = true;
  //   // enableControls();
  // })
  Events.on('enablecontrols', active => {
    transformControls.showX = active;
    transformControls.showY = active;
    transformControls.showZ = active;
    // enableControls();
  })

  Events.on('editormodechanged', active => {
    if (active) {
      enableControls();
      editor.editorCameraEl.setAttribute('camera', 'active', 'true');
      Array.prototype.slice.call(document.querySelectorAll('.a-enter-vr,.rs-base')).forEach(element => {
        element.style.display = 'none';
      });
    } else {
      disableControls();
      prevActiveCameraEl.setAttribute('camera', 'active', 'true');
      Array.prototype.slice.call(document.querySelectorAll('.a-enter-vr,.rs-base')).forEach(element => {
        element.style.display = 'block';
      });
    }
  });
}

export default Viewport;
