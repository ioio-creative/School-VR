import AEntity from "./aEntity";

var Events = require('vendor/Events.js');

class ACamera extends AEntity {
  constructor(el) {
    super(el);
    this._type = 'a-camera';
    this._animatableAttributes = {
      position: ['x', 'y', 'z'],
      rotation: ['x', 'y', 'z'],
      cameraPreview: true
    }
    this._staticAttributes = [
      // {
      //   type: 'image',
      //   name: 'Texture',
      //   attributeKey: 'material',
      //   attributeField: 'src'
      // }
    ]
    this._fixedAttributes = {}
    this._animatableAttributesValues = {
      position: {
        x: 0,
        y: 2,
        z: 5
      },
      scale: {
        x: 1, 
        y: 1, 
        z: 1
      },
      rotation: {
        x: 0,
        y: 0,
        z: 0
      },
    }
    // Events.emit('getEditorInstance', obj => {
    //   this.editor = obj;
    // });
    // Events.on('refreshsidebarobject3d', _=> {
    //   // this.renderCameraPreview();
    // })
  }
  setEditorInstance(editorInstance) {
    // this.editor = editorInstance;
  }
  setCameraPreviewEl(canvasEl) {
    this.cameraPreviewEl = this.cameraPreviewEl || canvasEl;
  }
  renderCameraPreview() {
    if (this.cameraPreviewEl) {

      const editor = this.editor;
      const renderer = editor.sceneEl.renderer;
      const scene = editor.sceneEl.object3D;
      const camera = editor.currentCameraEl.getObject3D('camera');
  
      const width = renderer.domElement.width;
      const height = renderer.domElement.height;
      const newHeight = 270 / width * height;
      const canvas = this.cameraPreviewEl;
      const ctx = canvas.getContext('2d');
  
      const helper_status = [];
      for (let i = 0; i < editor.sceneHelpers.children.length; i++){
        helper_status[i] = editor.sceneHelpers.children[i].visible;
        editor.sceneHelpers.children[i].visible = false;
      }
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.render(scene, camera);
      for (let i = 0; i < editor.sceneHelpers.children.length; i++){
        editor.sceneHelpers.children[i].visible = helper_status[i];
      }
      
      canvas.width = 270;
      canvas.height = newHeight;
      // if (camera.aspect > 1) {
      //   this.cameraPreviewScreenEl.setAttribute( 'width', canvas.width / 270 * 0.6 );
      //   this.cameraPreviewScreenEl.setAttribute( 'height', canvas.height / 270 * 0.6 );
      // } else {
      //   this.cameraPreviewScreenEl.setAttribute( 'width', canvas.width / newHeight * 0.6 );
      //   this.cameraPreviewScreenEl.setAttribute( 'height', canvas.height / newHeight * 0.6 );
      // }
      ctx.drawImage(renderer.domElement, 0, 0, canvas.width, canvas.height);
    }
  }
}
export default ACamera;