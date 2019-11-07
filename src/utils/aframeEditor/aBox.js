import AEntity from "./aEntity";

class ABox extends AEntity {
  constructor(el) {
    super(el);
    this._messageId = 'SceneObjects.Box.DefaultName';
    this._type = 'a-box';
    this._animatableAttributes = {
      position: ['x', 'y', 'z'],
      scale: ['x', 'y', 'z'],
      rotation: ['x', 'y', 'z'],
      material: [
        'color',
        'opacity'
      ]
    }
    this._staticAttributes = [
      {
        type: 'image',
        name: 'Texture',
        attributeKey: 'material',
        attributeField: 'src'
      }
    ]
    this._fixedAttributes = {
      geometry: {
        primitive: 'box'
      }
    }
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
      material: {
        color: '#FFFFFF',
        opacity: 1
      }
    }
  }
}

export default ABox;