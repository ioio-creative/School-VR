import { jsonCopy } from "globals/helperfunctions";

class AEntity {
  constructor(el) {
    this._type = 'a-entity';
    this._staticAttributesValues = {};
    this._animatableAttributesValues = {};
    this._staticAttributes = {};
    this._animatableAttributes = {};
    this._fixedAttributes = {};
    this._fixedAttributesValues = {};
    this._el = el;
    this.updateEntityAttributes = this.updateEntityAttributes.bind(this);
  }
  get type() {
    return this._type;
  }
  get staticAttributes() {
    return this._staticAttributes;
  }
  get animatableAttributes() {
    return this._animatableAttributes;
  }
  get fixedAttributes() {
    return this._fixedAttributes;
  }
  setStaticAttributesValues(keyOrObj, val) {
    if (typeof(keyOrObj) === 'object') {
      for (let key in keyOrObj) {
        if (this._staticAttributes.hasOwnProperty(key)) {
          this._staticAttributesValues[key] = jsonCopy(keyOrObj[key]);
        }
      }
    } else if (typeof(keyOrObj) === 'string') {
      if (this._staticAttributes.hasOwnProperty(keyOrObj)) {
        this._staticAttributesValues[keyOrObj] = jsonCopy(val);
      }
    }
    return this._staticAttributesValues;
  }
  setAnimatableAttributesValues(keyOrObj, val) {
    if (typeof(keyOrObj) === 'object') {
      for (let key in keyOrObj) {
        if (this._animatableAttributes.hasOwnProperty(key)) {
          this._animatableAttributesValues[key] = jsonCopy(keyOrObj[key]);
        }
      }
    } else if (typeof(keyOrObj) === 'string') {
      if (this._animatableAttributes.hasOwnProperty(keyOrObj)) {
        this._animatableAttributesValues[keyOrObj] = jsonCopy(val);
      }
    }
    return this._animatableAttributesValues;
  }
  getAnimatableAttributesValues() {
    return this._animatableAttributesValues;
  }
  get animatableAttributesValues() {
    return this._animatableAttributesValues;
  }

  get children() {
    return this._children;
  }
  setEl(el) {
    this._el = el;
  }

  updateEntityAttributes(attrs) {
    if (typeof(attrs) !== 'object') return;
    // console.log(attrs);
    for (let key in attrs) {
      if (this.animatableAttributes.hasOwnProperty(key)) {
        // if (typeof(attrs[key]) === 'object') {
        //   const subAttrs = attrs[key];
        //   const subAttrKeys = Object.keys(subAttrs);
        //   let valueString = '';
        //   subAttrKeys.forEach( subKey => {
        //     valueString += `${subKey}:${subAttrs[subKey]};`;
        //   })
        //   this._el.setAttribute(key, valueString);
        // } else {
          this._el.setAttribute(key, attrs[key]);
        // }
      } else {
        const staticAttribute = this.staticAttributes.find(attr => attr.attributeKey === key);
        if (staticAttribute) {
          // if (typeof(attrs[key]) === 'object') {
          //   const subAttrs = attrs[key];
          //   const subAttrKeys = Object.keys(subAttrs);
          //   let valueString = '';
          //   subAttrKeys.forEach( subKey => {
          //     valueString += `${subKey}:${subAttrs[subKey]};`;
          //   })
          //   this._el.setAttribute(key, valueString);
          // } else {
            this._el.setAttribute(key, attrs[key]);
          // }
        }
      }
    }


  }
}
export default AEntity;