var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Media = require('./Media');

var TvShowSchema = new Schema({
  _seasons: { type: [{type: mongoose.Schema.Types.ObjectId, ref: 'Season'}],

  required: false,
  default: []
},
_tmdb_id: {
  type: String,
  unique: true,
}
});

var TvShow = Media.discriminator('TvShow', TvShowSchema);

module.exports = TvShow;
