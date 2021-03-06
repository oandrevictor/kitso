var mongoose = require('mongoose');
var Action = require('./Action');
var User = require('./User');
var DataStoreUtils = require('../utils/lib/dataStoreUtils');
var Schema = mongoose.Schema;

var RatedSchema = new Schema({
  _user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
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
  },
  rating: {
    type: Number,
    enum: [1,2,3,4,5,6,7,8,9,10]
  },
  _action: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Action',
    required: true
  }
});

var Rated = mongoose.model('Rated', RatedSchema);

module.exports = Rated;
