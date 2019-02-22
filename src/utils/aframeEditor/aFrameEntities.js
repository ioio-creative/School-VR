import React from 'react';
import 'aframe-gif-shader';
import {openImageDialog, openGifDialog, openVideoDialog} from './openFileDialog';
import {mediaType, openFileDialogFilter} from 'globals/config';
import fileSystem from 'utils/fileSystem/fileSystem';


const Events = require('vendor/Events.js');
const uuid = require('uuid/v1');
const smalltalk = require('smalltalk');


let editor = null;

Events.on('editor-load', obj => {
  // console.log('editorLoad');
  editor = obj;
});


/* constants */

const defaultSpawnPosition = { x: 0, y: 1, z: 0 };

/* end of constants */


function adjustWidthAndHeightOfNewlyCreatedElement(elementWidth, elementHeight) {
  let w = elementWidth;
  let h = elementHeight;
  if (w > h) {
    w = w / h;
    h = 1;
  } else {
    h = h / w;
    w = 1;
  }
  return {
    w: w,
    h: h
  };
}

function handleDialogFilesSelected(filePaths, callBack) {
  if (filePaths && filePaths[0]) {        
    callBack(filePaths[0]);
  } else {
    //alert('No files are selected!');
  }
}

function addToAsset(el, existingUuidStr) {
  const sceneEl = editor.sceneEl;
  let assetEl = sceneEl.querySelector('a-asset');
  if (!assetEl) {
    assetEl = document.createElement('a-asset');
    sceneEl.append(assetEl);
  }
  assetEl.append(el);
  let newid;
  let fileMediaType;
  switch (el.tagName) {
    case 'VIDEO':
      newid = 'vid_' + uuid(); // 'vid_' + document.querySelectorAll('video').length;
      el.loop = true;
      fileMediaType = mediaType.video;
      break;
    case 'IMG':
      newid = 'img_' + uuid() // 'img_' + document.querySelectorAll('img').length;
      
      const fileExtensionWithoutDot = fileSystem.getFileExtensionWithoutLeadingDot(el.src);
      const isGif = openFileDialogFilter.gif.extensions.includes(fileExtensionWithoutDot);
      fileMediaType = isGif ? mediaType.gif : mediaType.image;      

      break;
    default:
      console.log('editorFunctions_addToAsset: ???');
      break;
  }
  if (existingUuidStr !== undefined) {
    newid = existingUuidStr;
  }
  el.setAttribute('id', newid);
  Events.emit('addAsset', 
    fileMediaType,
    newid,
    el.src
  );
  return newid;
}

// this function may use later to combine the handleUpload functions
// may be obsolete as we may not use the Base64 workflow any more
// function getFileType(base64file) {
//   // console.log(base64file);
//   let fileinfo = base64file.split(/[:;\/]/);
//   let filetype = fileinfo[1];
//   let fileext = fileinfo[2];
//   return fileext;
// }

/**
 * Helper function to add a new entity with a list of components
 * wrapper of createNewEntity function in editor.js
 * @param {object}      options  Entity definition to add:
 *                               {element: 'a-entity', components: {geometry: 'primitive:box'}}
 * @param {HTMLElement} parentEl Parent of the entity, now ignore and add to a-scene
 *                               <a-box />
 * @return {Element}             Entity created
 */
function addEntity(options, parentEl) {
  return editor.createNewEntity(options);
  // return editor.createNewEntity(options, parentEl);
}

