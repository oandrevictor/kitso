var RequestStatus = require('../constants/requestStatus');
var RequestGenerals = require('../constants/requestGenerals');
let TMDBCtrl = require('../external/TMDBController');
let Episode = require('../models/Episode');
let TMDBConstants = require('../external/constants/TMDBConstants');
let DataStoreUtils = require('../utils/lib/dataStoreUtils');
let TvShowController = require('../controllers/tvShowController');
let Utils = require('../utils/lib/utils');
let RedisClient = require('../utils/lib/redisClient');
const redisClient = RedisClient.createAndAuthClient();

exports.update = async function(req, res) {
  try {
    await settingUpdatedInfo(req.body._tvshow_id);
    res.status(RequestStatus.OK).send();
  } catch (err) {
    console.log(err);
    res.status(RequestStatus.BAD_REQUEST).send(err);
  }
};

settingUpdatedInfo = async function (tvShowId) {
  let tvShow = await DataStoreUtils.getTvShowById(tvShowId);
  let tmdbId = tvShow._tmdb_id;
  
  let fromRedis = await TMDBCtrl.getShow(tmdbId);
  let beforeUpdating = {
    number_of_episodes: fromRedis.number_of_episodes,
    number_of_seasons: fromRedis.number_of_seasons
  };

  let respTMDB = await TMDBCtrl.getShowFromTMDB(tmdbId);
  respTMDB = JSON.parse(respTMDB);
  
  // Checking if there is more episodes for the last season saved in DB
  if (respTMDB.number_of_episodes !== beforeUpdating.number_of_episodes) {
    let seasons = await DataStoreUtils.findSeasonsByTvShowId(tvShowId);
    seasons.sort(Utils.sortSeasonsBySeasonNumber);
    let lastSeason = seasons[seasons.length - 1];
    let numberLastSeason = lastSeason.number;
    let lastSeasonEpisodes = await DataStoreUtils.findEpisodesByTmdbAndSeasonNumber(tvShowId, numberLastSeason);
    lastSeasonEpisodes.sort(Utils.sortEpisodesByEpisodeNumber);
    let lastSeasonEpisode = lastSeasonEpisodes[lastSeasonEpisodes.length - 1];
    let numberLastSeasonEpisode = lastSeasonEpisode.number;
    
    let lastSeasonFromTMDB = await TMDBCtrl.getSeasonFromAPI(tmdbId, numberLastSeason);
    lastSeasonFromTMDB = JSON.parse(lastSeasonFromTMDB);
    let lastSeasonEpisodesFromTBMDb = lastSeasonFromTMDB.episodes;
    lastSeasonEpisodesFromTBMDb.sort(TMDBCtrl.sortEpisodesByEpisodeNumber);
    let lastSeasonEpisodeFromTMDB = lastSeasonEpisodesFromTBMDb[lastSeasonEpisodesFromTBMDb.length - 1];
    let numberLastSeasonEpisodeFromTMDB = lastSeasonEpisodeFromTMDB.episode_number;
    
    if (numberLastSeasonEpisode < numberLastSeasonEpisodeFromTMDB) {
      // Creating episodes from the first after the last saved in DB
      lastSeasonEpisodesFromTBMDb.forEach(async function (episode) {
        let episodeTmdbId = episode.id;
        let episodes = await DataStoreUtils.findEpisodeByTmdbId(episodeTmdbId);
        let hasEpisode = episodes.length !== 0;
        if (!hasEpisode) {
          try {
            storeNewEpisode(lastSeason, tvShowId, numberLastSeason, episode.name, episodeTmdbId, episode.episode_number);
          } catch (err) {
            console.log(err);
          }
        }
      });
    }
  
    // Check if there is a new season not saved in DB
    if (respTMDB.number_of_seasons > beforeUpdating.number_of_seasons) {
      respTMDB._id = tvShow._id;
      respTMDB._seasons = tvShow._seasons;
      respTMDB.__t = tvShow.__t;
      setTimeout(function() {
        TvShowController.matchApiSeasonsToDb(respTMDB, tvShow);
        }, 5000);
    }
  }
  
  respTMDB.poster_path = TMDBConstants.TMDB_POSTER_IMAGE_PATH + String(respTMDB.poster_path);
  respTMDB.backdrop_path = TMDBConstants.TMDB_BACK_IMAGE_PATH + respTMDB.backdrop_path;
  let query = RequestGenerals.TVSHOW_ENDPOINT + tmdbId;
  redisClient.set(query, JSON.stringify(respTMDB));
};

storeNewEpisode = function(lastSeason, tvShowId, numberLastSeason, episodeName, episodeTmdbId, episodeNumber) {
  let db_episode = new Episode();
  db_episode._tvshow_id = lastSeason._tvshow_id;
  db_episode._season_id = lastSeason._id;
  db_episode._tmdb_tvshow_id = tvShowId;
  db_episode.season_number = numberLastSeason;
  db_episode.name = episodeName;
  db_episode._tmdb_id = episodeTmdbId;
  db_episode.number = episodeNumber;
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
};
