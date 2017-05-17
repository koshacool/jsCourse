export default (state = {show: false}, action) => {
  switch (action.type) {
    case 'showBooks':
      return {show: 'renderBooks'};
    case 'showAuthors':
      return {show: 'renderAuthors'};
    default:
      return state;
  }
}