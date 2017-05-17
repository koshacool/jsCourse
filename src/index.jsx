import React from 'react';
import { render } from 'react-dom';
import { Provider, connect } from 'react-redux';
import { createStore } from 'redux';
import counter from './reducers';
import App from './components/App.jsx';


const store = createStore(counter);

const rendering = () => {
	render ( 
		<Provider store={store}>
			<App />
		</Provider>, 
		document.getElementById("root")
	);
}

rendering();

if (module && module.hot) {
  module.hot.accept('./components/App.jsx', () => {
    const App = require('./components/App.jsx').default;
    rendering();
  });
}