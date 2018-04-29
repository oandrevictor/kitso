var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var LikedSchema = new Schema({
  user: {
    date: Date,
    required: true
  },
  hidden: {
    type: Boolean,
    required: true,
    default: false
  }
  media: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Media',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  history: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'History',
    required: true
  }
});

var Liked = mongoose.model('Liked', LikedSchema);

module.exports = Liked;
