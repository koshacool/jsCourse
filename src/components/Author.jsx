import React from 'react';
import PropTypes from 'prop-types';

export default class Author extends React.Component {
  render() {
    const {avatarUrl, fullName, city, dateOfDeath} = this.props.author;

    return (
      <div>
        <img src={avatarUrl} /><br/>
        <span> {fullName} </span>
        <span>, {city} </span>
        <span>, Date of death:  {dateOfDeath} </span>
      </div>
    )
  }
}

Author.propTypes = {
  author: PropTypes.object.isRequired
};