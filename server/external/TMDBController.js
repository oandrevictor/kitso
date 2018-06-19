var TMDBConstants = require('./constants/TMDBConstants');
var RequestGenerals = require('../constants/requestGenerals');
var RedisClient = require('../utils/lib/redisClient');
var Show = require('../models/TvShow');
var Movie = require('../models/Movie');
var Episode = require('../models/Episode');


const https = require('https');
const redisClient = RedisClient.createAndAuthClient();

exports.getShowFromTMDB = function(tmdb_id) {
  return new Promise(function(resolve, reject) {

    console.log("Could not get from redis, requesting info from The Movie DB");

    var query = RequestGenerals.TVSHOW_ENDPOINT + tmdb_id;
    let tmdbQuery = TMDBConstants.TMDB_API_SHOW_ROUTE + tmdb_id + TMDBConstants.TMDB_API_KEY + TMDBConstants.TMDB_API_MEDIA_RECOMMENDATIONS;
    console.log(tmdbQuery)
    https.get(tmdbQuery,
      (resp) => {
        let data = '';
        resp.on('data', (chunk) => {
          data += chunk;
        });
        resp.on('end', () => {
          console.log("Saving result to redis: "+ query);
          redisClient.set(query, JSON.stringify(data));
          resolve(data)
        });
      }).on("error", (err) => {
        console.log("Error: " + err.message);
        reject();
      });
    })
  };

exports.getSeasonFromAPI = function(tv_id, season_number){
  return new Promise(function(resolve, reject) {

    var query =  RequestGenerals.TVSHOW_ENDPOINT + tv_id + RequestGenerals.SEASON_ENDPOINT + season_number;
    let tmdbQuery = TMDBConstants.TMDB_API_SHOW_ROUTE + tv_id + RequestGenerals.SEASON_ENDPOINT + season_number + TMDBConstants.TMDB_API_KEY;
    redisClient.exists(query, function(err, reply) {
      if (reply === 1) {
        console.log("got query from redis: " + query)
        redisClient.get(query, async function(err,data) {
          if (err)
          console.log(err);
          else {
            var parsed_result = JSON.parse(JSON.parse(data));
            parsed_result.backdrop_path = TMDBConstants.TMDB_BACK_IMAGE_PATH + parsed_result.backdrop_path;
            resolve(JSON.stringify(parsed_result));
          }
        });
      }
      else{
        https.get(tmdbQuery,
          (resp) => {
            let data = '';
            resp.on('data', (chunk) => {
              data += chunk;
            });
            resp.on('end', () => {
              console.log("Saving season result to redis: "+  query);
              redisClient.set(query, JSON.stringify(data));
              resolve(data)
            });
          }).on("error", (err) => {
            console.log("Error: " + err.message);
            reject();
          });
        }
      })
    })
  };

exports.getShow = function(tmdb_id){
  return new Promise(function(resolve, reject) {
    console.log("Get show:" + tmdb_id)
    Show.find({_tmdb_id: tmdb_id}).catch((err)=> console.log(err)). then(async (result)=>{
      var query = RequestGenerals.TVSHOW_ENDPOINT + tmdb_id;
      redisClient.exists(query, function(err, reply) {
        if (reply === 1) {
          console.log("got query from redis: " + query)
          redisClient.get(query, async function(err,data) {
            if (err)
            console.log(err);
            else {
              var parsed_result = JSON.parse(JSON.parse(data));
              parsed_result.backdrop_path = TMDBConstants.TMDB_BACK_IMAGE_PATH + parsed_result.backdrop_path;
              resolve(parsed_result);
            }
          });
        } else {
          exports.getShowFromTMDB(tmdb_id).then(async function(data) {
            var data = JSON.parse(data);
            data._id = result._id;
            data.__t = result.__t;
            resolve(data);
          })
        }
      })
    })
  })
}

