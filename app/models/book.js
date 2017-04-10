var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var BookSchema = new Schema({
    name: {type: String, default: ''},
    releaseYear: {type: String, default: 1900},
    ownerId: {type: String, required: true}
});

module.exports = mongoose.model('Book', BookSchema);
