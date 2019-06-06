import APlane from "./aPlane";
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
class AText extends APlane {
  constructor(el) {
    super(el);
    this._animatableAttributes = {
      ...this.animatableAttributes,
      text: [
        'color',
        'opacity'
      ]
    };
    this._staticAttributes = [
      {
        type: 'text',
        name: 'Text',
        attributeKey: 'text',
        attributeField: 'value'
      },
      {
        type: 'text',
        name: 'Wrap Count',
        attributeKey: 'text',
        attributeField: 'wrapCount'
      },
      {
        type: 'text',
        name: 'Width',
        attributeKey: 'text',
        attributeField: 'width'
      },
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
      ...this.fixedAttributes,
      text: {
        align: 'center',
        side: 'double',
        // font: 'Noto Sans TC'
        // font: fontSchoolbellRegular,
        // fontImage: fontSchoolbellRegularImg
      }
    }
    this._animatableAttributesValues = {
      ...this.animatableAttributesValues,
      material: {
        color: '#FFFFFF',
        opacity: 0
      },
      text: {
        color: '#000000',
        opacity: 1
      }
    }
  }
}
export default AText;