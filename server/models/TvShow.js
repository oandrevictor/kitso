var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Media = require('./Media');

var TvShowSchema = new Schema({
    seasons: {
      type: [
        {
          season_n: {
            type: Number,
            required: false
          },
          total_episodes: {
            type: Number,
            required: false
          },
          starts_airing: {
            type: Date,
            required: false //TV shows seasons can be TBA
          },
          ends_airing: {
            type: Date,
            required: false
          }
        }
      ],
      required: false,
      default: []
    },
    _tmdb_id: {
      type: String
    }
});

var TvShow = Media.discriminator('TvShow',
     TvShowSchema);


module.exports = TvShow;
