var express = require('express');
var router = express.Router();

var followsController = require('../controllers/followsController');

router.get('/:user_id', followsController.index);

//is_following?user_id=user_id&following_id=following_id
router.get('/is_following', followsController.is_following);

router.post('/', followsController.create);

router.delete('/:follows_id', followsController.delete);

module.exports = router;