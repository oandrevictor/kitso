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
    },
    _action: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Action',
      required: false
    }
});

var Follows = mongoose.model('Follows', FollowsSchema);

module.exports = Follows;
