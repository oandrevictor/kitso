var express = require('express');
var router = express.Router();

var watchedController = require('../controllers/watchedController');

router.post('/', watchedController.create);

router.delete('/:watched_id', watchedController.delete);

module.exports = router;