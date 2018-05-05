var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var MediaSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    overview: {
        type: String,
        required: true,
        default: "No information now, come back soon."
    },
    release_date: {
        type: Date,
        required: true
    },
    _directors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Person' }],
    _actors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Person' }],
    imdb_id: {
        type: String,
        required: true
    },
    genres: {
      type: [String],
      default: [],
      required: true
    },
    poster: {
        type: String,
        default: 'placeholder'
    }
});

var Media = mongoose.model('Media', MediaSchema);

module.exports = Media;
