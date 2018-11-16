import React, {Component} from 'react';

class PresenterPage extends Component {
  constructor(props) {
    super(props);
  }
  componentDidMount() {

  }
  componentWillUnmount() {
  }
  handleLoad() {
  }
  render() {
    const baseUrl = process.env.PUBLIC_URL;
    return (
    	<div id="presenter">
        presenter page
    	</div>
    );
  }
}

export default PresenterPage;
