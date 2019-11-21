import React from 'react';
import { css } from '@emotion/core';
// https://www.npmjs.com/package/react-spinners
// https://www.react-spinners.com/
// First way to import
//import { ClipLoader } from 'react-spinners';
// Another way to import. This is recommended to reduce bundle size
import ClimbingBoxLoader from 'react-spinners/ClimbingBoxLoader';

import './defaultLoading.css';


// Can be a string as well. Need to ensure each key-value pair ends with ;
const override = css`
  display: block;
  margin: 0 auto;
  border-color: #36d7b7;
`;


function DefaultLoading(props) {
  return (
    <div className='default-loading'>
      <div className='loading-container'>
        <ClimbingBoxLoader
          css={override}
          sizeUnit={"px"}
          size={30}
          color={'#36d7b7'}
          loading={true}
        />
      </div>
    </div>
  );
}


export default DefaultLoading;