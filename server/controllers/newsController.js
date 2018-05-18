var News = require('../models/News');
var Related = require('../models/Related');

exports.index = function(req, res) {
    News.find({})
    .catch((err) => {
        res.status(400).send(err);
    })
    .then((result) => {
        res.status(200).json(result);
    });
};

exports.show = function(req, res) {
    News.findById(req.params.news_id)
    .catch((err) => {
        res.status(400).send(err);
    })
    .then((result) => {
        res.status(200).json(result);
    });
};

exports.create = async function(req, res) {
    var news_obj = new News(req.body);
    try {
        var news = await createNews(news_obj);
        
        let news_id = news._id;
        let media_id = req.body._media_id;
        let person_id = req.body._person_id;
        let related = await createRelated(news_id, media_id, person_id);
        
        news._related.push(related._id);        
        await news.save();        
        res.status(200).send(news);
    } catch(err) {
        console.log(err);
        res.status(400).send(err);
    }
};

exports.update = function(req, res) {
    News.findById(req.params.news_id)
    .catch((err) => {
        res.status(400).send(err);
    })
    .then((news) => {
        if (req.body._posted_by) news._posted_by = req.body._posted_by;
        if (req.body.link) news.link = req.body.link;
        if (req.body.date) news.date = req.body.date;
        if (req.body._related) news._related = req.body._related;
        
        news.save()
        .catch((err) => {
            res.status(400).send(err);
        })
        .then((updatedNews) => {
            res.status(200).json(updatedNews);
        });
    });
};

exports.delete = function(req, res) {
    News.remove({ _id: req.params.news_id})
    .catch((err) => {
        res.status(400).send(err);
    })
    .then(() => {
        res.status(200).send('News deleted.');
    });
};

var createNews = async function(news_obj) {
    return news_obj.save();
}

var createRelated = async function(news_id, media_id, person_id) {
    let related_structure = {
        _news: news_id,
        _media: media_id,
        _person: person_id
    } 
    let related = new Related(related_structure);
    return related.save();
}
