var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var RelatedSchema = new Schema({
  _user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  _news: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'News',
    required: true
  },
  is_media: {
    type: Boolean,
    required: true
  },
  _media: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Media',
    required: false
  },
  _person: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Person',
    required: false
  }
});

var Related = mongoose.model('Related', RelatedSchema);

module.exports = Related;
