import AEntity from "./aEntity";

var Events = require('vendor/Events.js');

class ACamera extends AEntity {
  constructor(el) {
    super(el);
    this._type = 'a-camera';
    this._animatableAttributes = {
      position: ['x', 'y', 'z'],
      // rotation: ['x', 'y', 'z'],
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
        y: 0,
        z: 0
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
    this.renderCameraPreview = this.renderCameraPreview.bind(this);

    Events.on('refreshsidebarobject3d', this.renderCameraPreview);
  }
  setEditorInstance(editorInstance) {
    this.editor = editorInstance;
  }
  setCameraPreviewEl(canvasEl) {
    this.cameraPreviewEl = canvasEl || this.cameraPreviewEl ;
  }
  updateEntityAttributes(attrs) {
    if (typeof(attrs) !== 'object') return;
    // console.log(attrs);
    const self = this;
    for (let key in attrs) {
      if (self.animatableAttributes.hasOwnProperty(key)) {
        self._el.parentElement.setAttribute(key, attrs[key]);
      } else {
        const staticAttribute = self.staticAttributes.find(attr => attr.attributeKey === key);
        if (staticAttribute) {
          self._el.parentElement.setAttribute(key, attrs[key]);
        }
      }
    }
  }
  renderCameraPreview() {
    if (this.cameraPreviewEl) {

      const editor = this.editor;
      if (!editor) return this.unmount();
      const renderer = editor.sceneEl.renderer;
      const scene = editor.sceneEl.object3D;
      const camera = editor.currentCameraEl.getObject3D('camera');
      if (!camera) return this.unmount();
      const newWidth = this.cameraPreviewEl.parentElement.offsetWidth;
      const width = renderer.domElement.width;
      const height = renderer.domElement.height;
      const newHeight = newWidth / width * height;
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
      
      canvas.width = newWidth;
      canvas.height = newHeight;
      // if (camera.aspect > 1) {
      //   this.cameraPreviewScreenEl.setAttribute( 'width', canvas.width / 270 * 0.6 );
      //   this.cameraPreviewScreenEl.setAttribute( 'height', canvas.height / 270 * 0.6 );
      // } else {
      //   this.cameraPreviewScreenEl.setAttribute( 'width', canvas.width / newHeight * 0.6 );
      //   this.cameraPreviewScreenEl.setAttribute( 'height', canvas.height / newHeight * 0.6 );
      // }
      ctx.drawImage(renderer.domElement, 0, 0, canvas.width, canvas.height);
      const editorCamera = editor.editorCameraEl.getObject3D('camera');
      renderer.render(scene, editorCamera);
    } else {
      // assume unmounted
    }
  }
  unmount() {
    Events.removeListener('refreshsidebarobject3d', this.renderCameraPreview);
    return false;
  }
}
export default ACamera;