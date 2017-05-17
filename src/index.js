import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import rootReducers from './reducers';
import App from './components/App.js';

const store = createStore(rootReducers);

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
  module.hot.accept('./components/App.js', () => {
    const App = require('./components/App.js').default;
    rendering();
  });
}