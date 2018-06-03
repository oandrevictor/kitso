var AppearsIn = require('../../models/AppearsIn');
var Person = require('../../models/Person');
var Media = require('../../models/Media');
var Action = require('../../models/Action');
var User = require('../../models/User');
var FollowsPage = require('../../models/FollowsPage');
var Rated = require('../../models/Rated');
var Watched = require('../../models/Watched');
var Utils = require('./utils');
var UserList = require('../../models/UserList');
var ActionType = require('../../constants/actionType');


// CREATE =========================================================================================

exports.createAction = async function(userId, actionId, actionType) {
    let action = new Action({
        _user: userId,
        date: new Date(),
        _action: actionId,
        action_type: actionType,
    });
    return action.save();
};


// ADD ============================================================================================

exports.addActionToUserHistory = async function(userId, actionId) {
    User.findById(userId, function (err, user) {
        let userHistory = user._history;
        userHistory.push(actionId);
        return user.save();
    });
};

exports.addAppearsInToPerson = function(personId, appearsInId) {
    Person.findById(personId, function (err, person) {
        person._appears_in.push(appearsInId);
        return person.save();
    });
};

exports.addPersonToMediaCast = function(personId, mediaId) {
    Media.findById(mediaId, function (err, media) {
        if (!media._actors.includes(personId)) {
            media._actors.push(personId);
        }
        return media.save();
    });
};


// GET ============================================================================================

exports.getActionByTypeAndId = async function(type, id) {
    if (type == ActionType.RATED) {
        return Rated.findById(id).exec();
    } else if (type == ActionType.WATCHED) {
        return Watched.findById(id).exec();
    } else if (type == ActionType.FOLLOWED_USER) {
        return Follows.findById(id).exec();
    } else if (type == ActionType.FOLLOWED_PAGE) {
        return FollowsPage.findById(id).exec();
    } else {
        let errorMsg = "There is no such action type!";
        throw new Erro(errorMsg);
    }
};

exports.getUserById = async function(id) {
    return User.findById(id).exec();
};

exports.getUserListById = function(userListId) {
    return UserList.findById(userListId).exec();
};

exports.getMediaObjById = function(mediaId) {
    return Media.findById(mediaId).exec();
};

exports.getPersonObjById = async function(personId) {
    return Person.findById(personId).exec();
};

exports.getAppearsInObjById = function(appearsInId) {
    return AppearsIn.findById(appearsInId).exec();
};

exports.getAppearsInObjByMedia = async function(mediaId) {
    return AppearsIn.find({_media: mediaId}).exec();
};

exports.getAppearsInObjByKeys = async function(mediaId, personId) {
    let array = await AppearsIn.find({_media: mediaId, _person: personId}).exec();
    return array[0];  // since there's just 1 appearsIn with same mediaid and personId
};

exports.getFollowsPage = async function(followingId, isMedia) {
    return FollowsPage.find({_following: followingId, is_media: isMedia}).exec();
};

exports.getWatchedById = async function(watchedId) {
    return Watched.findById(watchedId).exec();
};

exports.getWatchedByMediaId = async function(mediaId) {
    return Watched.find({_media: mediaId}).exec();
};

exports.getWatchedByUserId = async function(userId) {
    return Watched.find({_user: userId}).exec();
};

exports.getRated = async function(mediaId) {
    return Rated.find({_media: mediaId}).exec();
};


// DELETE =========================================================================================

exports.removeMediaFromPerson = async function(mediaId, personId) {    
    let person = await this.getPersonObjById(personId);
    let appearsIn = await this.getAppearsInObjByKeys(mediaId, personId);
    let appearsInId = appearsIn._id;
    Utils.removeItemFromList(appearsInId, person._appears_in);
    person.save();
};

exports.deleteAppearsInByKeys = async function(mediaId, personId) {
    let appearsIn = await this.getAppearsInObjByKeys(mediaId, personId);
    appearsIn.remove();
};

exports.deleteMediaAndFollowsPage = async function(mediaId) {
    let followsPages = await this.getFollowsPage(mediaId, true);
    await followsPages.forEach(async (followPage) => {
        await this.deleteFollowsPage(followPage._id);
    });
};

exports.deleteMediaAndWatched = async function(mediaId) {
    let watcheds = await this.getWatchedByMediaId(mediaId);
    await watcheds.forEach(async (watched) => {
        await this.deleteWatched(watched._id);
    });
};

exports.deleteMediaAndRated = async function(mediaId) {
    let ratings = await this.getRated(mediaId);
    await ratings.forEach(async (rated) => {
        await this.deleteRated(rated._id);
    });
};

exports.deleteMediaById = async function(mediaId) {    
    let media = await this.getMediaObjById(mediaId);
    let actors = media._actors;
    await actors.forEach(async (personId) => {
        // deleting media from actors' appearsins
        await this.removeMediaFromPerson(mediaId, personId);
        // deleting appearsIns entities with deleted media
        await this.deleteAppearsInByKeys(mediaId, personId);   
    });
    // deleting followsPage actions related to this media
    await this.deleteMediaAndFollowsPage(mediaId);
    // deleting ratings actions related to this media
    await this.deleteMediaAndRated(mediaId);
    // deleting watched actions related to this media
    await this.deleteMediaAndWatched(mediaId); 
    media.remove();
};

exports.deleteListFromDb = function(listId) {
    return UserList.remove({ _id: listId}).exec();
};

exports.deleteAction = function(actionId) {
    Action.remove({ _id: actionId}).exec();
};

exports.deleteActionFromUserHistory = function(userId, actionId) {
    User.findById(userId, function (err, user) {
        let user_history = user._history;
        let index = user_history.indexOf(actionId);
        if (index > -1) {
            user_history.splice(index, 1);
        }
        user.save();
    });
};

exports.deleteFollowsPage = async function(followsId) {
    let followObj = await FollowsPage.findById(followsId);
    let actionId = followObj._action;
    let userId = followObj._user;
    await this.deleteAction(actionId);
    await this.deleteActionFromUserHistory(userId, actionId);
    followObj.remove();
    return followObj;
};

exports.deleteRated = async function(ratedId) {
    let ratedObj = await Rated.findById(ratedId);
    let actionId = ratedObj._action;
    let userId = ratedObj._user;
    await this.deleteAction(actionId);
    await this.deleteActionFromUserHistory(userId, actionId);
    ratedObj.remove();
    return ratedObj;
};

exports.deleteWatched = async function(watchedId) {
    let watchedObj = await Watched.findById(watchedId);
    let actionId = watchedObj._action;
    let userId = watchedObj._user;
    await this.deleteAction(actionId);
    await this.deleteActionFromUserHistory(userId, actionId);
    watchedObj.remove();
    return watchedObj;
};


// OTHER AUXILIARIES FUNCTIONS =====================================================================

exports.alreadyExistsAppearsInByKeys = async function(personId, mediaId) {
    let results = await AppearsIn.find({_person: personId, _media: mediaId}).exec();
    return results.length > 0;
};

