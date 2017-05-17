import React, {Component} from 'react';
import {Meteor} from 'meteor/meteor';
import { Accounts } from 'meteor/std:accounts-ui';

Accounts.ui.config({
  //  requestPermissions: {
  //   facebook: ['user_likes'],
  //   github: ['user', 'repo']
  // },
  // requestOfflineToken: {
  //   google: true
  // },
  passwordSignupFields: 'EMAIL_ONLY',
  // loginPath: '/',
  // signUpPath: '/signup',
  // resetPasswordPath: '/reset-password',
  // profilePath: '/profile',
  // onSignedInHook: () => FlowRouter.go('/general'),
  // onSignedOutHook: () => FlowRouter.go('/login'),
  // passwordSignupFields: 'NO_PASSWORD',
  // loginPath: '/',
  minimumPasswordLength: 6
});

export default class App extends Component {
    constructor(props) {
        super(props);
       
    }

      // <Accounts.ui.LoginForm />

    render() {
      
        return (
            <div className="container">  
                <Accounts.ui.LoginForm />
                
               
            </div>
        )
    }
};