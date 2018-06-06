var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var NewsSchema = new Schema({
  _posted_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  link: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  _related: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Related'
  }
});

var News = mongoose.model('News', NewsSchema);

module.exports = News;
