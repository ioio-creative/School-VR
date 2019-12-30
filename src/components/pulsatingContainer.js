import React from 'react';
import styled, {keyframes} from 'styled-components';

import setNumberValueWithDefault from 'utils/js/setNumberValueWithDefault';


const pulsatingKeyframes = (minScale, maxScale) => keyframes`
  0% {
    transform: scale(${minScale});
  }
  100% {
    transform: scale(${maxScale});
  }
`;

const PulsatingContainerStyleComponent = styled.div`
  animation-name: ${props => 
    pulsatingKeyframes(setNumberValueWithDefault(props.minScale, 0.8), setNumberValueWithDefault(props.maxScale, 1.2))};
  animation-iteration-count: infinite;
  animation-timing-function: linear;
  animation-direction: alternate;
  animation-duration: ${props => 
    setNumberValueWithDefault(props.animationDurationInSecs, 0)}s;
`;

// render props pattern
// https://codeburst.io/animating-react-components-with-css-and-styled-components-cc5a0585f105
function PulsatingContainer(props) {
  const {
    minScale, maxScale, animationDurationInSecs, children
  } = props;
  return (
    <PulsatingContainerStyleComponent
      minScale={minScale}
      maxScale={maxScale}
      animationDurationInSecs={animationDurationInSecs}
    >
      {children}
    </PulsatingContainerStyleComponent>
  );
}

export default PulsatingContainer;