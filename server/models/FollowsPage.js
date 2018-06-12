var mongoose = require('mongoose');
var Action = require('./Action');
var User = require('./User');
var Schema = mongoose.Schema;

var FollowsPageSchema = new Schema({
  _user: {
    type: mongoose.Schema.Types.ObjectId, ref: 'User',
    required: true
  },
  _following: {
    type: String,
    required: true
  },
  is_private: {
    type: Boolean,
    required: true,
    default: false
  },
  is_media: {
    type: Boolean,
    required: true
  },
  _action: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Action',
    required: false
  }
});

var FollowsPage = mongoose.model('FollowsPage', FollowsPageSchema);

module.exports = FollowsPage;
