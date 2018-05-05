var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var WatchedSchema = new Schema({
  user: {
    date: Date,
    required: true
  },
  hidden: {
    type: Boolean,
    required: true,
    default: false
  },
  _media: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Media',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  _history: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'History',
    required: false
  }
});

var Watched = mongoose.model('Watched', WatchedSchema);

module.exports = Watched;
