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
    required: true,
    default: Date.now
  },
  _related: {
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Related'
      }
    ],
    default: []
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Related'
  },
  _action: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Action',
    required: false
  }
});

var News = mongoose.model('News', NewsSchema);

module.exports = News;
