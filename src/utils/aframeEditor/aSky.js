import AEntity from "./aEntity";

class ASky extends AEntity {
  constructor(defaultAttributes) {
    super(defaultAttributes);
    this._type = 'a-sky';
    this._animatableAttributes = {
      // position: ['x', 'y', 'z'],
      // scale: ['x', 'y', 'z'],
      rotation: ['x', 'y', 'z'],
      material: [
        'color',
        'opacity'
      ],
      // geometry: [
      //   'radius'
      // ]
    }
    this._staticAttributes = [
      {
        type: 'image',
        name: 'Image360',
        attributeKey: 'material',
        attributeField: 'src'
      },
      {
        type: 'video',
        name: 'Video360',
        attributeKey: 'material',
        attributeField: 'src'
      }
    ]
    this._fixedAttributes = {
      geometry: {
        primitive: 'sphere',
        radius: 5000
      },
      material: {
        side: 'back'
      },
      scale: {
        x: -1,
        y: 1,
        z: 1
      }
    }
    this._animatableAttributesValues = {
      
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
export default ASky;
