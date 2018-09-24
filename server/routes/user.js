var express = require('express');
var router = express.Router();

var authController = require('../controllers/authController');
var userController = require('../controllers/userController');

router.get('/', userController.index);

router.get('/status', authController.status);

router.get('/logout', authController.logout);

router.get('/query', userController.findby);

router.get('/:user_id/genrewatched', userController.genreWatched);

router.post('/:user_id/timespent', userController.timeSpent);

router.get('/:user_id/match', userController.getMatch);

router.get('/:user_id', userController.show);

router.post('/', userController.create);

router.post('/login', authController.login);

router.post('/email', userController.findByEmail);


router.post('/password', userController.updatePassword);

router.put('/:user_id', userController.update);

router.post('/delete/:user_id', userController.delete);

module.exports = router;
