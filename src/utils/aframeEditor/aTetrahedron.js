import AEntity from "./aEntity";

class ATetrahedron extends AEntity {
  constructor(el) {
    super(el);
    this._messageId = 'SceneObjects.Tetrahedron.DefaultName';
    this._type = 'a-tetrahedron';
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
        primitive: 'tetrahedron'
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
export default ATetrahedron;