import APlane from "./aPlane";

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
    this._fixedAttributes = {
      ...this.fixedAttributes,
      text: {
        align: 'center',
        side: 'double'
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