var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var MediaSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  overview: {
    type: String,
    required: false,
    default: "No information now, come back soon."
  },
  release_date: {
    type: Date,
    required: false
  },
  _directors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Person' }],
  _actors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Person' }],
  imdb_id: {
    type: String,
    required: false
  },
  genres: {
    type: [String],
    default: [],
    required: false
  },
  images: {
    poster: {
      type: String
    },
    cover: {
      type: String
    }
  },
  helper: {
    type: String
  }
});

var Media = mongoose.model('Media', MediaSchema);

module.exports = Media;
