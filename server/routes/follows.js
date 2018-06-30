var express = require('express');
var router = express.Router();

var followsController = require('../controllers/followsController');

router.get('/user/:user_id', followsController.index);

//is_following?user_id=user_id&following_id=following_id
router.get('/is_following', followsController.is_following);

//following_me?user_id=user_id
router.get('/following_me', followsController.following_me);

//followed_activity/:user_id
router.get('/followed_activity/:user_id', followsController.followed_activity);

//is_watching_media?userId=userId&mediaId=mediaId
router.get('/is_watching_media', followsController.getFriendsWithWatchedMedia);

//is_rating_media?userId=userId&mediaId=mediaId
router.get('/is_rating_media', followsController.getFriendsWithRatedMedia);

//is_watching_tvshow?userId
router.post('/is_watching_tvshow', followsController.getFriendsWithWatchedTvshow);

router.post('/', followsController.create);

router.delete('/:follow_id', followsController.delete);

module.exports = router;