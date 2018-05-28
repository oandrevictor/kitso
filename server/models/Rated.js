var mongoose = require('mongoose');
var Action = require('./Action');
var User = require('./User');
var Schema = mongoose.Schema;

var RatedSchema = new Schema({
  _user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  hidden: {
    type: Boolean,
    required: true,
    default: false
  },
  _media: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Media',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  _history: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'History',
    required: false
  },
  rating: {
    type: Number,
    enum: [1,2,3,4,5,6,7,8,9,10]
  }
});

RatedSchema.pre('remove', async function(next) {
  let user_id = this._user;
  let action_id = this._action;
  await delete_action(action_id);
  await delete_action_from_user_history(user_id, action_id);

  next();
});

var delete_action = async function(action_id) {
  Action.remove({ _id: action_id}).exec();
} 

var delete_action_from_user_history = async function(user_id, action_id) {
  User.findById(user_id, function (err, user) {
      let user_history = user._history;
      let index = user_history.indexOf(action_id);
      if (index > -1) {
          user_history.splice(index, 1);
      }
      user.save(); 
  });
}

var Rated = mongoose.model('Rated', RatedSchema);

module.exports = Rated;
