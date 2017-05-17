import * as types from '../constants/actionTypes';

export const increment = () => ({ type: types.INCREMENT });
export const decrement = () => ({ type: types.DECREMENT });
export const books = () => ({ type: types.SHOW_BOOKS });
export const authors = () => ({ type: types.SHOW_AUTHORS });
