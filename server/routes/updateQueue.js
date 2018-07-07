var express = require('express');
var router = express.Router();

var updateQueueController = require('../controllers/updateQueueController');

router.post('/', updateQueueController.create);

module.exports = router;
