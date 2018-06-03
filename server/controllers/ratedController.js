var Rated = require('../models/Rated');
var RequestStatus = require('../constants/requestStatus');
var ActionType = require('../constants/actionType');
var DataStoreUtils = require('../utils/lib/dataStoreUtils');
var redisClient = require('../utils/lib/redisClient');
const https = require('https');

exports.index = async function(req, res) {
    let user_id = req.params.user_id;
    let rated_list, promises;
    try {
        rated_list = await findUserRatedList(user_id);
        promises = rated_list.map(injectMediaJsonInRated);
    } catch (err) {
        res.status(RequestStatus.BAD_REQUEST).json(err);
    }
    Promise.all(promises).then(function(results) {
        res.status(RequestStatus.OK).json(results);
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
    try {
        await DataStoreUtils.deleteRated(ratedId);
        res.status(RequestStatus.OK);
    } catch (err) {
        res.status(RequestStatus.BAD_REQUEST).send(err);
    }
};

// TODO: move to DataStoreUtils
var findRatedObj = async function(rated_id) {
    return Rated.findById(rated_id).exec();
};

// TODO: move to DataStoreUtils
var findUserRatedList = async function(user_id) {
    return Rated.find({_user: user_id}).exec();
};

var injectMediaJsonInRated = async function(rated_obj) {
    var media_id = rated_obj._media;
    var media_obj = await DataStoreUtils.getMediaObjById(media_id);
    if (media_obj.__t == 'Episode' && media_obj._tmdb_tvshow_id){
      var value = await getSeasonFromAPI(media_obj._tmdb_tvshow_id, media_obj.season_number).then((season)=>{
        var rated_with_full_media = rated_obj;
        rated_with_full_media._media = media_obj
        rated_with_full_media._media.helper = season;
        return rated_with_full_media;
      });
      return value;
    }
    if (media_obj.__t == 'TvShow' && media_obj._tmdb_id){
      var value = await getShow(media_obj._tmdb_id).then((tvshow)=>{
        var rated_with_full_media = rated_obj;
        rated_with_full_media._media = media_obj;
        rated_with_full_media._media.helper = JSON.stringify(tvshow);
        return rated_with_full_media;
      });
      return value;
    }
    else {
      let rated_with_full_media = rated_obj;
      rated_with_full_media._media = media_obj
      return rated_with_full_media;
    }
};

// TODO: move to tmdb expert class
var getShow = function(tmdb_id) {
    return new Promise(function(resolve, reject) {
    var query = 'tvshow/' + tmdb_id;
    redisClient.exists('tvshow/' + tmdb_id, function(err, reply) {
      if (reply === 1) {
          console.log('exists');
          redisClient.get(query, async function(err,data) {
              if(err)
                console.log(err)
              else{
                console.log('got query from redis');
                var parsed_result = JSON.parse(JSON.parse(data));
                  //parsed_result.poster_path = "https://image.tmdb.org/t/p/w500/" + parsed_result.poster_path;
                  parsed_result.backdrop_path = "https://image.tmdb.org/t/p/original/" + parsed_result.backdrop_path;
                  resolve(parsed_result);
              }
            });
      } else {
        getShowFromTMDB(tmdb_id).then(async function(data) {
          var data = JSON.parse(data)
            data._id = result._id;
            data.__t = result.__t;
            resolve(data);
        })
      }
    })
    })
};

// TODO: move to tmdb expert class
var getShowFromTMDB = function(tmdb_id){
  return new Promise(function(resolve, reject) {
    var query = 'tvshow/' + tmdb_id;
    console.log("Could not get from redis, requesting info from The Movie DB")
    https.get("https://api.themoviedb.org/3/tv/"+ tmdb_id + "?api_key=db00a671b1c278cd4fa362827dd02620",
    (resp) => {
      let data = '';
      resp.on('data', (chunk) => {
        data += chunk;
      });
      resp.on('end', () => {
        console.log("saving result to redis: "+ query)
        redisClient.set(query, JSON.stringify(data));
        resolve(data)
      });

    }).on("error", (err) => {
      console.log("Error: " + err.message);
      reject();
    });
  })
};

var userHasRated = async function(user_id, media_id) {
    return Rated.find({_user: user_id, _media: media_id}).exec();
};
