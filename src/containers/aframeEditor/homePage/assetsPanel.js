import React, {Component} from 'react';

import './assetsPanel.css';

const Events = require('vendor/Events.js');

function handleUpload(event, callback) {
  var self = event.target;
  if (self.files && self.files[0]) {
    var reader = new FileReader();
    reader.onload = function (e) {
      const img = new Image();
      imageResize(img, undefined, undefined, callback);
      img.src = e.target.result;
    };
    reader.readAsDataURL(self.files[0]);
    self.value = '';
  }
}
// if have time, this one seems funny
// http://www.html5rocks.com/en/tutorials/canvas/imagefilters/
// current method
// https://stackoverflow.com/questions/19262141/resize-image-with-javascript-canvas-smoothly
function imageResize(img, width, height, callback) {
  img.onload = function() {
    if (width === undefined && height === undefined) {
      // make a nearest power of 2
      let finalWidth = 2;
      let i = 0;
      while (finalWidth << i < img.width) {
        i++;
      }
      if (img.width - finalWidth << (i - 1) <
        finalWidth << i - img.width
      ) {
        i--;
      }
      width = height = finalWidth << i;
      // height = width / img.width * img.height;
    } else if (width === undefined) {
      width = height / img.height * img.width;
    } else if (height === undefined) {
      height = width / img.width * img.height;
    }
    const canvas = document.createElement('canvas'),
      ctx = canvas.getContext("2d"),
      oc = document.createElement('canvas'),
      octx = oc.getContext('2d');
    canvas.width = width;
    canvas.height = height;
    const cur = {
      width: img.width,
      height: img.height
    }
    oc.width = cur.width;
    oc.height = cur.height;
    octx.drawImage(img, 0, 0, cur.width, cur.height);
    while (cur.width * 0.5 > width) {
      cur.width = Math.floor(cur.width * 0.5);
      cur.height = Math.floor(cur.height * 0.5);
      octx.drawImage(oc, 0, 0, cur.width * 2, cur.height * 2, 0, 0, cur.width, cur.height);
    }
    ctx.drawImage(oc, 0, 0, cur.width, cur.height, 0, 0, canvas.width, canvas.height);
    callback({
      src: canvas.toDataURL(),
      width: canvas.width,
      height: canvas.height
    });
  }
}

class AssetsPanel extends Component {
  constructor(props) {
    super(props);
    this.addAsset = this.addAsset.bind(this);
    this.state = {
      assetsList: []
    }
  }
  componentDidMount() {
  }
  componentWillUnmount() {
  }
  addAsset(img) {
    this.setState({
      assetsList: [...this.state.assetsList, img]
    });
  }
  render() {
    const props = this.props;
    const self = this;
    return (
      <div id="assets-panel">
        <div className="panel-background" />
        <div className="panel">
          <div className="panel-header">Assets - Image
            <div className="close-btn"></div>
          </div>
          <div className="panel-body">
            <div className="assets-buttons">
              <button id="add-assets" onClick={_=>this.fileUpload.click()}>Add</button>
              <input type="file" 
                ref={ref=>this.fileUpload = ref} 
                onChange={event=>handleUpload(event, self.addAsset)} 
                hidden
              />
            </div>
            <div className="assets-list">
              {this.state.assetsList.map((asset, idx) => {
                return (
                  <div className="asset-item" key={idx}>
                    <div className="asset-image">
                      <img src={asset.src} alt=""/>
                    </div>
                    <div className="asset-info">
                      <div className="asset-size">{asset.width + ' x ' + asset.height}</div>
                      <div className="asset-name">{asset.width + ' x ' + asset.height}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }
}
export default AssetsPanel;