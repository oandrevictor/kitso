var Show = require('../models/TvShow');
var Season = require('../models/Season');
var Episode = require('../models/Episode');
var redis = require('redis');
var client = redis.createClient();
const https = require('https');

// Uma episodio
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

      client.exists(query, function(err, reply) {
        if (reply = 1) {
          console.log('exists');
          client.get(query,(err,data)=>{
              if(err)
                console.log(err)
              else{
                console.log('got query from redis');
                console.log(data);
                //var parsed_result = JSON.parse(JSON.parse(data));
                // parsed_result._seasons = result._seasons;
                // parsed_result.poster_path = "https://image.tmdb.org/t/p/w500/" + parsed_result.poster_path;
                // parsed_result._id = result._id;
                // parsed_result.__t = result.__t;
                // parsed_result.backdrop_path = "https://image.tmdb.org/t/p/original/" + parsed_result.backdrop_path;
                res.setHeader('Content-Type', 'application/json');
                res.status(200).send(data);
              }
            });
        } else {
          getEpisodeFromTMDB(tmdb_id, season, episode).then((data) => {
            string = JSON.stringify(data);
            dataJson = JSON.parse(string)
            //dataJson._seasons = result._seasons;
            //dataJson._id = result._id;
            //dataJson.__t = result.__t;
            res.status(200).send(dataJson)
          })}
      });
    });
};

inject_seasons = async function(season) {
  return await Season.findById(season).exec();
}

getEpisodeFromTMDB = function(tmdb_id, season, episode){
  return new Promise(function(resolve, reject) {
    query = "tvShow/"+ tmdb_id + "/season/" + season + "/episode/" + episode
    console.log("Could not get from redis, requesting info from The Movie DB")
    https.get("https://api.themoviedb.org/3/tv/"+ tmdb_id + "/season/" + season + "/episode/" + episode + "?api_key=db00a671b1c278cd4fa362827dd02620", (resp) => {
      let data = '';
      resp.on('data', (chunk) => {
        data += chunk;
      });
      resp.on('end', () => {
        console.log("saving result tso redis: " + query)
        client.set(query, JSON.stringify(data));
        resolve(data)
      });

    }).on("error", (err) => {
      console.log("Error: " + err.message);
      reject();
    });
  })
}