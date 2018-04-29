var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var FollowsPageSchema = new Schema({
    user: {
      type: mongoose.Schema.Types.ObjectId, ref: 'User',
      required: true
    },
    following: {
      type: mongoose.Schema.Types.ObjectId, ref: 'Media',
      required: true
    }
});

var FollowsPage = mongoose.model('FollowsPage', FollowsPageSchema);

module.exports = FollowsPage;
