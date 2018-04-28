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
        default: ''
    },
    release_date: {
        type: Date,
        required: true
    },
    director: { type: mongoose.Schema.Types.ObjectId, ref: 'Person' },
    actors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Person' }],
    imdb_id: {
        type: String,
        required: true
    },
    genres: [String],
    porter: {
        type: String,
        default: 'placeholder'
    },
    rating: {
        type: Number,
        required: true,
        default: 0
    }
});

var Media = mongoose.model('Media', MediaSchema);

module.exports = Media;