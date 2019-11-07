import AEntity from "./aEntity";

class APlane extends AEntity {
  constructor(el) {
    super(el);
    this._messageId = 'SceneObjects.Plane.DefaultName';
    this._type = 'a-plane';
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
      },
      // {
      //   type: 'text',
      //   name: 'Text',
      //   attributeKey: 'text',
      //   attributeField: 'value'
      // }
    ]
    this._fixedAttributes = {
      geometry: {
        primitive: 'plane'
      },
      material: {
        transparent: true
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
export default APlane;