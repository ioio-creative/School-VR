import React, { Component } from 'react';

import TwinklingContainer from 'components/twinklingContainer';

import './twinklingImage.css';

function TwinklingImageContent(props) {
  const twinklingImageStyle = {
    width: props.width,
    height: props.height
  };
  return (            
    <div className={`twinkling-image ${props.imageContainerClassName || ''}`} style={twinklingImageStyle}>
      <img
        src={props.src}
        alt={props.alt}
      />
    </div>
  );
}

class TwinklingImage extends Component {
  render() {
    const { animationDurationInSecs, ...rest } = this.props;    
    return (
      <TwinklingContainer 
        animationDurationInSecs={animationDurationInSecs}>
        <TwinklingImageContent {...rest} />
      </TwinklingContainer>                    
    );
  }
}

export default TwinklingImage;
export {TwinklingImageContent};