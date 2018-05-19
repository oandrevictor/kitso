var express = require('express');
var router = express.Router();

var userListController = require('../controllers/userListController');

router.post('/', userListController.create);

router.post('/:userlist_id/item', userListController.addItem);

module.exports = router;