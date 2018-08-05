var express = require('express');
var router = express.Router();

var notificationController = require('../controllers/notificationController');

router.get('/:user_id', notificationController.index);

router.post('/', notificationController.create);

router.put('/:notification_id', notificationController.setViewed);

router.delete('/:notification_id', notificationController.delete);

module.exports = router;
