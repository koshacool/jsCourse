import React from 'react';
import {Redirect} from 'react-router';
import {BrowserRouter, Route, Link, Switch} from 'react-router-dom';

import './styles/index.scss';
import Counter from './Counter.js';
import Poets from './Poets.js';
import NotFound from './NotFound.js';

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
                            <Route path="/counter" component={Counter}/>
                            <Route path="/poets" component={Poets}/>
                            <Route component={NotFound}/>
                        </Switch>
                    </div>
                </div>
            </BrowserRouter>
        )
    }
}