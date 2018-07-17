var Watched = require('../models/Watched');
var Season = require('../models/Season');
var RequestStatus = require('../constants/requestStatus');
var ActionType = require('../constants/actionType');
var TMDBController = require('../external/TMDBController');
var DataStoreUtils = require('../utils/lib/dataStoreUtils');
var Utils = require('../utils/lib/utils');

exports.index = async function(req, res) {
  let user_id = req.query.user;
  var watched_list, promises;
  try {
    watched_list = await DataStoreUtils.getWatchedByUserId(user_id);
    promises = await watched_list.map(injectMediaJsonInWatched);
  } catch (err) {
    res.status(RequestStatus.BAD_REQUEST).json(err);
  }
  Promise.all(promises).then(function(results) {
    let filtered_results = Utils.filterWatchedMedia(results, req.query);
    res.status(RequestStatus.OK).send(filtered_results);
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

exports.watchEntireSeason = async function(req, res) {
  var seasonId = req.body.seasonId;
  var userId = req.body.userId;
  var timeSpent = req.body.time_spent;
  var date = req.body.date;
  var season = await DataStoreUtils.getMediaObjById(seasonId);
  var episodesIds = getSeasonsEpisodesIds([season]);
  // watched episodes
  watch_season_episodes(episodesIds[0], timeSpent, userId, date, function (result) {
    res.status(RequestStatus.OK).json(result);
  });
}

exports.watchSeason = async function(req, res) {
  var seasonId = req.body.seasonId;
  var userId = req.body.userId;
  var date = req.body.date;
  var timeSpent = req.body.time_spent;
  var season = await DataStoreUtils.getMediaObjById(seasonId);
  var episodesIds = getSeasonsEpisodesIds([season]);
  var watchedMediasIds = await getMediasIdsFromWatchedObjects(episodesIds, userId);
  var nonWatchedEpisodes = episodesIds[0].map((episode) => {
    if (!watchedMediasIds.includes(episode)) return episode;
  });
  watch_season_episodes(nonWatchedEpisodes, timeSpent, userId, date, function (result) {
    res.status(RequestStatus.OK).json(result);
  });
}

exports.unwatchSeason = async function(req, res) {
  var episodesIds = req.body.episodesIds;
  var userId = req.body.userId;
  var watchedsIds = await getWatchedIdsFromEpisodesIds(episodesIds, userId);
  var deleteWatchedPromises = watchedsIds.map(DataStoreUtils.deleteWatched);
  await Promise.all(deleteWatchedPromises).then((result) => {
    res.status(RequestStatus.OK).json(result);
  });
}

exports.watchEntireTvshow = async function(req, res) {
  var seasons = await Season.find({_tvshow_id: req.body.tvshowId});
  let userId = req.body.userId;
  var date = req.body.date;
  var timeSpent = req.body.time_spent;
  let seasonsEpisodesIds = getSeasonsEpisodesIds(seasons);
  var result = [];
  seasonsEpisodesIds.forEach(async (episodesIds) => {
    episodesIds = Array.from(new Set(episodesIds));
    watch_season_episodes(episodesIds, timeSpent, userId, date, function (response) {
      result.push(response);
    });
  });
  
  await Promise.all(result).then(() => {
    res.status(RequestStatus.OK).json("Tvshow watched.");
  });
}

exports.watchTvshow = async function(req, res) {
  var seasons = await Season.find({_tvshow_id: req.body.tvshowId});
  let userId = req.body.userId;
  var date = req.body.date;
  var timeSpent = req.body.time_spent;
  let seasonsEpisodesIds = getSeasonsEpisodesIds(seasons);
  var result = [];
  seasonsEpisodesIds.forEach(async (seasonEpisodeIds) => {
    seasonEpisodeIds = [seasonEpisodeIds];
    let watchedMediasIds = await getMediasIdsFromWatchedObjects(seasonEpisodeIds, userId);
    let nonWatchedEpisodes = seasonEpisodeIds[0].map((episode) => {
      if (!watchedMediasIds.includes(episode)) return episode;
    });
    watch_season_episodes(nonWatchedEpisodes, timeSpent, userId, date, function (response) {
      result.push(response);
    });
  });

  await Promise.all(result).then(() => {
    res.status(RequestStatus.OK).json("Tvshow watched.");
  });
}

exports.unwatchTvshow = async function(req, res) {
  let seasons = removeDuplicatedSeasons(req.body.seasons);
  var seasonsEpisodesIds = getSeasonsEpisodesIds(seasons);
  var deleteWatchedPromises = [];

  seasonsEpisodesIds.forEach(async (seasonEpisodeIds) => {
    let watchedIds = await getWatchedIdsFromEpisodesIds(seasonEpisodeIds, req.body.userId);
    let deleteSeasonWatchedPromises = watchedIds.map(DataStoreUtils.deleteWatched);
    deleteWatchedPromises.push(deleteSeasonWatchedPromises);
  });

  await Promise.all(deleteWatchedPromises).then((result) => {
    res.status(RequestStatus.OK).json(result);
  });
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
    let deletedWatched = await DataStoreUtils.deleteWatched(watchedId);
    res.status(RequestStatus.OK).json(deletedWatched);
  } catch (err) {
    console.log(err);
    res.status(RequestStatus.BAD_REQUEST).send(err);
  }
};

exports.seasonWatchedProgress = async function(req, res) {
  var seasonId = req.body.seasonId;
  var userId = req.body.userId;
  var season = await DataStoreUtils.getMediaObjById(seasonId);
  var episodesIds = getSeasonsEpisodesIds([season]);

  var watchedMediasIds = await getMediasIdsFromWatchedObjects(episodesIds, userId);

  var seasonProgress = {episodes_watched: 0, total_episodes: episodesIds[0].length, ratio: 0};
  episodesIds[0].forEach((episodeId,i) => {
    if (watchedMediasIds.includes(episodeId)) {
      seasonProgress.episodes_watched += 1;
    }
  });
  seasonProgress.ratio = seasonProgress.episodes_watched / seasonProgress.total_episodes;
  
  res.status(RequestStatus.OK).json(seasonProgress);
}

exports.tvshowWatchedProgress = async function(req, res) {
  var seasons = await Season.find({_tvshow_id: req.body.tvshowId});
  let userId = req.body.userId;
  let seasonsEpisodesIds = getSeasonsEpisodesIds(seasons);
  let tvshowProgress = {seasons: [], tvshow: {episodes_watched: 0, total_episodes: 0, ratio: 0}};

  seasonsEpisodesIds.forEach(async (seasonEpisodeIds) => {
    seasonEpisodeIds = [seasonEpisodeIds];
    let watchedMediasIds = await getMediasIdsFromWatchedObjects(seasonEpisodeIds, userId);
    let seasonProgress = {episodes_watched: 0, total_episodes: seasonEpisodeIds[0].length, ratio: 0};
    seasonEpisodeIds[0].forEach((episodeId,i) => {
      if (watchedMediasIds.includes(episodeId)) {
        seasonProgress.episodes_watched += 1;
      }
    });
    seasonProgress.ratio = seasonProgress.episodes_watched / seasonProgress.total_episodes;

    tvshowProgress.seasons.push(seasonProgress);
    tvshowProgress.tvshow.episodes_watched += seasonProgress.episodes_watched;
    tvshowProgress.tvshow.total_episodes += seasonEpisodeIds[0].length;
    tvshowProgress.tvshow.ratio += seasonProgress.ratio;

    if (tvshowProgress.seasons.length == seasons.length) {
      tvshowProgress.tvshow.ratio = tvshowProgress.tvshow.ratio / seasons.length;
      done();
    }
  });

  function done() {
    res.status(RequestStatus.OK).json(tvshowProgress);
  }
}

var injectMediaJsonInWatched = async function(watchedObj) {
  let mediaId = watchedObj._media;
  let mediaObj = await DataStoreUtils.getMediaObjById(mediaId);
  if (mediaObj.__t == 'Episode' && mediaObj._tmdb_tvshow_id){
    var value = await TMDBController.getSeason(mediaObj._tmdb_tvshow_id, mediaObj.season_number).then((season) => {
      var watched_with_full_media = watchedObj;
      watched_with_full_media._media = mediaObj;
      watched_with_full_media._media.helper = season;
      return watched_with_full_media;
    });
    return value;
  } else if (mediaObj.__t == 'Movie' && mediaObj._tmdb_id) {
    var value = await TMDBController.getMovie(mediaObj._tmdb_id).then((movie) => {
      var watched_with_full_media = watchedObj;
      watched_with_full_media._media = mediaObj;
      watched_with_full_media._media.helper = movie;
      return watched_with_full_media;
    });
    return value;
  }
  else {
    let watched_with_full_media = watchedObj;
    watched_with_full_media._media = mediaObj;
    return watched_with_full_media;
  }
};

var user_has_watched = async function(user_id, media_id) {
  return Watched.find({_user: user_id, _media: media_id}).exec();
}

async function getMediasIdsFromWatchedObjects(episodesIds, userId) {
  var watchedPromises = [];
  episodesIds.forEach((episodeId) => {
    watchedPromises.push(DataStoreUtils.getWatchedByUserIdAndMediaId(userId, episodeId));
  });
  var watcheds;
  await Promise.all(watchedPromises).then((result) => {
    watcheds = result;
  });
  
  var watchedMediasIds = watcheds[0].map(function (watched) {
    return watched._media.toString();
  });
  return watchedMediasIds;
}

async function getWatchedIdsFromEpisodesIds(episodesIds, userId) {
  var watchedPromises = [];
  episodesIds.forEach((episodeId) => {
    watchedPromises.push(DataStoreUtils.getWatchedByUserIdAndMediaId(userId, episodeId));
  });
  var watcheds;
  await Promise.all(watchedPromises).then((result) => {
    watcheds = result;
  });
  var watchedMediasIds = watcheds.map(function (watched) {
    return watched[0]._id;
  });
  return watchedMediasIds;
}

function removeDuplicatedSeasons(body) {
  let seasons = [];
  body.forEach((season) => {
    seasons[season.number] = season;
  });
  return seasons;
}

function getSeasonsEpisodesIds(seasons) {
  var seasonsEpisodesIds = [];
  seasons.forEach((season, i) => {
    seasonsEpisodesIds[i] = [];
    season._episodes.forEach((episode) => {

      if (seasonsEpisodesIds[i].indexOf(episode.toString()) < 0){
        seasonsEpisodesIds[i].push(episode.toString());
      }
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

async function watch_season_episodes(episodesIds, timeSpent, user_id, date, done) {
  var requests = 0;
  var payload = episodesIds.length;
  var response = [];
  episodesIds.forEach(async (episode) => {
    if (episode) {
      let watched = new Watched();
      watched._media = episode;
      watched._user = user_id;
      watched.date = date;
      watched.time_spent = timeSpent;
      let action = await DataStoreUtils.createAction(user_id, watched._id, ActionType.WATCHED);
      watched._action = action._id;
      await DataStoreUtils.addActionToUserHistory(user_id, action._id);
      watched.save()
      .then((watched) => {
        response.push(watched);
        requests++;
        if (requests == payload) return done(response);
      })
      .catch((error) => {
        requests++;
        if (requests == payload) return done(response);
      });
    } else {
      requests++;
      if (requests == payload) return done(response);
    }
  });
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

async function getWatchedIds(mediasIds) {
  let ids = [];
  let queries = 0;
  mediasIds.forEach(async(mediaId) => {
    let watched = DataStoreUtils.getWatchedByMediaId(mediaId);
    ids.push(watched);
    queries++;
    if (queries == mediasIds.length) return ids;
  });
}
