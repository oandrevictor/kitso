var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var HistorySchema = new Schema({
  date: {
    date: Date,
    required: true
  },
  _action: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Action',
    required: true
  },
  _user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
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
