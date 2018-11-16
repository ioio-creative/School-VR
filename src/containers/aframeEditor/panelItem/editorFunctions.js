import React from 'react';
import AFRAME from 'aframe';
import 'aframe-gif-shader';
const Events = require('vendor/Events.js');
const uuid = require('uuid/v1');

let editor = null;
Events.on('editor-load', obj => {
    editor = obj;
});
function addToAsset(el) {
    let assetEl = document.querySelector('a-asset');
    if (!assetEl) {
        assetEl = document.createElement('a-asset');
        editor.sceneEl.append(assetEl);
    }
    assetEl.append(el);
    let newid;
    switch (el.tagName) {
        case 'VIDEO':
            newid = uuid() // 'vid_' + document.querySelectorAll('video').length;
            el.loop = true;
            break;
        case 'IMG':
            newid = uuid() // 'img_' + document.querySelectorAll('img').length;
            break;
        default:
            console.log('editorFunctions_addToAsset: ???');
    }
    el.setAttribute('id', newid);
    return newid;
}
// this function may use later to combine the handleUpload functions
function getFileType(base64file) {
    // console.log(base64file);
    let fileinfo = base64file.split(/[:;\/]/);
    let filetype = fileinfo[1];
    let fileext = fileinfo[2];
    return fileext;
}
function addNewBox(renderBtn = true) {
  function clickBtn() {
    // let x = prompt('width',1);
    // let y = prompt('height',1);
    // let z = prompt('depth',1);
    const id = uuid();
    var newEl = editor.createNewEntity({
      element: 'a-box',
      components: {
        'id': id,
        // 'geometry': {
        //     'primitive': 'box',
        //     'width': 1, // x,
        //     'height': 1, // y,
        //     'depth': 1, // z,
        // },
        'material': {
          'color': '#FFFFFF',
          opacity: 0.1,
          transparent: true
        },
        'rotation': {
          x: 0, y: 45, z: 0
        }
      }
    });
    // newEl.setAttribute('geometry',{
    //     // 'primitive': 'box',
    //     'width': 1, // x,
    //     'height': 1, // y,
    //     'depth': 1, // z,
    // });
    // newEl.setAttribute('material', {'color': '#FFFF00'});
    // newEl.setAttribute('position', {x:0, y:0, z:0});
  }  
  if (renderBtn) {
    return <button key="addNewBox" onClick={clickBtn}>
        Add a Box
    </button>;      
  } else {
    return clickBtn();
  }
}
function addNewCone() {
    function clickBtn() {
        var newEl = editor.createNewEntity({
            element: 'a-cone'
          });
          newEl.setAttribute('geometry',{
            // 'primitive': 'cone'
            'radiusTop': 0,
            // 'radiusBottom': 0.2,
            'radius': 0.5
          });
          newEl.setAttribute('material', 'color', '#FFFFFF');
          newEl.setAttribute('position', {x:0, y:1, z:0});
    }
    return <button key="addNewCone" onClick={clickBtn}>
        Add a Cone
    </button>;
}
function addNewCylinder() {
    function clickBtn() {
        var newEl = editor.createNewEntity({
            element: 'a-cylinder'
          });
          newEl.setAttribute('geometry',{
            // 'primitive': 'cylinder',
            'radius': 0.5
          });
          newEl.setAttribute('material', 'color', '#FFFFFF');
          newEl.setAttribute('position', {x:0, y:1, z:0});
    }
    return <button key="addNewCylinder" onClick={clickBtn}>
        Add a Cylinder
    </button>;
}
function addNewPlane() {
    function clickBtn() {
        var newEl = editor.createNewEntity({
            element: 'a-plane'
          });
          // newEl.setAttribute('geometry',{
          //   'primitive': 'torusKnot',
          //   'p': 3,
          //   'q': 7
          // });
          newEl.setAttribute('material', 'color', '#FFFFFF');
          newEl.setAttribute('position', {x:0, y:1, z:0});
    }
    return <button key="addNewPlane" onClick={clickBtn}>
        Add a Plane
    </button>;
}
function addNewTriangle() {
    function clickBtn() {
        var newEl = editor.createNewEntity({
            element: 'a-triangle'
          });
          newEl.setAttribute('geometry',{
            'primitive': 'triangle',
          });
          newEl.setAttribute('material', {
            'color': '#FFFFFF',
            'opacity': 0.3,
            'transparent': true
          });
          newEl.setAttribute('position', {x:0, y:1, z:0});
    }
    return <button key="addNewTriangle" onClick={clickBtn}>
        Add a Triangle
    </button>;
}
function addNewImage() {
    function clickBtn() {
        let fileupload = document.getElementById('selectImage');
        fileupload.click();
    }
    function handleUpload(event) {
        var self = event.target;
		if (self.files && self.files[0]) {
            var reader = new FileReader();
            reader.onload = function (e) {
                let img = new Image();
                img.onload = function(){
                    let w = this.width;
                    let h = this.height;
                    if (w>h) {
                        w = w/h;
                        h = 1;
                    } else {
                        h = h/w;
                        w = 1;
                    }
                    let newid = addToAsset(img);

                    var newEl = editor.createNewEntity({
                        element: 'a-image'
                    });
                    newEl.setAttribute('geometry',{
                        'height': h,
                        'width': w
                    });
                    newEl.setAttribute('src', '#'+ newid );
                    newEl.setAttribute('position', {x:0, y:1, z:0});
                    // after the file loaded, clear the input
                    self.value = '';
                }
                img.src = e.target.result;
            };
            reader.readAsDataURL(self.files[0]);
		}
    }
    return <span key="addNewImage">
        <input id="selectImage" type="file" onChange={handleUpload} hidden/>
        <button onClick={clickBtn}>
            Add an Image
        </button>
    </span>;
}
function addNewGif() {
    function clickBtn() {
        let fileupload = document.getElementById('selectGif');
        fileupload.click();
    }
    function handleUpload(event) {
        var self = event.target;
		if (self.files && self.files[0]) {
            var reader = new FileReader();
            reader.onload = function (e) {
                let img = new Image();
                img.onload = function(){
                    let w = this.width;
                    let h = this.height;
                    if (w>h) {
                        w = w/h;
                        h = 1;
                    } else {
                        h = h/w;
                        w = 1;
                    }
                    let newid = addToAsset(img);
                    var newEl = editor.createNewEntity({
                        element: 'a-image'
                    });
                    newEl.setAttribute('geometry',{
                        'height': h,
                        'width': w
                    });
                    // newEl.setAttribute('src', '#'+ newid );
                    newEl.setAttribute('material','shader:gif;src:#'+ newid +'');
                    newEl.setAttribute('position', {x:0, y:1, z:0});
                    // after the file loaded, clear the input
                    self.value = '';
                }
                img.src = e.target.result;
            };
            reader.readAsDataURL(self.files[0]);
		}
    }
    return <span key="addNewGif">
        <input id="selectGif" type="file" onChange={handleUpload} hidden/>
        <button onClick={clickBtn}>
            Add a Gif
        </button>
    </span>;
}
function addNewVideo() {
    function clickBtn() {
        let fileupload = document.getElementById('selectVideo');
        fileupload.click();
    }
    function handleUpload(event) {
        var self = event.target;
		if (self.files && self.files[0]) {
            var reader = new FileReader();
            reader.onload = function (e) {
                let vid = document.createElement('video');
                vid.addEventListener('loadedmetadata', function(){
                    let w = vid.videoWidth;
                    let h = vid.videoHeight;
                    // let d = vid.duration;
                    // vid.playbackRate
                    if (w>h) {
                        w = w/h;
                        h = 1;
                    } else {
                        h = h/w;
                        w = 1;
                    }
                    let newid = addToAsset(vid);
                    var newEl = editor.createNewEntity({
                        element: 'a-video'
                    });
                    newEl.setAttribute('geometry',{
                        'height': h,
                        'width': w
                    });
                    newEl.setAttribute('src', '#'+ newid );
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
                    newEl.setAttribute('position', {x:0, y:1, z:0});
                    // after the file loaded, clear the input
                    self.value = '';
                });
                vid.setAttribute('src', e.target.result);
            };
            reader.readAsDataURL(self.files[0]);
		}
    }
    return <span key="addNewVideo">
        <input id="selectVideo" type="file" onChange={handleUpload} hidden/>
        <button onClick={clickBtn}>
            Add a Video
        </button>
    </span>;
}
function addNewText() {
    function clickBtn() {
        let text = prompt('Please enter the text to add','type text here');
        if (text) {
          let textSize = 10;
          let width = text.length;
          let textCount = text.length;
          let wrapCount = text.length;
          var newEl = editor.createNewEntity({
            element: 'a-text'
          });
        //   newEl.setAttribute('value',text);
        //   newEl.setAttribute('width', textSize);
        //   newEl.setAttribute('align','center');
        //   newEl.setAttribute('side','double');
        //   newEl.setAttribute('wrap-count', wrapCount );
        newEl.setAttribute('text', {
          'value': text,
          'width': width,
          'align':'center',
          'color': '#FFFF00',
          // 'side':'double',
          'side':'front',
          'wrapCount': wrapCount
        });
        newEl.setAttribute('position', {x:0, y:1, z:0});
        // add a transparent plane to make sit selectable
        // newEl.setAttribute('geometry', 'primitive: plane; height: auto; width: auto;');
        newEl.setAttribute('geometry', {
            primitive: 'plane',  
            height: 1.4 * width / textCount,
            width: width
        });
        newEl.setAttribute('material', {
          'color': '#FF0000',
          'transparent': true,
          'opacity': 0.3
        });
      }
    }
    return <button key="addNewText" onClick={clickBtn}>
        Add a Text
    </button>;
}
function addNewVideoSphere() {
    function clickBtn() {
        let fileupload = document.getElementById('select360Video');
        fileupload.click();
    }
    function handleUpload(event) {
        var self = event.target;
		if (self.files && self.files[0]) {
            console.log("filechoose");
            var reader = new FileReader();
            reader.onload = function (e) {
                let vid = document.createElement('video');
                let newid = addToAsset(vid);
                var newEl = editor.createNewEntity({
                    element: 'a-videosphere'
                });
                newEl.setAttribute('src', '#'+ newid );
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
                newEl.setAttribute('position', {x:0, y:0, z:0});
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
        <input id="select360Video" type="file" onChange={handleUpload} hidden/>
        <button onClick={clickBtn}>
            Add a 360 Background Video
        </button>
    </span>;
}


function setControlMode() {
    function setRotate() {
        Events.emit('transformmodechanged','rotate');
    }
    function setTranslate() {
        Events.emit('transformmodechanged','translate');
    }
    function setScale() {
        Events.emit('transformmodechanged','scale');
    }
    // function setSpace() {
    //     Events.emit('transformmodechanged','scale');
    // }
    return <span key="control-type">
        <button onClick={setTranslate}>
            Translate
        </button>
        <button onClick={setRotate}>
            Rotate
        </button>
        <button onClick={setScale}>
            Scale
        </button>
    </span>;
}
function takeSnapshot() {
  function snapshot() {
    Events.emit('takeSnapshot',function(data){
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
  return <button key="snapshot" onClick={snapshot}>
          Snapshot
      </button>;
}

export {addNewBox, addNewCone, addNewCylinder, addNewPlane}
export {addNewText, addNewTriangle, addNewImage, addNewGif, addNewVideo}
export {addNewVideoSphere}
export {takeSnapshot}
export {setControlMode}