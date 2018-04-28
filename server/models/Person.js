var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PersonSchema = new Schema({
    // TO DO
});

var Person = mongoose.model('Person', PersonSchema);

module.exports = Person;