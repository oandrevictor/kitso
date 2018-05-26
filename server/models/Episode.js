var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Media = require('./Media');

var EpisodeSchema = new Schema({
  number:{type: Number,
  required: true},
  _cast: [
    { type: mongoose.Schema.Types.ObjectId, ref: 'AppearsIn' }
  ],
  _tmdb_id: {
    type: String,
    required: true
  }
});

var Episode = Media.discriminator('Episode',
     EpisodeSchema);


module.exports = Episode;
