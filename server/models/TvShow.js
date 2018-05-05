var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Media = require('./Media');

var TvShowSchema = new Schema({
    seasons: {
      type: [
        {
          season_n: {
            type: Number,
            required: true
          },
          total_episodes: {
            type: Number,
            required: true
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
      required: true,
      default: []
    }
});

var TvShow = Media.discriminator('TvShow',
     TvShowSchema);


module.exports = TvShow;
