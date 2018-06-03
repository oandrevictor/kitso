var Watched = require('../models/Watched');
var RequestStatus = require('../constants/requestStatus');
var ActionType = require('../constants/actionType');
var DataStoreUtils = require('../utils/lib/dataStoreUtils');

exports.index = async function(req, res) {
    let user_id = req.params.user_id;
    let watched_list, promises;
    try {
        watched_list = await DataStoreUtils.getWatchedByUserId(user_id);
        promises = await watched_list.map(injectMediaJsonInWatched);
    } catch (err) {
        res.status(RequestStatus.BAD_REQUEST).json(err);
    }
    Promise.all(promises).then(function(results) {
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

exports.watchSeason = async function(req, res) {
    var episodesIds = req.body.episodesIds;
    var seasonId = req.body.seasonId;
    var user_id = req.body._user;
    var date = req.body.date;
    //watched Season
    let seasonWatched = await create_season_watched(seasonId, user_id, date);
    // watched episodes
    let result = await watch_season_episodes(episodesIds, user_id, date);

    res.status(RequestStatus.OK).json({message: result, watched: seasonWatched});
}

exports.watchTvshow = async function(req, res) {
    var user_id = req.body._user;
    var date = req.body.date;
    var seasons = req.body.seasons;
    let seasonsIds = getSeasonsIds(seasons);
    let result = [];
    seasonsIds.forEach(async (seasonId, i) => {
        result[i] = await create_season_watched(seasonId, user_id, date);
    });
    // watched episodes
    let seasonEpisodesIds = getSeasonsEpisodesIds(seasons);
    seasonEpisodesIds.forEach(async (episodesIds) => {
        await watch_season_episodes(episodesIds, user_id, date);
    });
    res.status(RequestStatus.OK).json(result);

}

exports.update = async function(req, res) {
    let watched_id = req.params.watched_id;
    try {
        var watched = await DataStoreUtils.getWatchedById(watched_id);
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
    let watchedId = req.params.watched_id;
    try {
        await DataStoreUtils.deleteWatched(watchedId);
        res.status(RequestStatus.OK);
    } catch (err) {
        res.status(RequestStatus.BAD_REQUEST).send(err);
    }
};

var getSeasonFromAPI = function(tv_id, season_number){
  return new Promise(function(resolve, reject) {
    var query = 'tvshow/' + tv_id + '/season/' + season_number;
    https.get("https://api.themoviedb.org/3/tv/"+ tv_id + "/season/"+ season_number +"?api_key=db00a671b1c278cd4fa362827dd02620",
    (resp) => {
      let data = '';
      resp.on('data', (chunk) => {
        data += chunk;
      });
      resp.on('end', () => {
        console.log("saving season result to redis:"+  query);
        client.set(query, JSON.stringify(data));
        resolve(data)
      });

    }).on("error", (err) => {
      reject();
    });
  })
};

var injectMediaJsonInWatched = async function(watched_obj) {
    let mediaId = watched_obj._media;
    let mediaObj = await DataStoreUtils.getMediaObjById(mediaId);
    if (mediaObj.__t == 'Episode' && mediaObj._tmdb_tvshow_id){
      var value = await getSeasonFromAPI(media_obj._tmdb_tvshow_id, media_obj.season_number).then((season) => {
        var watched_with_full_media = watchedObj;
        watched_with_full_media._media = mediaObj;
        watched_with_full_media._media.helper = season;
        return watched_with_full_media;
      });
      return value;
    }
    else {
      let watched_with_full_media = watched_obj;
      watched_with_full_media._media = mediaObj;
      return watched_with_full_media;
    }
};

var user_has_watched = async function(user_id, media_id) {
    return Watched.find({_user: user_id, _media: media_id}).exec();
}

function getSeasonsEpisodesIds(seasons) {
    let seasonsEpisodesIds = [];
    seasons.forEach((season, i) => {
        seasonsEpisodesIds[i] = [];
        season._episodes.forEach((episode) => {
            seasonsEpisodesIds[i].push(episode);
        });
    });
    return seasonsEpisodesIds;
}

function getSeasonsIds(seasons) {
    let seasonsIds = [];
    seasons.forEach((season) => {
        seasonsIds.push(season._id);
    });
    return seasonsIds;
}

async function watch_season_episodes(episodesIds, user_id, date) {
    var requests = 0;
    var payload = episodesIds.length;
    episodesIds.forEach(async (episode) => {
        let watched = new Watched();
        watched._media = episode;
        watched._user = user_id;
        watched.date = date;
        let action = await DataStoreUtils.createAction(user_id, watched._id, ActionType.WATCHED);
        watched._action = action._id;
        await DataStoreUtils.addActionToUserHistory(user_id, action._id);
        watched.save()
            .then((watched) => {
                requests++;
                if (requests == payload)
                    done();
            })
            .catch((error) => {
                requests++;
                if (requests == payload)
                    done();
            });
    });
    function done() {
        return "Season watched.";
    }
}

async function create_season_watched(seasonId, user_id, date) {
    var seasonWatched = new Watched();
    seasonWatched._media = seasonId;
    seasonWatched._user = user_id;
    seasonWatched.date = date;
    let seasonAction = await DataStoreUtils.createAction(user_id, seasonWatched._id, ActionType.WATCHED);
    seasonWatched._action = seasonAction._id;
    await DataStoreUtils.addActionToUserHistory(user_id, seasonAction._id);
    return seasonWatched.save();
}
