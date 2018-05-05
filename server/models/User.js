var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var validateEmail = function(email) {
    var re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    return re.test(email)
};

var UserSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true,
    index: {
      unique: true
    }
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: validateEmail,
      message: 'Invalid email'
    }
  },
  password: {
    type: String,
    required: true
  },
  birthday: {
    type: Date,
    required: true
  },
  gender : {
    type: String,
    required: true,
    enum: ['male', 'female', 'other']
  },
  _history: {
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'History'
      }],
      default: [],
      required: true
  },
  _following: {
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Follows'
      }
    ],
    default: []
  },
  _following_pages: {
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'FollowsPage'
      }
    ],
    default: []
  },
  _followers: {
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Follows'
      }
    ],
    default: []
  },
  vip: {
    type: Boolean,
    default: false
  },
  _watchlist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserList'
  },
  _lists: {
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserList'
      }
    ],
    default: []
  },
  _ratings: {
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Rating'
      }
    ],
    default: []
  }
});


var User = mongoose.model('User', UserSchema);

module.exports = User;
