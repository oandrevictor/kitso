var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Media = require('./Media');

var MovieSchema = new Schema({
    isBoxOffice: {
        type: Boolean,
        required: true,
        default: false
    },
    _tmdb_id: {
      type: String,
      unique: true,
    }
});

var Movie = Media.discriminator('Movie',
     MovieSchema);


module.exports = Movie;
