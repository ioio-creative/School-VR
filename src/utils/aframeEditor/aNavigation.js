import AEntity from "./aEntity";
import ACylinder from "./aCylinder";
import ACone from "./aCone";

const uuid_v1 = require('uuid/v1');
const uuid = _=> 'uuid_' + uuid_v1().split('-')[0];

class ANavigation extends AEntity {
  constructor(el) {
    super(el);
    this._type = 'a-navigation';
    this._animatableAttributes = {
      position: ['x', 'y', 'z'],
      rotation: ['x', 'y', 'z'],
      material: [
        'color',
        'opacity'
      ]
    }
    this._staticAttributes = [
      {
        type: 'slidesList',
        name: 'Navigate To Slide',
        attributeKey: 'navigateToSlideId',
        attributeField: ''
      }
    ]
    this._fixedAttributes = {
      // geometry: {
      //   primitive: ''
      // },
      'cursor-listener': ''
    }
    const cylinder = new ACylinder();
    // cylinder.animatableAttributesValues.rotation.x = 180;
    cylinder.animatableAttributesValues.position.y = 0.75;
    cylinder.animatableAttributesValues.scale.x = 0.1;
    cylinder.animatableAttributesValues.scale.y = 0.5;
    cylinder.animatableAttributesValues.scale.z = 0.1;
    const cone = new ACone();
    cone.animatableAttributesValues.rotation.x = 180;
    cone.animatableAttributesValues.position.y = 0.25;
    cone.animatableAttributesValues.scale.x = 0.25;
    cone.animatableAttributesValues.scale.y = 0.5;
    cone.animatableAttributesValues.scale.z = 0.25;
    this._children = [
      cylinder,
      cone
    ];
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
  setEl(el) {
    super.setEl(el);
    const childrenEls = Array.prototype.slice.call(el.children);
    if (childrenEls.length === 0) {
      this._children.forEach(child => {
        // const childElementId = uuid();
        // const newChildElement = {
        //   type: type,
        //   id: childElementId,
        //   name: type.split('-')[1],
        //   element: 'a-entity',
        //   timelines: []
        // };
        const newChildElementAttributes = {
          id: uuid(),
          ...child.animatableAttributesValues,
          ...child.fixedAttributes
        }
        const newChildEl = document.createElement('a-entity');
        Object.keys(newChildElementAttributes).forEach(key => {
          newChildEl.setAttribute(key, newChildElementAttributes[key])
        })
        el.append(newChildEl);
        // this.editor.createNewEntity(newChildElement, newElement);
      })
    }
  }
  updateEntityAttributes(attrs) {
    if (typeof(attrs) !== 'object') return;
    const self = this;
    for (let key in attrs) {
      if (self._animatableAttributes.hasOwnProperty(key)) {
        // if (typeof(attrs[key]) === 'object') {
        //   const subAttrs = attrs[key];
        //   const subAttrKeys = Object.keys(subAttrs);
        //   let valueString = '';
        //   subAttrKeys.forEach( subKey => {
        //     valueString += `${subKey}:${subAttrs[subKey]};`;
        //   })
        //   self._el.setAttribute(key, valueString);
        //   if (key === 'material') {
        //     const childrenEls = Array.prototype.slice.call(self._el.children);
        //     childrenEls.forEach(childEl => {
        //       childEl.setAttribute(key, valueString);
        //     })
        //   }
        // // } else if (typeof(keyOrObj[key]) === 'string') {
        // } else {
          self._el.setAttribute(key, attrs[key]);
          if (key === 'material') {
            const childrenEls = Array.prototype.slice.call(self._el.children);
            childrenEls.forEach(childEl => {
              childEl.setAttribute(key, attrs[key]);
            })
          }
        // }
      } else {
        const staticAttribute = self.staticAttributes.find(attr => attr.attributeKey === key);
        if (staticAttribute) {
          // if (typeof(attrs[key]) === 'object') {
          //   const subAttrs = attrs[key];
          //   const subAttrKeys = Object.keys(subAttrs);
          //   let valueString = '';
          //   subAttrKeys.forEach( subKey => {
          //     valueString += `${subKey}:${subAttrs[subKey]};`;
          //   })
          //   self._el.setAttribute(key, valueString);
          // } else {
            self._el.setAttribute(key, attrs[key]);
          // }
        }
      }
      
    }


  }
}
export default ANavigation;