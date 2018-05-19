var express = require('express');
var router = express.Router();

var userListController = require('../controllers/userListController');

router.post('/', userListController.create);

router.post('/:userlist_id/item', userListController.addItem);

router.put('/:userlist_id', userListController.update);

router.delete('/:userlist_id', userListController.delete);

//router.delete('/:userlist_id/item', userListController.deleteItem);

module.exports = router;