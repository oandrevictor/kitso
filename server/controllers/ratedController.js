var Rated = require('../models/Rated');
var RequestStatus = require('../constants/requestStatus');
var ActionType = require('../constants/actionType');
var DataStoreUtils = require('../utils/lib/dataStoreUtils');
var Utils = require('../utils/lib/utils');
var TMDBController = require('../external/TMDBController');
var RequestMsgs = require('../constants/requestMsg');

exports.index = async function(req, res) {
  let user_id = req.query.user;
  let rated_list, promises;

  let page;
  if (req.query.page)
    page = parseInt(req.query.page);
  else
    page = 0;

  try {
    rated_list = await findUserRatedList(user_id, page);
    promises = rated_list.map(injectMediaJsonInRated);
  } catch (err) {
    res.status(RequestStatus.BAD_REQUEST).json(err);
  }
  Promise.all(promises).then(function(results) {
    let filtered_results = Utils.filterWatchedMedia(results, req.query);
    res.status(RequestStatus.OK).json(filtered_results);
  })
};

exports.is_rated = async function(req, res) {
  let user_id = req.query.user_id;
  let media_id = req.query.media_id;
  try {
    let user_did_rated = await userHasRated(user_id, media_id);
    if (user_did_rated.length > 0) {
      res_json = {
        "is_rated": true,
        "rated_id": user_did_rated[0]._id
      }
      res.status(RequestStatus.OK).json(res_json);
    } else {
      json_not_rated = {"is_rated": false};
      res.status(RequestStatus.OK).json(json_not_rated);
    }
  } catch (err) {
    res.status(RequestStatus.BAD_REQUEST).json(err);
  }
};

exports.show = function(req, res) {
  Rated.findById(req.params.rated_id)
  .catch((err) => {
    res.status(RequestStatus.BAD_REQUEST).send(err);
  })
  .then((result) => {
    res.status(RequestStatus.OK).json(result);
  });
};

exports.create = async function(req, res) {
  var rated = new Rated(req.body);
  let user_id = rated._user;

  if (!(req.user && req.user._id.toString() === user_id.toString())) {
    return res.status(RequestStatus.UNAUTHORIZED).send(RequestMsgs.UNAUTHORIZED);
  }

  let action = await DataStoreUtils.createAction(user_id, rated._id, ActionType.RATED);
  rated._action = action._id;
  await DataStoreUtils.addActionToUserHistory(user_id, action._id);
  rated.save()
  .catch((err) => {
    res.status(RequestStatus.BAD_REQUEST).send(err);
  })
  .then((createdRated) => {
    res.status(RequestStatus.OK).json(createdRated);
  });
};

exports.update = async function(req, res) {
  let rated_id = req.params.rated_id;
  try {
    var rated = await findRatedObj(rated_id);
  } catch (err) {
    // if there is no rated with informed id
    res.status(RequestStatus.BAD_REQUEST).send(err);
  }

  let user_id = rated._user;
  if (!(req.user && req.user._id.toString() === user_id.toString())) {
    return res.status(RequestStatus.UNAUTHORIZED).send(RequestMsgs.UNAUTHORIZED);
  }

  if (req.body.date) {
    rated.date = req.body.date;
  }

  if (req.body.rating) {
    rated.rating = req.body.rating;
  }

  rated.save()
  .catch((err) => {
    res.status(RequestStatus.BAD_REQUEST).send(err);
  })
  .then((updateRated) => {
    res.status(RequestStatus.OK).json(updateRated);
  });
};

exports.delete = async function(req, res) {
  let ratedId = req.params.rated_id;
  let rated = await DataStoreUtils.getRatedById(ratedId);

  let user_id = rated._user;
  if (!(req.user && req.user._id.toString() === user_id.toString())) {
    return res.status(RequestStatus.UNAUTHORIZED).send(RequestMsgs.UNAUTHORIZED);
  }

  try {
    await DataStoreUtils.deleteRated(ratedId);
    res.status(RequestStatus.OK);
  } catch (err) {
    res.status(RequestStatus.BAD_REQUEST).send(err);
  }
};

exports.getMediaRateAvarege = async function(req, res) {
  let media_id = req.query.media_id;
  try {
    let vote_average = await DataStoreUtils.getMediaVoteAverage(media_id);
    res_json = {
      "vote_average": vote_average
    }
    res.status(RequestStatus.OK).json(res_json);
  } catch (err) {
    res.status(RequestStatus.BAD_REQUEST).json(err);
  }
};

// TODO: move to DataStoreUtils
var findRatedObj = async function(rated_id) {
  return Rated.findById(rated_id).exec();
};

// TODO: move to DataStoreUtils
var findUserRatedList = async function(user_id, page) {
  return Rated.find({_user: user_id}).skip(page * 9).limit(9).exec();
};

var injectMediaJsonInRated = async function(rated_obj) {
  var media_id = rated_obj._media;
  var media_obj = await DataStoreUtils.getMediaObjById(media_id);
  if (media_obj.__t == 'Episode' && media_obj._tmdb_tvshow_id){
    var value = await TMDBController.getSeason(media_obj._tmdb_tvshow_id, media_obj.season_number).then((season)=>{
      var rated_with_full_media = rated_obj;
      rated_with_full_media._media = media_obj
      rated_with_full_media._media.helper = JSON.stringify(season);
      return rated_with_full_media;
    });
    return value;
  }
  if (media_obj.__t == 'TvShow' && media_obj._tmdb_id){
    var value = await TMDBController.getShow(media_obj._tmdb_id).then((tvshow)=>{
      var rated_with_full_media = rated_obj;
      rated_with_full_media._media = media_obj;
      rated_with_full_media._media.helper = JSON.stringify(tvshow);
      return rated_with_full_media;
    });
    return value;
  } else if (media_obj.__t == 'Movie' && media_obj._tmdb_id) {
    var value = await TMDBController.getMovie(media_obj._tmdb_id).then((movie) => {
      var watched_with_full_media = rated_obj;
      watched_with_full_media._media = media_obj;
      watched_with_full_media._media.helper = JSON.stringify(movie);
      return watched_with_full_media;
    });
    return value;
  }
  else {
    let rated_with_full_media = rated_obj;
    rated_with_full_media._media = media_obj
    return rated_with_full_media;
  }
};

var userHasRated = async function(user_id, media_id) {
  return Rated.find({_user: user_id, _media: media_id}).exec();
};
