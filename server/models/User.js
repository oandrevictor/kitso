var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
    // TO DO
});

var User = mongoose.model('User', UserSchema);

module.exports = User;