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
  }
  media: {
    type: String,
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

var History = mongoose.model('History', HistorySchema);

module.exports = History;
