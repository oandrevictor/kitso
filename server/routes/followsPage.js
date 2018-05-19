var express = require('express');
var router = express.Router();

var followsPageController = require('../controllers/followsPageController');

router.get('/user/:user_id', followsPageController.index);

//is_following_page?user_id=user_id&following_id=following_id
router.get('/is_following', followsPageController.is_following);

router.post('/', followsPageController.create);

router.delete('/:followsPage_id', followsPageController.delete);

module.exports = router;