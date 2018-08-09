var express = require('express');
var router = express.Router();

var ratedController = require('../controllers/ratedController');

//rated?user=user_id&month=march&year=2018media_type=show
router.get('/', ratedController.index);

//is_rated?user_id=user_id&media_id=media_id
router.get('/is_rated', ratedController.is_rated);

//media_rate_average?media_id=media_id
router.get('/media_rate_average', ratedController.getMediaRateAvarege);

//media_rate_average?user_id=user_id&type=type&limit=limit
//type = movie or show
router.get('/top_rated', ratedController.getTopRated);

router.get('/:rated_id', ratedController.show);

router.post('/', ratedController.create);

router.put('/:rated_id', ratedController.update);

router.delete('/:rated_id', ratedController.delete);

module.exports = router;
