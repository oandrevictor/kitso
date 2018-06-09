var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ListItemSchema = new Schema({
  ranked: {
    type: Number,
    require: true
  },
  _media: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Media',
  }
});

var UserListSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  deletable: {
    type: Boolean,
    required: true,
    default: true
  },
  _user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  itens: {
    type: [Schema.Types.Mixed],
    required: true,
    default: []
  }
});

var UserList = mongoose.model('UserList', UserListSchema);
var ListItem = mongoose.model('ListItem', ListItemSchema);

module.exports = UserList;
