var TvShow = require('../models/TvShow');
const https = require('https');
var redis = require('redis');
var client = redis.createClient();


// Um filme
exports.show = function(req, res) {
    TvShow.findById(req.params.movie_id)
    .catch((err) => {
        res.status(400).send(err);
    })
    .then((result) => {
      tmdb_id = result._tmdb_id;
      client.exists('tvshow/' + tmdb_id, function(err, reply) {
        if (reply === 1) {
            console.log('exists');
            query = 'tvshow/' + tmdb_id
            client.get(query,(err,data)=>{
                if(err)
                  console.log(err)
                else{
                  console.log([message,data]);
                  res.status(200).json(data);
                }
              });
        } else {
          //Não existe, salvarconst https = require('https');
          https.get("https://api.themoviedb.org/3/tv/"+ tmdb_id + "?api_key=db00a671b1c278cd4fa362827dd02620", (resp) => {
            let data = '';
            // A chunk of data has been recieved.
            resp.on('data', (chunk) => {
              data += chunk;
            });

            // The whole response has been received. Print out the result.
            resp.on('end', () => {
              console.log(JSON.parse(data).explanation);
            });

          }).on("error", (err) => {
            console.log("Error: " + err.message);
          });

            console.log('doesn\'t exist');
        }
      });
    });
};
