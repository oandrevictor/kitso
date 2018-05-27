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
      season = await getSeason(result._id, season_num);

      client.exists(query,function(err, reply) {
        if (reply == 1) {
          console.log('exists');
          client.get(query, async function(err,data) {
              if(err)
                console.log(err)
              else{
                console.log('got query from redis');
                var parsed_result = JSON.parse(JSON.parse(data));
                let promises = parsed_result.episodes.map(inject_episode_ip(season._id));

                Promise.all(promises).then(function(results) {
                  parsed_result.episodes = results;
                  parsed_result._id = season._id;
                  parsed_result.__t = season.__t;
                  parsed_result.poster_path = "https://image.tmdb.org/t/p/w500/" + parsed_result.poster_path;
                  parsed_result.backdrop_path = "https://image.tmdb.org/t/p/w500/" + parsed_result.backdrop_path;
                  res.setHeader('Content-Type', 'application/json');
                  res.status(200).send(parsed_result);
                });
              }
            });
        } else {
          getSeasonFromTMDB(tmdb_id, season_num).then(async function(data) {
            dataJson = JSON.parse(data);
            let promises = dataJson.episodes.map(inject_episode_ip(season._id));

            Promise.all(promises).then(function(results) {
              dataJson.episodes = results;
              dataJson._id = season._id;
              dataJson.__t = season.__t;
              dataJson.poster_path = "https://image.tmdb.org/t/p/w500/" + data.poster_path;
              dataJson.backdrop_path = "https://image.tmdb.org/t/p/original/" + data.backdrop_path;
              res.status(200).send(dataJson);
            });
          })}
      });
    }
  });
};

inject_episode_ip = function(season) {
  return async function(episode){
    console.log(episode);
    console.log(season);
    console.log(episode.episode_number)
    episode_obj = await Episode.findOne({ _season_id: season, number: episode.episode_number}).exec();

    episode_with_id = episode;
    episode_with_id._id = episode_obj._id;

    return episode_with_id;
  }
}

getSeason = function(show, num) {
  return Season.findOne({ _tvshow_id: show, number: num}).exec();
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
