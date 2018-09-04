var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ListItemSchema = new Schema({
  date: {
    type: Date,
    required: true
  },
  ranked: {
    type: Number,
    require: true
  },
  _media: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Media',
  },
  addedFrom: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
});

var UserListSchema = new Schema({
  title: {
    type: String,
    required: true,
    maxlength: 40
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
  is_private: {
    type: Boolean,
    required: true,
    default: false
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
  },
  _followers: {
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    default: []
  },
});

var UserList = mongoose.model('UserList', UserListSchema);
var ListItem = mongoose.model('ListItem', ListItemSchema);

module.exports = UserList;
