var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var RelatedSchema = new Schema({
    user: {
      type: mongoose.Schema.Types.ObjectId, ref: 'User',
      required: true
    },
    news: {
      type: mongoose.Schema.Types.ObjectId, ref: 'News',
      required: true
    },
    media: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Media',
      required: false
    },
    person: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Person',
      required: false
    }
});

var Related = mongoose.model('Related', RelatedSchema);

module.exports = Related;
