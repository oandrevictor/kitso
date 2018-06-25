var News = require('../models/News');
var Related = require('../models/Related');
var Action = require('../models/Action');
var ActionType = require('../constants/actionType');
var Person = require('../models/Person');
var Media = require('../models/Media');
var RequestStatus = require('../constants/requestStatus');
var DataStoreUtils = require('../utils/lib/dataStoreUtils');
var TMDBController = require('../external/TMDBController');

var Media = require('../models/Media');
var Person = require('../models/Person');

const cheerio = require('cheerio');
const https = require('https');
const http = require('http');

exports.index = function(req, res) {
  News.find({})
  .catch((err) => {
    res.status(RequestStatus.BAD_REQUEST).send(err);
  })
  .then(async function(news) {
    let promise;

    try {
      promise = await news.map(inject_related);
    } catch (err) {
      res.status(RequestStatus.BAD_REQUEST).send(err);
    }

    Promise.all(promise).then((results) => {
      res.status(RequestStatus.OK).json(results);
    });
  });
};

exports.show = function(req, res) {
  News.findById(req.params.news_id)
  .catch((err) => {
    res.status(RequestStatus.BAD_REQUEST).send(err);
  })
  .then(async function(news) {
    let complete_new = await inject_related(news);
    res.status(RequestStatus.OK).json(complete_new);
  });
};

exports.getTaggable = async function(req, res) {
  var all = []
  var name = req.body.name;
  console.log(name)
  var medias = await getMedias(name)

  var persons = await Person.find({ "name": { $regex: '.*' + name + '.*' }} ).limit(4)
  .catch((err) => {
    console.log("Error catching in Media:" + name)
    return []
  })
  .then((result) => {
    console.log(result)
    return(result)
  });
  console.log(medias)
  all = all.concat(medias)
  console.log('concat')
  console.log(all)
  all = all.concat(persons)
  console.log("here goes all")
  console.log(all)
  res.status(RequestStatus.OK).json(all.slice(0,5))
}

var getMedias = async function(name) {
  var medias = await Media.find({ $and: [ {"name": { $regex: '.*' + name + '.*' }}, { __t: { $ne: 'Episode' }}]} ).limit(4)
  .catch((err) => {
    console.log("Error catching in Media:" + name)
    console.log(err)
    return []
  })
  .then((result) => {
    console.log(result)
    return(result)
  });
  return medias;

}
var getMetadata = function(data){const $ = cheerio.load(data);
  result = {}
 result.title = $('head title').text()
 result.desc = $('meta[name="description"]').attr('content')
 result.ogTitle = $('meta[property="og:title"]').attr('content')
 result.ogImage = $('meta[property="og:image"]').attr('content')
 images = $('img');
 result.images = []
  for (var i = 0; i < images.length; i++) {
      result.images.push($(images[i]).attr('src'));
  }
  return result
}

exports.loadMetadata = async function(req,res) {
  url = req.body.url;
  var http_pattern = /^((http):\/\/)/;
  var https_pattern = /^((https):\/\/)/;
  if(http_pattern.test(url)) {
    http.get(url,
      (resp) => {
        let data = '';
        resp.on('data', (chunk) => {
          data += chunk;
        });
        resp.on('end', () => {
          result = getMetadata(data)
          res.status(200).send(result)
          return(result)
        });
      }).on("error", (err) => {
        console.log("Error getting metadata from: " + url + " : "+ err);
        res.status(400).send(err)
      });
  } else if (https_pattern.test(url)){
    https.get(url,
      (resp) => {
        let data = '';
        resp.on('data', (chunk) => {
          data += chunk;
        });
        resp.on('end', () => {
          result = getMetadata(data)
          res.status(200).send(result)
          return(result)
        });
      }).on("error", (err) => {
        console.log("Error getting metadata from: " + url + " : "+ err);
        res.status(400).send(err)
      });
  }
  else{
    res.status(200).send({data:""})
  }
}

exports.create = async function(req, res) {
  var news_obj = new News(req.body);
  try {
    var news = await create_news(news_obj);

    let news_id = news._id;
    let user_id = req.body._user;
    let medias = req.body.medias_ids;
    let people = req.body.people_ids;

    let relateds = [];
    if (medias) {
      for (var i = 0; i < medias.length; i++) {
        let media_related = await create_related(user_id, news_id, true, medias[i]);
        relateds.push(media_related);
      }
    }
    if (people) {
      for (var i = 0; i < people.length; i++) {
        let people_related = await create_related(user_id, news_id, false, people[i]);
        relateds.push(people_related);
      }
    }
    news._user = user_id;
    news._related = relateds;

    let action = await DataStoreUtils.createAction(user_id, news._id, ActionType.NEWS);
    news._action = action._id;
    await DataStoreUtils.addActionToUserHistory(user_id, action._id);
    await news.save();
    res.status(RequestStatus.OK).send(news);
  } catch(err) {
    console.log(err);
    res.status(RequestStatus.BAD_REQUEST).send(err);
  }
};

exports.update = function(req, res) {
  News.findById(req.params.news_id)
  .catch((err) => {
    res.status(RequestStatus.BAD_REQUEST).send(err);
  })
  .then((news) => {
    if (req.body._posted_by) news._posted_by = req.body._posted_by;
    if (req.body.link) news.link = req.body.link;
    if (req.body.date) news.date = req.body.date;
    if (req.body._related) news._related = req.body._related;

    news.save()
    .catch((err) => {
      res.status(RequestStatus.BAD_REQUEST).send(err);
    })
    .then((updatedNews) => {
      res.status(RequestStatus.OK).json(updatedNews);
    });
  });
};

exports.delete = async function(req, res) {
  let newsId = req.params.news_id;
  try {
    let deletedNews = await DataStoreUtils.deleteNews(newsId);
  } catch (err) {
    res.status(RequestStatus.BAD_REQUEST).send(err);
  }
  res.status(RequestStatus.OK).send('News deleted.');
};

var inject_related = async function(news) {
  let complete_news = JSON.parse(JSON.stringify(news));
  let relateds = complete_news._related;
  let related_objs = [];
  for (var i = 0; i < relateds.length; i++) {
    let related_obj = await Related.findById(relateds[i]).exec();
    let complete_related = JSON.parse(JSON.stringify(related_obj));
    if (complete_related.is_media) {
      let media_obj = await Media.findById(complete_related._media).exec();
      let media_from_TMDB = await DataStoreUtils.getMediaWithInfoFromDB(media_obj);
      complete_related._media = media_from_TMDB;
    } else {
      let person_obj = await Person.findById(complete_related._person).exec();
      let person_from_TMDB = await TMDBController.getPersonFromTMDB(person_obj._tmdb_id);
      complete_related._person = person_from_TMDB;
    }

    related_objs.push(complete_related);
  }
  complete_news._related = related_objs;

  return complete_news;
}

var create_news = function(news_obj) {
  return news_obj.save();
}

var create_related = function(user_id, news_id, is_media, object_id) {
  let media_id, person_id;

  if (is_media) {
    media_id = object_id;
  } else {
    person_id = object_id;
  }

  let related_structure = {
    _user: user_id,
    _news: news_id,
    is_media: is_media,
    _media: media_id,
    _person: person_id
  }

  let related = new Related(related_structure);
  related.save();

  return related._id;
}

var find_news_obj = function(news_id) {
  return News.findById(news_id).exec();
}

var delete_relateds = function(relateds_ids) {
  relateds_ids.forEach(async function (related_id) {
    await Related.remove({ _id: related_id}).exec();
  })
}

var delete_news = function(news_id) {
  return News.remove({ _id: news_id}).exec();
}
