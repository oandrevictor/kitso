var tvShowController = require('../controllers/tvShowController');
var TMDBController = require('../external/TMDBController');
const https = require('https');

var Show = require('../models/TvShow');


exports.getTrending = function(media_type){
  return new Promise(function(resolve, reject) {
    console.log("Retrieving trending " + media_type);
    https.get("https://api.themoviedb.org/3/trending/" + media_type + "/week" + "?api_key=db00a671b1c278cd4fa362827dd02620", (resp) => {
      let data = '';
      resp.on('data', (chunk) => {
        data += chunk;
      });
      resp.on('end', () => {
        var i = 1000;
        data = JSON.parse(data)
        data.results.forEach(function(entry){
          i+= 60000;
          setTimeout(function(){
          console.log("Fetching: " + entry.id)
          tvshow = Show.findOne({_tmdb_id: entry.id});
          tvshow.catch((err) => {
            console.log("ERR")
          })
          .then((result) => {
            var show = new Show();
            if (result != null){
              show = result
            }
            show.name = entry.name;
            show._tmdb_id = entry.id;
            show.save()
            .catch((err) => {
              console.log("Could not save show " + entry.id)
              console.log(err)
            })
            .then((createdShow) => {
              TMDBController.getShowFromTMDB(createdShow._tmdb_id).then( async (result)=> {
                result._id = createdShow._id;
                result._seasons = createdShow._seasons;
                result.__t = createdShow.__t;
                setTimeout(function(){tvShowController.matchApiSeasonsToDb(result, createdShow);}, 5000);
                result._actors = await tvShowController.matchApiCastToDb(createdShow);
                console.log("OKAY " + entry.id)
              })
            });
        });
      }, i);

    })


    }).on("error", (err) => {
      console.log("Error: " + err.message);
      reject();
    });
  })
})
}
