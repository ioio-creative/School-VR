import React, {Component} from 'react';

import './aFramePanel.css';

const Events = require('vendor/Events.js');

class AFramePanel extends Component {
  constructor(props) {
    super(props);
    this.Editor = this.props.editor;
  }
  componentDidMount() {
  }
  componentWillUnmount() {
  }
  render() {
    return (
    	<div id="aframe-panel">
	    	<a-scene embedded background="color:#6EBAA7" el-name="Background">
          {/* <a-sky el-name="sky" el-isSystem={true} color="#6EBAA7"></a-sky> */}
          <a-camera position="0 2 5" el-name="Camera" el-isSystem={false} wasd-controls look-controls></a-camera>
          <a-light type="ambient" intensity="0.8" el-name="environment light" el-isSystem={true} color="#EEEEEE"></a-light>
          <a-light position="600 300 900" color="#FFFFFF" intensity="0.9" type="directional" el-name="directional light" el-isSystem={true}></a-light>
          {/* <a-light position="-4 5 5" color="#FFFF00" intensity="0.5" type="spot" el-name="spot light" el-isSystem={true}></a-light> */}
          {/* <a-light position="4 5 5" color="#00FF00" groundColor="#00FFFF" intensity="0.5" type="hemisphere" el-name="hemisphere light" el-isSystem={true}></a-light> */}
          {/* <a-light position="12 5 5" color="#0000FF" intensity="0.5" type="point" el-name="point light" el-isSystem={true}></a-light> */}
        </a-scene>
	    </div>
	  );
  }
}
export default AFramePanel;