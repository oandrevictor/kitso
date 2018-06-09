var express = require('express');
var router = express.Router();

var watchedController = require('../controllers/watchedController');

router.get('/user/:user_id', watchedController.index);

//is_watched?user_id=user_id&media_id=media_id
router.get('/is_watched', watchedController.is_watched);

router.post('/', watchedController.create);

router.post('/entireSeason', watchedController.watchEntireSeason);

router.post('/season', watchedController.watchSeason);

router.post('/season/progress', watchedController.seasonWatchedProgress);

router.post('/season/unwatch', watchedController.unwatchSeason);

router.post('/tvshow', watchedController.watchTvshow);

router.post('/tvshow/progress', watchedController.tvshowWatchedProgress);

router.post('/tvshow/unwatch', watchedController.unwatchTvshow);

router.put('/:watched_id', watchedController.update);

router.delete('/:watched_id', watchedController.delete);

module.exports = router;