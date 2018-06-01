var FollowsPage = require('../models/FollowsPage');
var Media = require('../models/Media');
var Person = require('../models/Person');
var RequestStatus = require('../constants/requestStatus');
var ActionType = require('../constants/actionType');
var DataStoreUtils = require('../utils/lib/dataStoreUtils');

exports.index = async function(req, res) {
    let user_id = req.params.user_id;
    let following_list;
    try {
        following_list = await FollowsPage.find({_user: user_id}).exec();
        promises = following_list.map(getFollowedFromFollow);

        Promise.all(promises).then(function(results) {
            res.status(RequestStatus.OK).json(results);
        }) 
    } catch (err) {
        res.status(RequestStatus.BAD_REQUEST).json(err);
    }
};

exports.is_following = async function(req, res) {
    let user_id = req.query.user_id;
    let following_id = req.query.following_id;

    FollowsPage.find({_user: user_id, _following: following_id}, function(err, result) {
        if (err) {
            res.status(RequestStatus.BAD_REQUEST).json(err);
        } else {
            if (result.length > 0) {
                res_json = {
                    "is_following": true,
                    "following_id": result[0]._id
                }
                res.status(RequestStatus.OK).json(res_json);
            } else {
                json_not_following = {"is_following": false};
                res.status(RequestStatus.OK).json(json_not_following);
            }
        }
    });
};

exports.following_me = async function(req, res) {
    let page_id = req.params.page_id;
    let following_me_list;
    try {
        following_me_list = await FollowsPage.find({_following: page_id}).exec();
        res.status(RequestStatus.OK).json(following_me_list);
    } catch (err) {
        res.status(RequestStatus.BAD_REQUEST).json(err);
    }
};

exports.create = async function(req, res) {
    var follow = new FollowsPage(req.body);
    let user_id = follow._user;
    let action = await DataStoreUtils.createAction(user_id, follow._id, ActionType.FOLLOWED);
    follow._action = action._id;
    await DataStoreUtils.addActionToUserHistory(user_id, action._id);

    follow.save()
    .catch((err) => {
        res.status(RequestStatus.BAD_REQUEST).send(err);
    })
    .then((createdFollow) => {
        res.status(RequestStatus.OK).send(createdFollow);
    });
};

exports.delete = async function(req, res) {
    let follow_id = req.params.followsPage_id;

    FollowsPage.findById(follow_id)
    .catch((err) => {
        res.status(RequestStatus.BAD_REQUEST).send(err);
    })
    .then((follow) => {
        follow.remove()
        .catch((err) => {
            res.status(RequestStatus.BAD_REQUEST).send(err);
        })
        .then((deletedFollows) => {
            res.status(RequestStatus.OK).json(deletedFollows);
        });
    });
};

var getFollowedFromFollow = async function(follow) {
    if (follow.is_media) {
        return Media.findById(follow._following).exec();
    } else {
        return Person.findById(follow._following).exec();
    } 
};

