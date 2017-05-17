import React from 'react';
import { connect } from 'react-redux';
import { Route } from 'react-router-dom';


class Counter extends React.Component {

  render() {    
    return (
      <div>
        My counter: state {this.props.counter}
        <button onClick={this.props.onIcrement}> + </button>
        <button onClick={this.props.onDecrement}> - </button>
        <button onClick={this.props.history.goBack.bind(this)}> Back </button>     
        <button onClick={this.props.history.goForward.bind(this)}> Forward </button>
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
      dispatch({ type: 'INCREMENT' })
    },
    onDecrement() {
      dispatch({ type: 'DECREMENT' })
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Counter);
