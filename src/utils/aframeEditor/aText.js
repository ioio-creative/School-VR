import AEntity from "./aEntity";
// import APlane from "./aPlane";
// import fontSchoolbellRegular from 'fonts/Schoolbell/SchoolbellRegular.fnt';
// import fontSchoolbellRegularImg from 'fonts/Schoolbell/SchoolbellRegular.png';
// import TypeFace from 'fonts/typeface-0.10.js';
// if (TypeFace) {
//   console.log(TypeFace);
//   const ns = require('fonts/Noto_Serif_TC/Noto_Serif_TC_Regular.json');
//   TypeFace.loadFace(ns);
// }
// const opentype = require('opentype.js');
// const typefaceNotoSansTc = require('typeface-noto-sans-tc');
class AText extends AEntity {
  constructor(el) {
    super(el);
    this._animatableAttributes = {
      position: ['x', 'y', 'z'],
      scale: ['x', 'y', 'z'],
      rotation: ['x', 'y', 'z'],
      // text: [
      ttfFont: [
        'color',
        'opacity',
        // 'fontSize'
      ]
    };
    this._staticAttributes = [
      {
        type: 'text',
        name: 'Text',
        attributeKey: 'ttfFont',
        attributeField: 'value'
      },
      {
        type: 'number',
        name: 'Font Size',
        attributeKey: 'ttfFont',
        attributeField: 'fontSize'
      },
      // {
      //   type: 'text',
      //   name: 'Width',
      //   attributeKey: 'text',
      //   attributeField: 'value'
      // },
      // text: [
      //   // 'align',
      //   // 'anchor',
      //   // 'baseline',
      //   'color',
      //   'font',
      //   // 'fontImage',
      //   'height',
      //   'letterSpacing',
      //   // 'lineHeight',
      //   'opacity',
      //   // 'shader',
      //   'side',
      //   // 'tabSize',
      //   // 'transparent',
      //   'value',
      //   // 'whiteSpace',
      //   'width',
      //   'wrapCount',
      //   // 'wrapPixels',
      //   // 'zOffset'
      // ]
    ]
    // console.log(fontSchoolbellRegular);
    this._fixedAttributes = {
      // ...this.fixedAttributes,
      // text: {
      //   align: 'center',
      //   side: 'double',
      //   // font: 'Noto Sans TC'
      //   // font: fontSchoolbellRegular,
      //   // fontImage: fontSchoolbellRegularImg
      // },
      // 'ttf-font': ''
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
      ttfFont: {
      // text: {
        color: '#000000',
        opacity: 1,
        // fontSize: 1
      }
    }
  }
}
export default AText;