function addEntityAutoType(elementType, elementId, entityParent) {
  switch (elementType) {
    case 'a-box': {
      addNewBox(elementId, entityParent);
      break;
    };
    case 'a-cone': {
      addNewCone(elementId, entityParent);
      break;
    };
    case 'a-sphere': {
      addNewSphere(elementId, entityParent);
      break;
    };
    case 'a-cylinder': {
      addNewCylinder(elementId, entityParent);
      break;
    };
    case 'a-tetrahedron': {
      addNewTetrahedron(elementId, entityParent);
      break;
    };
    case 'a-icosahedron': {
      addNewIcosahedron(elementId, entityParent);
      break;
    };
    case 'a-plane': {
      addNewPlane(elementId, entityParent);
      break;
    };
    case 'a-triangle': {
      addNewTriangle(elementId, entityParent);
      break;
    };
    case 'a-text': {
      addNewText(elementId, entityParent);
      break;
    };
    case 'a-camera': {
      addNewCamera(elementId, entityParent);
      break;
    };
    // maybe let the assest call the add function?
    // case 'a-image': {
    //   loadImage(elementId, entityParent);
    //   break;
    // };
    // case 'a-video': {
    //   loadVideo(elementId, entityParent);
    //   break;
    // };
    default:
      break;
  }
}

function addNewBox(elementId, entityParent) {
  if (!elementId) {
    elementId = uuid();
  }
  const newEntity = addEntity({
    element: 'a-box',
    components: {
      id: elementId,
      material: {
        color: '#FFFFFF',
        opacity: 1,
        transparent: true // use to map transparent png/gif
      },
      position: '0 0 0',
      scale: '1 1 1',
      rotation: '0 0 0'
    }
  },
    (entityParent ? entityParent['el'] : null)
  );
}

function addNewCone(elementId, entityParent) {
  if (!elementId) {
    elementId = uuid();
  }
  addEntity({
    element: 'a-cone',
    components: {
      id: elementId,
      geometry: {
        radiusTop: 0,
        radiusBottom: 0.5
      },
      material: {
        color: '#FFFFFF'
      },
      position: {
        x: 0, y: 0, z: 0
      }
    }
  },
    (entityParent ? entityParent['el'] : null)
  );
}

function addNewSphere(elementId, entityParent) {
  if (!elementId) {
    elementId = uuid();
  }
  addEntity({
    element: 'a-sphere',
    components: {
      id: elementId,
      geometry: {
        radius: 0.5
      },
      material: {
        color: '#FFFFFF'
      },
      position: {
        x: 0, y: 0, z: 0
      }
    }
  },
    (entityParent ? entityParent['el'] : null)
  );
}

function addNewCylinder(elementId, entityParent) {
  if (!elementId) {
    elementId = uuid();
  }
  addEntity({
    element: 'a-cylinder',
    components: {
      id: elementId,
      geometry: {
        'radius': 0.5
      },
      material: {
        color: '#FFFFFF'
      },
      position: { x: 0, y: 0, z: 0 }
    }
  },
    (entityParent ? entityParent['el'] : null)
  );
}

function addNewTetrahedron(elementId, entityParent) {
  if (!elementId) {
    elementId = uuid();
  }
  addEntity({
    element: 'a-tetrahedron',
    components: {
      id: elementId,
      geometry: {
        'radius': 0.5
      },
      material: {
        color: '#FFFFFF'
      },
      position: { x: 0, y: 0, z: 0 }
    }
  },
    (entityParent ? entityParent['el'] : null)
  );
}

function addNewIcosahedron(elementId, entityParent) {
  if (!elementId) {
    elementId = uuid();
  }
  addEntity({
    element: 'a-icosahedron',
    components: {
      id: elementId,
      geometry: {
        'radius': 0.5
      },
      material: {
        color: '#FFFFFF'
      },
      position: { x: 0, y: 0, z: 0 }
    }
  },
    (entityParent ? entityParent['el'] : null)
  );
}

function addNewPlane(elementId, entityParent) {
  if (!elementId) {
    elementId = uuid();
  }
  addEntity({
    element: 'a-plane',
    components: {
      id: elementId,
      material: {
        color: '#FFFFFF'
      },
      position: defaultSpawnPosition
    }
  },
    (entityParent ? entityParent['el'] : null)
  );
}

function addNewTriangle(elementId, entityParent) {
  if (!elementId) {
    elementId = uuid();
  }
  addEntity({
    element: 'a-triangle',
    components: {
      id: elementId,
      geometry: {
        vertexA: '0 0.5 0',
        vertexB: '-0.5 -0.5 0',
        vertexC: '0.5 -0.5 0'
      },
      material: {
        color: '#FFFFFF',
        opacity: 1,
        'transparent': true
      }
    }
  },
    (entityParent ? entityParent['el'] : null)
  );
}

