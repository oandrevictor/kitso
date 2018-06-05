var Show = require('../models/TvShow');
var Season = require('../models/Season');
var Episode = require('../models/Episode');
var RequestStatus = require('../constants/requestStatus');
const https = require('https');
var RedisClient = require('../utils/lib/redisClient');
var redisClient = RedisClient.createAndAuthClient();

exports.show = function(req, res) {
  Show.findById(req.params.show_id)
  .catch((err) => {
      res.status(RequestStatus.BAD_REQUEST).send(err);
  })
  .then(async function(result) {
    if(!result) {
      res.status(RequestStatus.NOT_FOUND).send("Season not found!");
    } else {
      tmdb_id = result._tmdb_id;
      season_num = req.params.season_num;
      query = "tvShow/"+ tmdb_id + "/season/" + season_num;
      season = await getSeason(result._id, season_num);

      redisClient.exists(query,function(err, reply) {
        if (reply == 1) {
          console.log('exists');
          redisClient.get(query, async function(err,data) {
              if(err)
                console.log(err)
              else{
                console.log('got query from redis:' + query);
                var parsed_result = JSON.parse(JSON.parse(data));
                let promises = parsed_result.episodes.map(injectEpisodeId(season._id));

                Promise.all(promises).then(function(results) {
                  parsed_result.episodes = results;
                  parsed_result._id = season._id;
                  parsed_result.__t = season.__t;
                  parsed_result.poster_path = "https://image.tmdb.org/t/p/w500/" + parsed_result.poster_path;
                  parsed_result.backdrop_path = "https://image.tmdb.org/t/p/original/" + parsed_result.backdrop_path;
                  res.setHeader('Content-Type', 'application/json');
                  res.status(RequestStatus.OK).send(parsed_result);
                });
              }
            });
        } else {
          getSeasonFromTMDB(tmdb_id, season_num).then(async function(data) {
            dataJson = JSON.parse(data);
            let promises = dataJson.episodes.map(injectEpisodeId(season._id));

            Promise.all(promises).then(function(results) {
              dataJson.episodes = results;
              dataJson._id = season._id;
              dataJson.__t = season.__t;
              dataJson.poster_path = "https://image.tmdb.org/t/p/w500/" + data.poster_path;
              dataJson.backdrop_path = "https://image.tmdb.org/t/p/original/" + data.backdrop_path;
              res.status(RequestStatus.OK).send(dataJson);
            });
          })}
      });
    }
  });
};

exports.delete = function(req, res) {
    Season.remove({ _id: req.params.season_id})
    .catch((err) => {
        res.status(RequestStatus.BAD_REQUEST).send(err);
    })
    .then(() => {
        res.status(RequestStatus.OK).send('Season removed.');
    });
};


// AUXILIARY FUNCTIONS ============================================================================

// TODO: move to TMDBController
getSeasonFromTMDB = function(tmdb_id, season){
  return new Promise(function(resolve, reject) {
    query = "tvShow/"+ tmdb_id + "/season/" + season
    console.log("Could not get from redis, requesting info from The Movie DB")
    https.get("https://api.themoviedb.org/3/tv/"+ tmdb_id + "/season/" + season + "?api_key=db00a671b1c278cd4fa362827dd02620", (resp) => {
      let data = '';
      resp.on('data', (chunk) => {
        data += chunk;
      });
      resp.on('end', () => {
        console.log("saving result tso redis: " + query)
        redisClient.set(query, JSON.stringify(data));
        resolve(data)
      });

    }).on("error", (err) => {
      console.log("Error: " + err.message);
      reject();
    });
  })
};

// TODO: move to TMDBController
injectEpisodeId = function(season) {
  return async function(episode){
    episode_obj = await Episode.findOne({ _season_id: season, number: episode.episode_number}).exec();

    episode_with_id = episode;
    episode_with_id._id = episode_obj._id;

    return episode_with_id;
  }
};

// TODO: move to TMDBController
getSeason = function (show, num) {
    return Season.findOne({_tvshow_id: show, number: num}).exec();
};