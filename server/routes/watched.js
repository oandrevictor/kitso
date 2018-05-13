var express = require('express');
var router = express.Router();

var watchedController = require('../controllers/watchedController');

router.post('/', watchedController.create);

module.exports = router;