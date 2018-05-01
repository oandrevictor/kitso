var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var FollowsSchema = new Schema({
    _user: {
      type: mongoose.Schema.Types.ObjectId, ref: 'User',
      required: true
    },
    _following: {
      type: mongoose.Schema.Types.ObjectId, ref: 'User',
      required: true
    }
});

var Follows = mongoose.model('Follows', FollowsSchema);

module.exports = Follows;
