var express = require('express');
var router = express.Router();

var ratedController = require('../controllers/ratedController');

router.get('/user/:user_id', ratedController.index);

//is_rated?user_id=user_id&media_id=media_id
router.get('/is_rated', ratedController.is_rated);

router.get('/:rated_id', ratedController.show);

router.post('/', ratedController.create);

router.put('/:rated_id', ratedController.update);

router.delete('/:rated_id', ratedController.delete);

module.exports = router;
