import React from 'react';
import styled, {keyframes} from 'styled-components';

import setNumberValueWithDefault from 'utils/js/setNumberValueWithDefault';


const twinklingKeyframes = (minOpacity, maxOpacity) => keyframes`
  0% {
    opacity: ${minOpacity};
  }
  100% {
    opacity: ${maxOpacity};
  }
`;

const TwinklingContainerStyleComponent = styled.div`
  animation-name: ${props => 
    twinklingKeyframes(setNumberValueWithDefault(props.minOpacity, 0.5), setNumberValueWithDefault(props.maxOpacity, 1))};
  animation-iteration-count: infinite;
  animation-timing-function: ease-in-out;
  animation-direction: alternate;
  animation-duration: ${props => 
    setNumberValueWithDefault(props.animationDurationInSecs, 0)}s;
`;

// render props pattern
// https://codeburst.io/animating-react-components-with-css-and-styled-components-cc5a0585f105
function TwinklingContainer(props) {
  const {
    minOpacity, maxOpacity, animationDurationInSecs, children
  } = props; 
  return (
    <TwinklingContainerStyleComponent
      minOpacity={minOpacity}
      maxOpacity={maxOpacity}
      animationDurationInSecs={animationDurationInSecs}
    >
      {children}
    </TwinklingContainerStyleComponent>
  );
}

export default TwinklingContainer;