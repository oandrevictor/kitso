var express = require('express');
var router = express.Router();

var userController = require('../controllers/userController');

router.get('/', userController.index);

router.get('/:user_id', userController.show);

router.post('/', userController.create);

router.put('/:user_id', userController.update);

router.delete('/:user_id', userController.delete);

module.exports = router;
