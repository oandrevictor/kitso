var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var FollowsSchema = new Schema({
    user: {
      type: mongoose.Schema.Types.ObjectId, ref: 'User',
      required: true
    },
    following: {
      type: mongoose.Schema.Types.ObjectId, ref: 'User',
      required: true
    }
});

var Follows = mongoose.model('Follows', FollowsSchema);

module.exports = Follows;
