import React from 'react';

import setNumberValueWithDefault from 'utils/number/setNumberValueWithDefault';

import './crossButton.css';

function CrossButton(props) {
  const crossButtonStyle = {
    transform: `rotate(${setNumberValueWithDefault(props.rotationInDeg, 0)}DEG)`
  };

  const backgroundStyle = {
    borderRadius: props.backgroundBorderRadius,
    width: props.backgroundSize,
    height: props.backgroundSize,
    backgroundColor: props.backgroundColor
  };

  const strokeStyle = {    
    width: props.strokeLength,
    height: props.strokeThickness,
    backgroundColor: props.strokeColor    
  };

  return (
    <div className="cross-button"
      style={crossButtonStyle}
      onClick={props.onClick}>
      <div className="background"
        style={backgroundStyle}
      >
        <div className="first-stroke" 
          style={strokeStyle}
        />
        <div className="second-stroke" 
          style={strokeStyle}
        />
      </div>
    </div>
  );
}

export default CrossButton;