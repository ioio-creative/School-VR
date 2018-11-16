import React from 'react';
import Loadable from 'react-loadable';

const asyncLoadingComponent = (funcToImportComponent) => {
  return Loadable({
    loader: funcToImportComponent,
    loading: (props) => { 
      if (props.isLoading) {
        return <div>Loading...</div>;
      }else if (props.timedOut) {
        return <div>Timeout. Please retry.</div>
      } else if (props.error) {
        return <div>Sorry, there was a problem when loading.</div>;
      } else {
        return <div>Unknown Error</div>;
      }
    }
  });
};

export default asyncLoadingComponent;