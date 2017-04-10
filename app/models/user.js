
/*!
 * Module dependencies
 */

var mongoose = require('mongoose');
// var userPlugin = require('mongoose-user');
var Schema = mongoose.Schema;

/**
 * User schema
 */

var UserSchema = new Schema({
  username: { type: String, default: '' },
  password: { type: String, default: '' },
  // hashed_password: { type: String, default: '' },
  // salt: { type: String, default: '' }
});


module.exports = mongoose.model('User', UserSchema);
