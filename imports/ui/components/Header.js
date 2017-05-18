import React, {Component, PropTypes} from 'react';
import {Meteor} from 'meteor/meteor';
import {BrowserRouter, Route, Link, Switch} from 'react-router-dom';


Accounts.ui.config({
    passwordSignupFields: 'EMAIL_ONLY',
    homeRoutePath: '/',    
    minimumPasswordLength: 6
});

export default class Header extends Component { 

    render() {        
    	const {logged} = this.props;
        return (
        	<div className="headerBock">
            <div className="header">
            	<Accounts.ui.LoginForm 
                />
            	{logged ? 
            		<div className="linkBLock">            			
            			<Link className="btn btn-primary" to="/home">Home</Link>
                		<Link className="btn btn-primary" to="/about">About</Link>
            		</div>	
            		: ''
            	}
                
            </div>
            </div>
        )
    }
};

Header.propTypes = {    
    logged: PropTypes.bool.isRequired,
};
