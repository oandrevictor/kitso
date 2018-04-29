var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var RatedSchema = new Schema({
  user: {
    date: Date,
    required: true
  },
  hidden: {
    type: Boolean,
    required: true,
    default: false
  }
  media: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  history: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'History',
    required: true
  },
  rating: {
    type: Number,
    enum: [1,2,3,4,5,6,7,8,9,10]
  }
});

var Rated = mongoose.model('Rated', RatedSchema);

module.exports = Rated;
