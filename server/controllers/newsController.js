
var News = require('../models/News');
var Related = require('../models/Related');
var RequestStatus = require('../constants/requestStatus');


exports.index = function(req, res) {
    News.find({})
    .catch((err) => {
        res.status(RequestStatus.BAD_REQUEST).send(err);
    })
    .then((result) => {
        res.status(RequestStatus.OK).json(result);
    });
};

exports.show = function(req, res) {
    News.findById(req.params.news_id)
    .catch((err) => {
        res.status(RequestStatus.BAD_REQUEST).send(err);
    })
    .then((result) => {
        res.status(RequestStatus.OK).json(result);
    });
};

exports.create = async function(req, res) {
    var news_obj = new News(req.body);
    try {
        var news = await create_news(news_obj);

        let news_id = news._id;
        let media_id = req.body._media_id;
        let person_id = req.body._person_id;
        let related = await create_related(news_id, media_id, person_id);

        news._related.push(related._id);
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
    try {
        var news = await find_news_obj(req.params.news_id);
        var relateds_ids = news._related;
        await delete_relateds(relateds_ids);
        await delete_news(req.params.news_id);
    } catch(err) {
        console.log(err);
        res.status(RequestStatus.BAD_REQUEST).send(err);
    }
    res.status(RequestStatus.OK).send('News deleted.');
};

var create_news = function(news_obj) {
    return news_obj.save();
}

var create_related = function(news_id, media_id, person_id) {
    let related_structure = {
        _news: news_id,
        _media: media_id,
        _person: person_id
    }
    let related = new Related(related_structure);
    return related.save();
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
