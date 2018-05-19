var express = require('express');
var router = express.Router();

var userListController = require('../controllers/userListController');

router.post('/', userListController.create);

module.exports = router;