exports.getMovie = function(tmdb_id) {
  return new Promise(function(resolve, reject) {
    console.log("Get movie:" + tmdb_id)
    Movie.find({_tmdb_id: tmdb_id}).catch((err)=> console.log(err)). then(async (result)=>{
      var query = RequestGenerals.MOVIE_ENDPOINT + tmdb_id;
      redisClient.exists(query, function(err, reply) {
        if (reply === 1) {
          console.log("got query from redis: " + query)
          redisClient.get(query, async function(err,data) {
            if (err)
            console.log(err);
            else {
              var parsed_result = JSON.parse(JSON.parse(data));
              parsed_result.backdrop_path = TMDBConstants.TMDB_BACK_IMAGE_PATH + parsed_result.backdrop_path;
              resolve(parsed_result);
            }
          });
        } else {
          exports.getMovieFromTMDB(tmdb_id).then(async function(data) {
            var data = JSON.parse(data);
            data._id = result._id;
            data.__t = result.__t;
            resolve(data);
          })
        }
      })
    })
  });
};

exports.getEpisode = function(tmdb_id){
  return new Promise(function(resolve, reject) {
    console.log("Get episode:" + tmdb_id)
    Episode.findOne({_tmdb_id: tmdb_id})
    .catch((err)=> console.log(err))
    .then(async (result)=>{
      var db_ep = result;
      var query = RequestGenerals.TVSHOW_ENDPOINT + db_ep._tmdb_tvshow_id+ RequestGenerals.SEASON_ENDPOINT + db_ep.season_number + '/' + db_ep.number;
      redisClient.exists(query, function(err, reply) {
        if (reply === 1) {
          console.log("got query from redis: " + query)
          redisClient.get(query, async function(err,data) {
            if (err)
            console.log(err);
            else {
              var parsed_result = JSON.parse(data);
              parsed_result.backdrop_path = TMDBConstants.TMDB_BACK_IMAGE_PATH + parsed_result.still_path;
              resolve(parsed_result);
            }
          });
        } else {
          console.log("Could not get from redis")
          exports.getEpisodeFromTMDB(result._tmdb_tvshow_id, result.season_number, result.number).then(async function(data) {
            var data = JSON.parse(data);
            data._id = result._id;
            data.__t = result.__t;
            console.log("Saving to redis:" + query)
            redisClient.set(query, JSON.stringify(data));
            resolve(data);
          })
        }
      })
    })
  })

}

exports.getMovieFromTMDB = function(tmdb_id){
  return new Promise(function(resolve, reject) {
    console.log("Could not get from redis, requesting info from The Movie DB")

    var query = RequestGenerals.MOVIE_ENDPOINT + tmdb_id;
    let tmdbQuery = TMDBConstants.TMDB_API_MOVIE_ROUTE + tmdb_id + TMDBConstants.TMDB_API_KEY + TMDBConstants.TMDB_API_MEDIA_RECOMMENDATIONS;
    console.log(tmdbQuery)
    https.get(tmdbQuery,
      (resp) => {
        let data = '';
        resp.on('data', (chunk) => {
          data += chunk;
        });
        resp.on('end', () => {
          console.log("Saving result to redis: "+ query);
          redisClient.set(query, JSON.stringify(data));
          resolve(data)
        });
      }).on("error", (err) => {
        console.log("Error: " + err.message);
        reject();
      });
    })
  };

exports.getEpisodeFromTMDB = function(tmdb_id, season, episode){
  return new Promise(function(resolve, reject) {
    var query = "tvshow/"+ tmdb_id + "/season/" + season + "/" + episode
    console.log("Could not get from redis, requesting info from The Movie DB")
    https.get("https://api.themoviedb.org/3/tv/"+ tmdb_id + "/season/" + season + "/episode/" + episode + "?api_key=db00a671b1c278cd4fa362827dd02620", (resp) => {
      let data = '';
      resp.on('data', (chunk) => {
        data += chunk;
      });
      resp.on('end', () => {
        console.log("saving result to redis: " + query)
        redisClient.set(query, JSON.stringify(data));
        resolve(data)
      });

    }).on("error", (err) => {
      console.log("Error: " + err.message);
      reject();
    });
  })
};
