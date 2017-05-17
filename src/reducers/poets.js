import { SHOW_BOOKS, SHOW_AUTHORS } from '../constants/actionTypes.js'

export default (state = {show: false}, action) => {
  switch (action.type) {
    case SHOW_BOOKS:
      return {show: 'renderBooks'};
    case SHOW_AUTHORS:
      return {show: 'renderAuthors'};
    default:
      return state;
  }
}