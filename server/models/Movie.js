var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Media = require('./Media');
var MediaType =  require('../constants/mediaType');

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

var Movie = Media.discriminator(MediaType.MOVIE, MovieSchema);


module.exports = Movie;
