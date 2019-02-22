class Box {
  constructor(options){
    this.animatableAttributes = {
      'material': [
        'color', 'opacity'
      ],
      'position': ['x', 'y', 'z'],
      'rotation': ['x', 'y', 'z'],
      'scale':    ['x', 'y', 'z'],
      'src':      'src'
    }
    this.staticAttributes = {}
    // this.
  }
  set material(data) {
    this.animatableAttributes
  }
  get material(data) {
    
  }
  undo() {

  }
}
export default Box;