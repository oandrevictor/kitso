var Show = require('../models/TvShow');
var Season = require('../models/Season');
var Episode = require('../models/Episode');
var redis = require('redis');
var client = redis.createClient();
const https = require('https');

// Uma temporada
exports.show = function(req, res) {
  Show.findById(req.params.show_id)
  .catch((err) => {
      res.status(400).send(err);
  })
  .then(async function(result) {
    if(!result) {
      res.status(404).send("Season not found!");
    } else {
      tmdb_id = result._tmdb_id;
      season_num = req.params.season_num;
      query = "tvShow/"+ tmdb_id + "/season/" + season_num;
      season = await getSeason(season_num);

      client.exists(query,function(err, reply) {
        if (reply == 1) {
          console.log('exists');
          client.get(query, async function(err,data) {
              if(err)
                console.log(err)
              else{
                console.log('got query from redis');
                promises = await season._episodes.map(inject_episodes);

                Promise.all(promises).then(function(results) {
                  var parsed_result = JSON.parse(JSON.parse(data));
                  parsed_result._episodes = results;
                  // parsed_result.poster_path = "https://image.tmdb.org/t/p/w500/" + parsed_result.poster_path;
                  parsed_result._id = season._id;
                  parsed_result.__t = season.__t;
                  // parsed_result.backdrop_path = "https://image.tmdb.org/t/p/original/" + parsed_result.backdrop_path;
                  res.setHeader('Content-Type', 'application/json');
                  res.status(200).send(parsed_result);
                });
              }
            });
        } else {
          getSeasonFromTMDB(tmdb_id, season_num).then(async function(data) {
            promises = await season._episodes.map(inject_episodes);

            Promise.all(promises).then(function(results) {
              string = JSON.stringify(data);
              dataJson = JSON.parse(string)
              dataJson._episodes = results;
              dataJson._id = season._id;
              dataJson.__t = season.__t;
              res.status(200).send(dataJson);
            });
          })}
      });
    }
  });
};

inject_episodes = function(episode) {
  return Episode.findById(episode).exec();
}

getSeason = function(num) {
  return Season.findOne({ number: num}).exec();
}

// Deletar temporada
exports.delete = function(req, res) {
    Season.remove({ _id: req.params.season_id})
    .catch((err) => {
        res.status(400).send(err);
    })
    .then(() => {
        res.status(200).send('Season removed.');
    });
};

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
        client.set(query, JSON.stringify(data));
        resolve(data)
      });

    }).on("error", (err) => {
      console.log("Error: " + err.message);
      reject();
    });
  })
}