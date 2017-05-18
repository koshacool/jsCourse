import React from 'react';
import { Meteor } from 'meteor/meteor';
import { render } from 'react-dom';
import {BrowserRouter, Route, Link, Switch, Redirect} from 'react-router-dom';

import App from '../imports/ui/App.jsx';
// import Routes from '../imports/ui/Routes.js';
 
Meteor.startup(() => {
	Meteor.subscribe('userData');
  	render(
  		<BrowserRouter>
  			<Route component={App} />
  		</BrowserRouter>, 
  		document.getElementById('app'));
});