import React from 'react';
import ReactDOM from 'react-dom';

import App from './App';

function render() {
    console.log('this should render');
    ReactDOM.render(<App />, document.getElementById('root'));
}
render();
