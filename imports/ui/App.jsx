import React, {Component, PropTypes} from 'react';
import {Meteor} from 'meteor/meteor';
import {BrowserRouter, Route, Link, Switch, Redirect} from 'react-router-dom';
import {createContainer} from 'meteor/react-meteor-data';

import Header from './components/Header.js';
import Home from './components/Home.js';
import About from './components/About.js';

class App extends Component {
    constructor(props) {
        super(props);          
        this.state = {
            logged: this.checkStateLogged(this.props.currentUser)
        };
    
    }

    checkStateLogged(props) {
        if (props) {
            return true;
        }
        return false;
    }
    
    componentWillReceiveProps(nextProps) {
        this.setState({
            logged: this.checkStateLogged(nextProps.currentUser)
        })
    }
 

    render() {  
        return (
            <BrowserRouter>
                <div>
                    <Header logged={this.state.logged} />

                    { this.state.logged ? 
                       <div className="contentBLock">
                            <div className="content">
                                <Switch>
                                    <Redirect exact from="/" to="/home" />
                                    <Route path="/home" component={Home} />
                                    <Route path="/about" component={About} />
                                </Switch>
                            </div> 
                        </div> 
                        : ''
                    }
                    
                </div>
            </BrowserRouter>
        )
    }
};

App.propTypes = {    
    currentUser: PropTypes.object,
};

export default createContainer(() => {   
    return {        
        currentUser: Meteor.user(),
    };
}, App);