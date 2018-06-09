var Show = require('../models/TvShow');
var TMDBController = require('../external/TMDBController');
var RedisClient = require('../utils/lib/redisClient');
var TMDBController = require('../external/TMDBController');
const redisClient = RedisClient.createAndAuthClient();
const https = require('https');


exports.show = function(req, res) {
  Show.findById(req.params.show_id)
  .catch((err) => {
    res.status(400).send(err);
  })
  .then((result) => {
    tmdb_id = result._tmdb_id;
    season = req.params.season_num;
    episode = req.params.episode_num;
    query = "tvShow/"+ tmdb_id + "/season/" + season + "/episode/" + episode;

    redisClient.exists(query, function(err, reply) {
      if (reply == 1) {
        console.log('exists');
        redisClient.get(query,(err,data)=>{
          if(err)
          console.log(err)
          else{
            console.log('Got query from redis');
            console.log(data);
            var parsed_result = JSON.parse(JSON.parse(data));
            parsed_result._seasons = result._seasons;
            parsed_result.poster_path = "https://image.tmdb.org/t/p/w500/" + parsed_result.poster_path;
            parsed_result._id = result._id;
            parsed_result.__t = result.__t;
            parsed_result.backdrop_path = "https://image.tmdb.org/t/p/original/" + parsed_result.backdrop_path;
            res.setHeader('Content-Type', 'application/json');
            res.status(200).send(parsed_result);
          }
        });
      } else {
        TMDBController.getEpisodeFromTMDB(tmdb_id, season, episode).then((data) => {
          string = JSON.stringify(data);
          dataJson = JSON.parse(string);
          dataJson.poster_path = "https://image.tmdb.org/t/p/w500/" + dataJson.poster_path;
          dataJson.backdrop_path = "https://image.tmdb.org/t/p/original/" + dataJson.backdrop_path;
          dataJson._seasons = result._seasons;
          dataJson._id = result._id;
          dataJson.__t = result.__t;
          res.status(200).send(dataJson)
        })}
      });
    });
  };
