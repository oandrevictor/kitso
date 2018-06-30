var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var LikedSchema = new Schema({
  _user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  hidden: {
    type: Boolean,
    default: false
  },
  _activity: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Action',
    required: true
  },
  reaction: {
    type: String,
    enum: ["like"],
    default: "like"
  },
  date: {
    type: Date,
    default: Date.now
  },
  _history: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'History',
    required: false
  },
  _action: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Action'
  }
});

var Liked = mongoose.model('Liked', LikedSchema);

module.exports = Liked;
