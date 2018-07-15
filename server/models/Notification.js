var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var NotificationSchema = new Schema({
  _user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  _related: {
    type: mongoose.Schema.Types.ObjectId,
    required: false
  },
  date: {
    type: Date,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  viewed: {
    type: Boolean,
    default: false
  }
});

var Notification = mongoose.model('Notification', NotificationSchema);

module.exports = Notification;
