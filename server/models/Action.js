var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ActionSchema = new Schema({
  name: {
    date: Date,
    required: true
  },
  action: {
    type: String,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action_type: {
    type: String,
    enum: ['rated','watched','followed']
    required: true
  }
});

var Action = mongoose.model('Action', ActionSchema);

module.exports = Action;
