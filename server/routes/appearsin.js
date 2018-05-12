var express = require('express');
var router = express.Router();

var appearsInController = require('../controllers/appearsInController');

router.get('/', appearsInController.index);

router.get('/:appearsin_id', appearsInController.show);

router.post('/', appearsInController.create);

router.put('/:appearsin_id', appearsInController.update);

router.delete('/:appearsin_id', appearsInController.delete);

module.exports = router;
