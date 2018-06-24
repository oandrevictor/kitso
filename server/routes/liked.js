var express = require('express');
var router = express.Router();

var likedController = require('../controllers/likedController');

router.get('/', likedController.index);

router.get('/:liked_id', likedController.show);

router.post('/', likedController.create);

router.put('/:liked_id', likedController.update);

router.delete('/:liked_id', likedController.delete);

module.exports = router;
