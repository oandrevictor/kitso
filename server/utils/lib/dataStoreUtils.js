
var AppearsIn = require('../../models/AppearsIn');
var Person = require('../../models/Person');
var Media = require('../../models/Media');
var Action = require('../../models/Action');
var User = require('../../models/User');
var FollowsPage = require('../../models/FollowsPage');
var Rated = require('../../models/Rated');
var Watched = require('../../models/Watched');
var Utils = require('./utils')
var Media = require('../../models/Media');

exports.getMediaObjById = function(mediaId) {
    return Media.findById(mediaId).exec();
}

exports.getPersonObjById = async function(personId) {
    return Person.findById(personId).exec();
}

exports.getAppearsInObjById = function(appearsInId) {
    return AppearsIn.findById(appearsInId).exec();
}

exports.getAppearsInObjByKeys = async function(mediaId, personId) {
    let array = await AppearsIn.find({_media: mediaId, _person: personId}).exec();
    return array[0];  // since there's just 1 appearsIn with same mediaid and personId
}

exports.removeMediaFromPerson = async function(mediaId, personId) {    
    let person = await this.getPersonObjById(personId);
    let appearsIn = await this.getAppearsInObjByKeys(mediaId, personId);
    let appearsInId = appearsIn._id;
    Utils.removeItemFromList(appearsInId, person._appears_in);
    person.save();
}

exports.deleteAppearsInByKeys = async function(mediaId, personId) {
    let appearsIn = await this.getAppearsInObjByKeys(mediaId, personId);
    appearsIn.remove();
}

exports.getFollowsPage = async function(followingId, isMedia) {
    return FollowsPage.find({_following: followingId, is_media: isMedia}).exec();
}

exports.deleteMediaAndFollowsPage = async function(mediaId) {
    let followsPages = await this.getFollowsPage(mediaId, true);
    await followsPages.forEach(async (followPage) => {
        await followPage.remove();
    });
}

exports.getWatched = async function(mediaId) {
    return Watched.find({_media: mediaId}).exec();
}

exports.deleteMediaAndWatched = async function(mediaId) {
    let watcheds = await this.getWatched(mediaId);
    await watcheds.forEach(async (watched) => {
        await watched.remove();
    });
}

exports.getRated = async function(mediaId) {
    return Rated.find({_media: mediaId}).exec();
}

exports.deleteMediaAndRated = async function(mediaId) {
    let ratings = await this.getRated(mediaId);
    await ratings.forEach(async (rated) => {
        await rated.remove();
    });
}

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
}
