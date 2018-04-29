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
  media: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'History',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  history: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'History',
    required: false
  }
});

var Watched = mongoose.model('Watched', WatchedSchema);

module.exports = Watched;
