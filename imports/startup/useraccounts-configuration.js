import { Accounts } from 'meteor/accounts-base';

Accounts.ui.config({
  passwordSignupFields: 'USERNAME_AND_EMAIL',
  loginPath: '/',
  // signUpPath: '/signup',
  // resetPasswordPath: '/reset-password',
  // profilePath: '/profile',
  // onSignedInHook: () => FlowRouter.go('/general'),
  // onSignedOutHook: () => FlowRouter.go('/login'),
  // passwordSignupFields: 'NO_PASSWORD',
  // loginPath: '/',
  // minimumPasswordLength: 6
});