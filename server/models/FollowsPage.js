var mongoose = require('mongoose');
var Action = require('./Action');
var User = require('./User');
var Schema = mongoose.Schema;

var FollowsPageSchema = new Schema({
    _user: {
      type: mongoose.Schema.Types.ObjectId, ref: 'User',
      required: true
    },
    _following: {
      type: String,
      required: true
    },
    is_media: {
      type: Boolean,
      required: true
    },
    _action: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Action',
      required: false
    }
});

FollowsPageSchema.pre('remove', async function(next) {
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
  User.findById(user_id, async function (err, user) {
      let user_history = user._history;
      let index = user_history.indexOf(action_id);
      if (index > -1) {
          user_history.splice(index, 1);
      }
      user.save(); 
  });
}

var FollowsPage = mongoose.model('FollowsPage', FollowsPageSchema);

module.exports = FollowsPage;
