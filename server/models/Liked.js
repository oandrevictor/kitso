var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var LikedSchema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  hidden: {
    type: Boolean,
    required: true,
    default: false
  },
  media: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Media',
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  history: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'History',
    required: false
  }
});

var Liked = mongoose.model('Liked', LikedSchema);

module.exports = Liked;
