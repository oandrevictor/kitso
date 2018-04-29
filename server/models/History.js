var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var HistorySchema = new Schema({
  name: {
    date: Date,
    required: true
  },
  action: {
    type: String,
    required: true
  },
  user: {
    type: Date,
    required: true
  },
  hide: {
    type: Boolean,
    default: false,
    required: true
  }
});

var History = mongoose.model('History', HistorySchema);

module.exports = History;
