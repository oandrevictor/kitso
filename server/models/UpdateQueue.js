var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UpdateQueueSchema = new Schema({
  _tvshow_id: {
    type: mongoose.Schema.Types.ObjectId, ref: 'TvShow',
    required: true,
    unique: true
  }
});

var UpdateQueue = mongoose.model('UpdateQueue', UpdateQueueSchema);

module.exports = UpdateQueue;
