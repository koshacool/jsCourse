import React from 'react';
import {connect} from 'react-redux';
import { increment, decrement } from '../actions'

class Counter extends React.Component {
    render() {
        return (
            <div>
                My counter: state {this.props.counter}
                <button onClick={this.props.onIcrement}> +</button>
                <button onClick={this.props.onDecrement}> -</button>
                <button onClick={this.props.history.goBack.bind(this)}> Back</button>
                <button onClick={this.props.history.goForward.bind(this)}> Forward</button>
            </div>
        )
    }
}

const mapStateToProps = (state, props) => {
    return {
        counter: state.counter
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        onIcrement() {
            dispatch(increment())
        },
        onDecrement() {
            dispatch(decrement())
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Counter);
