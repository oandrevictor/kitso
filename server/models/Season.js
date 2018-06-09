var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Media = require('./Media');

var SeasonSchema = new Schema({
  number:{type: Number,
    required: true},
    _episodes: [
      { type: mongoose.Schema.Types.ObjectId, ref: 'Episode' }
    ],
    _tmdb_id: {
      type: String,
      required: true,
      unique: true
    },
    _tvshow_id: {
      type: mongoose.Schema.Types.ObjectId, ref: 'TvShow'
    }
  });

  var Season = Media.discriminator('Season',
  SeasonSchema);


  module.exports = Season;
