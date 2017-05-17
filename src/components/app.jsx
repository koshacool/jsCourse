import React from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router';
import { BrowserRouter, Route, Link, Switch } from 'react-router-dom';

import './styles/index.scss';
import Counter from './Counter.jsx';
import Poets from './Poets.jsx';
import NotFound from './NotFound.jsx';

export default class App extends React.Component {
  render() {      
    return (
      <BrowserRouter>      
        <div>
          <div className="header">
                <Link to="/counter">Counter</Link>
                <Link to="/poets">Poets</Link>
          </div>
          <div className="content">  
            <Switch>
            <Redirect exact from="/" to="/counter"/>
            <Route path="/counter" component={Counter} />
            <Route path="/poets" component={Poets} />  
            <Route  component={NotFound} />  
            </Switch>          
          </div>
        </div>
      </BrowserRouter>
    )
  }
}