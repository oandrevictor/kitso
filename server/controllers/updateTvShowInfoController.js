var RequestStatus = require('../constants/requestStatus');
var RequestGenerals = require('../constants/requestGenerals');


exports.update = function(req, res) {
  try {
    of(req.body._tvshow_id);
    res.status(RequestStatus.OK).send();
  } catch (err) {
    console.log(err);
    res.status(RequestStatus.BAD_REQUEST).send(err);
  }
};


let TvShow = require('../models/TvShow');
let TMDBCtrl = require('../external/TMDBController');
let Episode = require('../models/Episode');
let RedisClient = require('../utils/lib/redisClient');
const redisClient = RedisClient.createAndAuthClient();
let TMDBConstants = require('../external/constants/TMDBConstants');
const https = require('https');
let DataStoreUtils = require('../utils/lib/dataStoreUtils');
let TvShowController = require('../controllers/tvShowController');


of = async function (tvShowId) {
  let tvShow = await TvShow.findById(tvShowId).exec();
  let tmdbId = tvShow._tmdb_id;
  

  let fromRedis = await TMDBCtrl.getShow(tmdbId);
  let beforeUpdating = {
    number_of_episodes: fromRedis.number_of_episodes,
    number_of_seasons: fromRedis.number_of_seasons
  };

  let respTMDB = await TMDBCtrl.getShowFromTMDB(tmdbId);
  respTMDB = JSON.parse(respTMDB);
  
  // Checking if there is more episodes for the last season saved in DB
  // if (respTMDB.number_of_episodes !== beforeUpdating.number_of_episodes) {
  if (true) {
    let seasons = await Season.find({_tvshow_id: tvShowId}).exec(); //TODO move to datastoreutils
    seasons.sort(function compare(s1, s2) {
      if (s1.number < s2.number)
        return -1;
      if (s1.number > s2.number)
        return 1;
      return 0;
    });
    let lastSeason = seasons[seasons.length - 1];
    let numberLastSeason = lastSeason.number;
    
    let lastSeasonEpisodes = await Episode
      .find({_tvshow_id: tvShowId, season_number: numberLastSeason})
      .exec();
    lastSeasonEpisodes.sort(function compare(s1, s2) {
      if (s1.number < s2.number)
        return -1;
      if (s1.number > s2.number)
        return 1;
      return 0;
    });
    let lastSeasonEpisode = lastSeasonEpisodes[lastSeasonEpisodes.length - 1];
    let numberLastSeasonEpisode = lastSeasonEpisode.number;
    
    let lastSeasonFromTMDB = await getSeasonFromAPII(tmdbId, numberLastSeason);
    lastSeasonFromTMDB = JSON.parse(lastSeasonFromTMDB);

    let lastSeasonEpisodesFromTBMDb = lastSeasonFromTMDB.episodes;
    lastSeasonEpisodesFromTBMDb.sort(function compare(e1, e2) {
      if (e1.episode_number < e2.episode_number)
        return -1;
      if (e1.episode_number > e2.episode_number)
        return 1;
      return 0;
    });
    let lastSeasonEpisodeFromTMDB = lastSeasonEpisodesFromTBMDb[lastSeasonEpisodesFromTBMDb.length - 1];
    let numberLastSeasonEpisodeFromTMDB = lastSeasonEpisodeFromTMDB.episode_number;
    
    if (numberLastSeasonEpisode < numberLastSeasonEpisodeFromTMDB) {
      //comece a criar a partir do primeiro dps do ultimo no bd
      lastSeasonEpisodesFromTBMDb.forEach(async function (episode) {
        var tmdb_id = episode.id;
        var name = episode.name;
        var db_episode;
    
        let hasEpisode = await DataStoreUtils.findEpisodeByTmdbId(tmdb_id);
    
        if (hasEpisode.length === 0) {
          db_episode = new Episode();
          db_episode._tvshow_id = lastSeason._tvshow_id;
          db_episode._season_id = lastSeason._id;
          db_episode._tmdb_tvshow_id = tvShowId;
          db_episode.season_number = numberLastSeason;
          db_episode.name = name;
          db_episode._tmdb_id = tmdb_id;
          db_episode.number = episode.episode_number;
          db_episode.save()
            .then((created) => {
              console.log('Created Ep: ' + created.name);
              lastSeason._episodes.push(created._id);
              lastSeason.save()
                .then((saved_season) => {})
                .catch((err) => {
                  console.log(err);
                  throw new Error(err);
                })
            })
            .catch((err) => {
              console.log(err);
              throw new Error(err);
            });
        }
      });
    }
  
    // pode ser que tenha criado uma nova season
    if (respTMDB.number_of_seasons > beforeUpdating.number_of_seasons) {
      respTMDB._id = tvShow._id;
      respTMDB._seasons = tvShow._seasons;
      respTMDB.__t = tvShow.__t;
      setTimeout(function() {
        TvShowController.matchApiSeasonsToDb(respTMDB, tvShow);
        }, 5000);
    }
  }
  
  let query = RequestGenerals.TVSHOW_ENDPOINT + tmdbId;
  // if (!(respTMDB.status_code && respTMDB.status_code == 25)) {
  //   redisClient.set(query, JSON.stringify(respTMDB));
  // }
  respTMDB.poster_path = TMDBConstants.TMDB_POSTER_IMAGE_PATH + String(respTMDB.poster_path);
  respTMDB.backdrop_path = TMDBConstants.TMDB_BACK_IMAGE_PATH + respTMDB.backdrop_path;
  redisClient.set(query, JSON.stringify(respTMDB));
};


// TODO: refact in tmdbctrl
getSeasonFromAPII = function (tv_id, season_number) {
  return new Promise(function(resolve, reject) {
    let query = RequestGenerals.TVSHOW_ENDPOINT + tv_id + RequestGenerals.SEASON_ENDPOINT + season_number;
    let tmdbQuery = TMDBConstants.TMDB_API_SHOW_ROUTE + tv_id + RequestGenerals.SEASON_ENDPOINT + season_number + TMDBConstants.TMDB_API_KEY;
    https.get(tmdbQuery,
      (resp) => {
        let data = '';
        resp.on('data', (chunk) => {
          data += chunk;
        });
        resp.on('end', () => {
          let received_data = JSON.parse(data);
          if (!(received_data.status_code && received_data.status_code === 25)) {
            console.log("GET SEASON| Saving on redis: " + query);
            redisClient.set(query, JSON.stringify(data));
          }
          resolve(data)
        });
      }).on("error", (err) => {
      console.log("Error: " + err.message);
      reject();
    });
  });
};
