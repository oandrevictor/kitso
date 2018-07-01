var express = require('express');
var router = express.Router();

var userListController = require('../controllers/userListController');

router.get('/:userlist_id', userListController.show);

router.post('/', userListController.create);

router.put('/:userlist_id', userListController.update);

router.delete('/:userlist_id', userListController.delete);

router.post('/:userlist_id/item', userListController.addItem);

router.put('/:userlist_id/follow', userListController.followUserList);

router.put('/:userlist_id/change_rank', userListController.changeItemRank);

router.delete('/:userlist_id/delete_item/:item_rank', userListController.removeItem);

module.exports = router;