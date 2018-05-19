var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ListItem = new Schema({
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
    type: [ListItem],
    required: true,
    default: []
  }
});

var UserList = mongoose.model('UserList', UserListSchema);

module.exports = UserList;
