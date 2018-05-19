var express = require('express');
var router = express.Router();

var relatedController = require('../controllers/relatedController');

router.get('/', relatedController.index);

router.get('/:related_id', relatedController.show);

router.post('/', relatedController.create);

router.put('/:related_id', relatedController.update);

router.delete('/:related_id', relatedController.delete);

module.exports = router;