function addNewText(elementId, entityParent) {

  if (!elementId) {
    elementId = uuid();
  }
  smalltalk.prompt('Enter new text', 'text to display', 'new text')
    .then((value) => {
      addEntity({
        element: 'a-text',
        components: {
          id: elementId,
          geometry: {
            primitive: 'plane',
            width: 'auto',
            height: 'auto',
          },
          text: {
            value: value,
            width: 10,
            align: 'center',
            side: 'double',
            wrapCount: 15,
            opacity: 1,
          },
          material: {
            color: '#FFFFFF',
            opacity: 0,
            side: 'double',
          }
        }
      },
        (entityParent ? entityParent['el'] : null)
      );
    })
}

function addNewCamera(elementId) {
  if (!elementId) {
    elementId = uuid();
  }
  const newEntity = addEntity({
    element: 'a-camera',
    components: {
      id: elementId,
      position: '0 2 5',
      rotation: '0 0 0',
      'wasd-controls': true,
      'look-controls': true
    }
  });
  newEntity.setAttribute('data-aframe-editor-original-camera', '');
  newEntity.setAttribute('data-aframe-editor', 'default-camera');
  newEntity.setAttribute('camera', 'active', 'false');
  setTimeout(() => {
    newEntity.setAttribute('camera', 'active', 'true');
    editor.EDITOR_CAMERA.el.setAttribute('camera', 'active', 'true');
    editor.currentCameraEl = newEntity;
    editor.sceneEl.resize();
  }, 0);
}

function addNewImage() {
  function clickBtn() {
    openImageDialog((filePaths) => {
      handleDialogFilesSelected(filePaths, handleUpload);             
    });
  }
  function handleUpload(filePath) {      
    const img = new Image();
    img.onload = function () {
      const {w, h} = adjustWidthAndHeightOfNewlyCreatedElement(this.width, this.height);      
      const newid = addToAsset(img);
      const newEl = editor.createNewEntity({
        element: 'a-image'
      });
      newEl.setAttribute('geometry', {
        'height': h,
        'width': w
      });
      newEl.setAttribute('src', '#' + newid);
      newEl.setAttribute('position', defaultSpawnPosition);      
    }
    img.src = filePath;
  }
  return (
    <span key="addNewImage">
      <button onClick={clickBtn}>
        Add an Image
      </button>
    </span>
  );
}
function loadImage(elementId) {
  const newEl = editor.createNewEntity({
    element: 'a-image'
  });

}
function addNewGif() {
  function clickBtn() {
    openGifDialog((filePaths) => {
      handleDialogFilesSelected(filePaths, handleUpload);
    });
  }
  function handleUpload(filePath) {
    let img = new Image();
    img.onload = function () {      
      const {w, h} = adjustWidthAndHeightOfNewlyCreatedElement(this.width, this.height);      
      const newid = addToAsset(img);
      const newEl = editor.createNewEntity({
        element: 'a-image'
      });
      newEl.setAttribute('geometry', {
        'height': h,
        'width': w
      });
      // newEl.setAttribute('src', '#'+ newid );
      newEl.setAttribute('material', 'shader:gif;src:#' + newid + '');
      newEl.setAttribute('position', defaultSpawnPosition);
    }
    img.src = filePath;
  }  
  return (
    <span key="addNewGif">      
      <button onClick={clickBtn}>
        Add a Gif
      </button>
    </span>
  );
}

