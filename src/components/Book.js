import React from 'react';
import PropTypes from 'prop-types';

export default class Book extends React.Component {
  render() {
    const {image, title, id, year} = this.props.book;
    
    return (
      <div>
        <img src={image} /><br/>
        <span> {title} </span>
        <span>, Year: {year} </span>
      </div>
    )
  }
}

Book.propTypes = {
  book: PropTypes.object.isRequired
};