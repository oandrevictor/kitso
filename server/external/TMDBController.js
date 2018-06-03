var TMDBConstants = require('./constants/TMDBConstants');
var RequestGenerals = require('../constants/requestGenerals');
var RedisClient = require('../utils/lib/redisClient');

const https = require('https');
const redisClient = RedisClient.createAndAuthClient();

exports.getShowFromTMDB = function(tmdb_id) {
    return new Promise(function(resolve, reject) {

        console.log("Could not get from redis, requesting info from The Movie DB");

        var query = RequestGenerals.TVSHOW_ENDPOINT + tmdb_id;
        https.get(TMDBConstants.TMDB_API_ROUTE + tmdb_id + TMDBConstants.TMDB_API_KEY,
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

