var express = require('express');
var router = express.Router();

var actionController = require('../controllers/actionController');

router.get('/', actionController.index);

router.get('/:action_id', actionController.show);

router.post('/', actionController.create);

router.put('/:action_id', actionController.update);

router.delete('/:action_id', actionController.delete);

module.exports = router;
