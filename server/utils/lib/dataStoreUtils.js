
var AppearsIn = require('../../models/AppearsIn');
var Person = require('../../models/Person');
var Media = require('../../models/Media');
var Utils = require('./utils')

exports.getPersonObjById = async function(personId) {
    return Person.findById(personId).exec();
}

exports.getMediaEntityById = function(mediaId) {
    return Movie.find({_id: mediaId}).exec();
}
exports.getAppearsInByKeys = async function(mediaId, personId) {
    let array = await AppearsIn.find({_media: mediaId, _person: personId}).exec();
    console.log('appears array')
    console.log(array);
    return array[0];  // since there's just 1 appearsIn with same mediaid and personId
}

exports.removeMediaFromPerson = async function(mediaId, personId) {    
    let person = await this.getPersonObjById(personId);
    console.log('person')
    console.log(person)
    let appearsIn = await this.getAppearsInByKeys(mediaId, personId);
    console.log('appears')    
    console.log(appearsIn)
    let appearsInId = appearsIn._id;
    Utils.removeItemFromList(appearsInId, person._appears_in);
    person.save();
}

exports.deleteAppearsInByKeys = async function(mediaId, personId) {
    let appearsIn = await this.getAppearsInByKeys(mediaId, personId);
    appearsIn.remove();
}

exports.test = function() {
    console.log('deu certo')
}

exports.getFollowsPage = async function(mediaId) {
    return FollowsPage.find({_media: mediaId}).exec();
}

exports.deleteMediaAndFollowsPage = async function(mediaId) {
    let followsPages = await this.getFollowsPage(mediaId);
    await followsPages.forEach(async (followPage) => {
        await followPage.remove().exec();
    });
}

exports.getWatched = function(mediaId) {
    return Watched.find({_media: mediaId}).exec();
}

exports.deleteMediaAndWatched = async function(mediaId) {
    let watcheds = await this.getWatched(mediaId);
    console.log(watcheds);
    await watcheds.forEach(async (watched) => {
        await watched.remove().exec();
    });
}

exports.getRated = async function(mediaId) {
    return Rated.find({_media: mediaId}).exec();
}

exports.deleteMediaAndRated = async function(mediaId) {
    let rateds = await this.getRated(mediaId);
    await rateds.forEach(async (rated) => {
        await rated.remove().exec();
    });
}
