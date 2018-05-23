var express = require('express');
var router = express.Router();

var followsController = require('../controllers/followsController');

router.get('/user/:user_id', followsController.index);

//is_following?user_id=user_id&following_id=following_id
router.get('/is_following', followsController.is_following);

//following_me?user_id=user_id
router.get('/following_me', followsController.following_me);

router.post('/', followsController.create);

router.delete('/:follow_id', followsController.delete);

module.exports = router;