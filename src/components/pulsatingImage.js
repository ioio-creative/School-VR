import React, { Component } from 'react';

import PulsatingContainer from 'components/pulsatingContainer';

import './pulsatingImage.css';

function PulsatingImageContent(props) {
  const pulsatingImageStyle = {
    width: props.width,
    height: props.height
  };
  return (            
    <div className={`pulsating-image ${props.imageContainerClassName || ''}`} style={pulsatingImageStyle}>
      <img
        src={props.src}
        alt={props.alt}
      />
    </div>
  );
}

class PulsatingImage extends Component {
  render() {
    const { animationDurationInSecs, ...rest } = this.props;    
    return (
      <PulsatingContainer 
        animationDurationInSecs={animationDurationInSecs}>
        <PulsatingImageContent {...rest} />
      </PulsatingContainer>                    
    );
  }
}

export default PulsatingImage;
export {PulsatingImageContent};