function addNewVideo() {
  function clickBtn() {
    openVideoDialog((filePaths) => {
      handleDialogFilesSelected(filePaths, handleUpload);             
    });
  }
  function handleUpload(filePath) {
    const vid = document.createElement('video');
    vid.addEventListener('loadedmetadata', function () {
      const {w, h} = adjustWidthAndHeightOfNewlyCreatedElement(vid.videoWidth, vid.videoHeight);      
      // let d = vid.duration;
      // vid.playbackRate     
      const newid = addToAsset(vid);
      const newEl = editor.createNewEntity({
        element: 'a-video'
      });
      newEl.setAttribute('geometry', {
        'height': h,
        'width': w
      });
      newEl.setAttribute('src', '#' + newid);
      // handle the video playing when toogle editor
      // delete will cause error, comment out first
      // Events.on('editormodechanged', is_open => {
      //     if (is_open) {
      //         newEl.getObject3D('mesh').material.map.image.pause();
      //     } else {
      //         newEl.getObject3D('mesh').material.map.image.play();
      //     }
      // });
      // direct use the video without a-asset
      // newEl.setAttribute('src', e.target.result );
      // pause on add
      // newEl.getObject3D('mesh').material.map.image.pause();
      newEl.setAttribute('position', defaultSpawnPosition);
    });
    vid.setAttribute('src', filePath);
  }
  return (
    <span key="addNewVideo">
      <button onClick={clickBtn}>
        Add a Video
      </button>
    </span>
  );
}

function addNewVideoSphere() {
  function clickBtn() {
    let fileupload = document.getElementById('select360Video');
    fileupload.click();
  }
  function handleUpload(event) {
    const self = event.target;
    if (self.files && self.files[0]) {
      console.log("filechoose");
      var reader = new FileReader();
      reader.onload = function (e) {
        const vid = document.createElement('video');
        const newid = addToAsset(vid);
        const newEl = editor.createNewEntity({
          element: 'a-videosphere'
        });
        newEl.setAttribute('src', '#' + newid);
        // handle the video playing when toogle editor
        // delete will cause error, comment out first
        // Events.on('editormodechanged', is_open => {
        //     if (is_open) {
        //         newEl.getObject3D('mesh').material.map.image.pause();
        //     } else {
        //         newEl.getObject3D('mesh').material.map.image.play();
        //     }
        // });
        // direct use the video without a-asset
        // newEl.setAttribute('src', e.target.result );
        // pause on add
        // newEl.getObject3D('mesh').material.map.image.pause();
        newEl.setAttribute('position', { x: 0, y: 0, z: 0 });
        // after the file loaded, clear the input
        self.value = '';
        vid.setAttribute('src', e.target.result);
      };
      reader.readAsDataURL(self.files[0]);
    } else {
      console.log('no file choosed');
    }
  }
  return <span key="addNewVideoSphere">
    <input id="select360Video" type="file" onChange={handleUpload} hidden />
    <button onClick={clickBtn}>
      Add a 360 Background Video
      </button>
  </span>;
}

function setControlMode(mode) {
  Events.emit('transformmodechanged', mode);
}

function takeSnapshot() {
  function snapshot() {
    Events.emit('takeSnapshot', function (data) {
      // let list = document.getElementById('entitiesList');
      // let snapshotwrapper = document.createElement('div');
      // let imgEl = document.createElement('img');
      // imgEl.style.width = '100%';
      // imgEl.src = data.image;
      // snapshotwrapper.append(imgEl);
      // snapshotwrapper.append('<div>position</div>');
      // snapshotwrapper.append('<div>'+
      //   'x: '+ data.camera.position.x +
      //   ',y: '+ data.camera.position.y +
      //   ',z: '+ data.camera.position.z +
      // '</div>');
      // snapshotwrapper.append('<div>rotation</div>');
      // snapshotwrapper.append('<div>'+
      //   'x: '+ data.camera.rotation.x +
      //   ',y: '+ data.camera.rotation.y +
      //   ',z: '+ data.camera.rotation.z +
      // '</div>');
      // list.append(snapshotwrapper);
    });
  }
  return (
    <button key="snapshot" onClick={snapshot}>
      Snapshot
    </button>
  );
}

// pass entity options to create a new entity
export { addEntity, addEntityAutoType }
// some predefined entities type
export { addNewBox, addNewSphere, addNewCone, addNewCylinder, addNewIcosahedron, addNewTetrahedron }
export { addNewText, addNewPlane, addNewTriangle, addNewImage, addNewGif, addNewVideo }
export { addNewVideoSphere }
export { takeSnapshot }
export { setControlMode }
