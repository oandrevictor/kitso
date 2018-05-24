var Show = require('../models/TvShow');
var redis = require('redis');
var client = redis.createClient();
const https = require('https');



// Todas as séries
exports.index = function(req, res) {
    Show.find({})
    .catch((err) => {
        res.status(400).send(err);
    })
    .then((result) => {
        res.status(200).json(result);
    });
};

// Uma série
exports.show = function(req, res) {
    Show.findById(req.params.show_id)
    .catch((err) => {
        res.status(400).send(err);
    })
    .then((result) => {
      console.log(result)
      tmdb_id = result._tmdb_id;
      query = 'tvshow/' + tmdb_id
      client.exists('tvshow/' + tmdb_id, function(err, reply) {
        if (reply === 1) {
            console.log('exists');
            client.get(query,(err,data)=>{
                if(err)
                  console.log(err)
                else{
                  console.log('got query from redis');
                  parsed_data = JSON.parse(data)
                  res.setHeader('Content-Type', 'application/json');
                  res.status(200).send(parsed_data);
                }
              });
        } else {
          console.log("Could not get from redis, requesting info from The Movie DB")
          https.get("https://api.themoviedb.org/3/tv/"+ tmdb_id + "?api_key=db00a671b1c278cd4fa362827dd02620", (resp) => {
            let data = '';
            // A chunk of data has been recieved.
            resp.on('data', (chunk) => {
              data += chunk;
            });
            // The whole response has been received. Print out the result.
            resp.on('end', () => {
            console.log("saving result to redis")
            client.set(query, JSON.stringify(data));
            res.status(200).send(data);
            });

          }).on("error", (err) => {
            console.log("Error: " + err.message);
          });

            console.log('doesn\'t exist');
        }
      });
    });
};


// Criar série
exports.create = function(req, res) {
    var show = new Show(req.body);

    show.save()
    .catch((err) => {
        res.status(400).send(err);
    })
    .then((createdShow) => {
        res.status(200).send(createdShow);
    });
};

// Editar série
exports.update = function(req, res) {
    Show.findById(req.params.show_id)
    .catch((err) => {
        res.status(400).send(err);
    })
    .then((show) => {
        if (req.body.name) show.name = req.body.name;
        if (req.body.overview) show.overview = req.body.overview;
        if (req.body.release_date) show.release_date = req.body.release_date;
        if (req.body._directors) show._directors = req.body._directors;
        if (req.body._actors) show._actors = req.body._actors;
        if (req.body.imdb_id) show.imdb_id = req.body.imdb_id;
        if (req.body.genres) show.genres = req.body.genres;
        if (req.body.images) show.images = req.body.images;
        if (req.body.seasons) show.seasons = req.body.seasons;


        show.save()
        .catch((err) => {
            res.status(400).send(err);
        })
        .then((updatedShow) => {
            res.status(200).json(updatedShow);
        });
    });
};

// Deletar série
exports.delete = function(req, res) {
    Show.remove({ _id: req.params.show_id})
    .catch((err) => {
        res.status(400).send(err);
    })
    .then(() => {
        res.status(200).send('Show removed.');
    });
};
