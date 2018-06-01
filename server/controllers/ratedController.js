var Rated = require('../models/Rated');
var Action = require('../models/Action');
var User = require('../models/User');
var Media = require('../models/Media');
const https = require('https');
var redis = require('redis');
var RequestStatus = require('../constants/requestStatus');
var ActionType = require('../constants/actionType');
var DataStoreUtils = require('../utils/lib/dataStoreUtils');
var client = redis.createClient(19990, 'redis-19990.c16.us-east-1-2.ec2.cloud.redislabs.com', {no_ready_check: true});
client.auth('nsXmMM8VvJ7PrbYc4q6WZ50ilryBdbmM', function (err) {
    if (err) throw err;
  });

exports.index = async function(req, res) {
    let user_id = req.params.user_id;
    let rated_list, promises;
    try {
        rated_list = await find_user_rated_list(user_id);
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
        let user_did_rated = await user_has_rated(user_id, media_id);
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
}

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
    await add_action_to_user_history(user_id, action._id);
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
        var rated = await find_rated_obj(rated_id);
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
    let rated_id = req.params.rated_id;

    Rated.findById(rated_id)
    .catch((err) => {
        res.status(RequestStatus.BAD_REQUEST).send(err);
    })
    .then((rated) => {
        rated.remove()
        .catch((err) => {
            res.status(RequestStatus.BAD_REQUEST).send(err);
        })
        .then((deletedRated) => {
            res.status(RequestStatus.OK).json(deletedRated);
        });
    });
};

var delete_action = function(action_id) {
    Action.remove({ _id: action_id}).exec();
}

var add_action_to_user_history = async function(user_id, action_id) {
    User.findById(user_id, function (err, user) {
        let user_history = user._history;
        user_history.push(action_id);
        return user.save();
    });
}

var delete_action_from_user_history = async function(user_id, action_id) {
    User.findById(user_id, function (err, user) {
        let user_history = user._history;
        let index = user_history.indexOf(action_id);
        if (index > -1) {
            user_history.splice(index, 1);
        }
        user.save();
    });
}

var find_rated_obj = async function(rated_id) {
    return Rated.findById(rated_id).exec();
}

var find_user_rated_list = async function(user_id) {
    return Rated.find({_user: user_id}).exec();
}

var injectMediaJsonInRated = async function(rated_obj) {
    var media_id = rated_obj._media;
    var media_obj = await get_media_obj(media_id);
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
}

var getShow = function(tmdb_id) {
    return new Promise(function(resolve, reject) {
    var query = 'tvshow/' + tmdb_id;
    client.exists('tvshow/' + tmdb_id, function(err, reply) {
      if (reply === 1) {
          console.log('exists');
          client.get(query, async function(err,data) {
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
}

var getShowFromTMDB = function(tmdb_id){
  return new Promise(function(resolve, reject) {
    var query = 'tvshow/' + tmdb_id
    console.log("Could not get from redis, requesting info from The Movie DB")
    https.get("https://api.themoviedb.org/3/tv/"+ tmdb_id + "?api_key=db00a671b1c278cd4fa362827dd02620",
    (resp) => {
      let data = '';
      resp.on('data', (chunk) => {
        data += chunk;
      });
      resp.on('end', () => {
        console.log("saving result to redis: "+ query)
        client.set(query, JSON.stringify(data));
        resolve(data)
      });

    }).on("error", (err) => {
      console.log("Error: " + err.message);
      reject();
    });
  })
}

var get_media_obj = async function(media_id) {
    return Media.findById(media_id).exec();
}

var user_has_rated = async function(user_id, media_id) {
    return Rated.find({_user: user_id, _media: media_id}).exec();
}
