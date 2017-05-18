import React from 'react';
import { Meteor } from 'meteor/meteor';
import { render } from 'react-dom';

import App from '../imports/ui/App.jsx';
// import Routes from '../imports/ui/Routes.js';
 
Meteor.startup(() => {
	Meteor.subscribe('userData');
  	render(<App />, document.getElementById('app'));
});