var express = require('express');
var router = express.Router();

var followsPageController = require('../controllers/followsPageController');

router.get('/user/:user_id', followsPageController.index);

//is_following?user_id=user_id&following_id=following_id
router.get('/is_following', followsPageController.is_following);

//following_me?page_id=page_id
router.get('/following_me', followsPageController.following_me);

router.post('/', followsPageController.create);

router.delete('/:followsPage_id', followsPageController.delete);

module.exports = router;