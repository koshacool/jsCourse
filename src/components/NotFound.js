import React from 'react';

export default class NotFound extends React.Component {
  render() {
    return (      
      <div>
        Page "{this.props.location.pathname}" not found! 
      </div>
    )
  }
}


