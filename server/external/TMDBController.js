var TMDBConstants = require('./constants/TMDBConstants');
var RequestGenerals = require('../constants/requestGenerals');
var RedisClient = require('../utils/lib/redisClient');

const https = require('https');
const redisClient = RedisClient.createAndAuthClient();

exports.getShowFromTMDB = function(tmdb_id) {
    return new Promise(function(resolve, reject) {

        console.log("Could not get from redis, requesting info from The Movie DB");

        var query = RequestGenerals.TVSHOW_ENDPOINT + tmdb_id;
        let tmdbQuery = TMDBConstants.TMDB_API_ROUTE + tmdb_id + TMDBConstants.TMDB_API_KEY;
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
        let tmdbQuery = TMDBConstants.TMDB_API_ROUTE + tv_id + RequestGenerals.SEASON_ENDPOINT + season_number + TMDBConstants.TMDB_API_KEY;
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
    })
};