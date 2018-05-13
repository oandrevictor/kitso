var express = require('express');
var router = express.Router();

var watchedController = require('../controllers/watchedController');

router.get('/user/:user_id', watchedController.index);

router.post('/', watchedController.create);

router.delete('/:watched_id', watchedController.delete);

module.exports = router;