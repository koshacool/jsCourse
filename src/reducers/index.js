import { combineReducers } from 'redux';
import counter from './counter';
import poets from './poets';

const rootReducer = combineReducers({
  counter,
  poets,
});

export default rootReducer;