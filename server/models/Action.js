var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ActionSchema = new Schema({
  date: {
    type: Date,
    required: true
  },
  _action: {
    type: String,
    required: true
  },
  _user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action_type: {
    type: String,
    enum: ['rated','watched','followed', 'followed-page'],
    required: true
  },
  hidden: {
    type: Boolean,
    default: false,
    required: true
   }
});

var Action = mongoose.model('Action', ActionSchema);

module.exports = Action;