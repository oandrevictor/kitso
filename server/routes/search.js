var express = require('express');
var router = express.Router();

var searchController = require('../controllers/searchController');

// api/search?type=media&search=media_name
// api/search?type=person&search=person_name
// api/search?type=user&search=user_name
router.get('/', searchController.index);

module.exports = router;
