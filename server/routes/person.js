var express = require('express');
var router = express.Router();

var personController = require('../controllers/personController');

router.get('/', personController.index);

router.get('/:person_id', personController.show);

router.post('/', personController.create);

router.put('/:person_id', personController.update);

router.delete('/:person_id', personController.delete);

module.exports = router;
