var Watched = require('../models/Watched');
var Action = require('../models/Action');
var User = require('../models/User');
var Media = require('../models/Media');
var RequestStatus = require('../constants/requestStatus');
var ActionType = require('../constants/actionType');
var DataStoreUtils = require('../utils/lib/dataStoreUtils');

exports.index = async function(req, res) {
    let user_id = req.params.user_id;
    let watched_list, promises;
    try {
        watched_list = await find_user_watched_list(user_id);
        promises = await watched_list.map(inject_media_json);
    } catch (err) {
        res.status(RequestStatus.BAD_REQUEST).json(err);
    }
    Promise.all(promises).then(function(results) {
      console.log("Respondeu")
        res.status(RequestStatus.OK).send(results);
    })
};

exports.is_watched = async function(req, res) {
    let user_id = req.query.user_id;
    let media_id = req.query.media_id;
    try {
        let user_did_watched = await user_has_watched(user_id, media_id);
        if (user_did_watched.length > 0) {
            res_json = {
                "is_watched": true,
                "watched_id": user_did_watched[0]._id
            }
            res.status(RequestStatus.OK).json(res_json);
        } else {
            json_not_watched = {"is_watched": false};
            res.status(RequestStatus.OK).json(json_not_watched);
        }
    } catch (err) {
        res.status(RequestStatus.BAD_REQUEST).json(err);
    }
};

exports.create = async function(req, res) {
    var watched = new Watched(req.body);
    let user_id = watched._user;
    let action = await DataStoreUtils.createAction(user_id, watched._id, ActionType.WATCHED);
    watched._action = action._id;
    await DataStoreUtils.addActionToUserHistory(user_id, action._id);
    watched.save()
    .catch((err) => {
        res.status(RequestStatus.BAD_REQUEST).send(err);
    })
    .then((createdWatched) => {
        res.status(RequestStatus.OK).json(createdWatched);
    });
};

exports.update = async function(req, res) {
    let watched_id = req.params.watched_id;
    try {
        var watched = await find_watched_obj(watched_id);
    } catch (err) {
        // if there is no watched with informed id
        res.status(RequestStatus.BAD_REQUEST).send(err);
    }

    if (req.body.date) {
        watched.date = req.body.date;
    }

    watched.save()
    .catch((err) => {
        res.status(RequestStatus.BAD_REQUEST).send(err);
    })
    .then((updateWatched) => {
        res.status(RequestStatus.OK).json(updateWatched);
    });
};

exports.delete = async function(req, res) {
    let watched_id = req.params.watched_id;

    Watched.findById(watched_id)
    .catch((err) => {
        res.status(RequestStatus.BAD_REQUEST).send(err);
    })
    .then((watched) => {
        watched.remove()
        .catch((err) => {
            res.status(RequestStatus.BAD_REQUEST).send(err);
        })
        .then((deletedWatched) => {
            res.status(RequestStatus.OK).json(deletedWatched);
        });
    });
};

var create_action = async function(user_id, watched_id) {
    var action = new Action({
        _user: user_id,
        date: new Date(),
        _action: watched_id,
        action_type: WATCHED_ACTION_TYPE,
    });
    return action.save();
}

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

var find_watched_obj = async function(watched_id) {
    return Watched.findById(watched_id).exec();
}

var find_user_watched_list = async function(user_id) {
    return Watched.find({_user: user_id}).exec();
}


var getSeasonFromAPI = function(tv_id, season_number){
  return new Promise(function(resolve, reject) {
    var query = 'tvshow/' + tv_id + '/season/' + season_number
    https.get("https://api.themoviedb.org/3/tv/"+ tv_id + "/season/"+ season_number +"?api_key=db00a671b1c278cd4fa362827dd02620",
    (resp) => {
      let data = '';
      resp.on('data', (chunk) => {
        data += chunk;
      });
      resp.on('end', () => {
        console.log("saving season result to redis:"+  query)
        client.set(query, JSON.stringify(data));
        resolve(data)
      });

    }).on("error", (err) => {
      reject();
    });
  })
}
var inject_media_json = async function(watched_obj) {
    let media_id = watched_obj._media;
    let media_obj = await get_media_obj(media_id);
    if (media_obj.__t == 'Episode' && media_obj._tmdb_tvshow_id){
      var value = await getSeasonFromAPI(media_obj._tmdb_tvshow_id, media_obj.season_number).then((season)=>{
        var watched_with_full_media = watched_obj;
        watched_with_full_media._media = media_obj
        watched_with_full_media._media.helper = season;
        return watched_with_full_media;
      });
      return value;

    }
    else {
      let watched_with_full_media = watched_obj;
      watched_with_full_media._media = media_obj;
      return watched_with_full_media;
    }
}

var get_media_obj = async function(media_id) {
    return Media.findById(media_id).exec();
}

var user_has_watched = async function(user_id, media_id) {
    return Watched.find({_user: user_id, _media: media_id}).exec();
}
