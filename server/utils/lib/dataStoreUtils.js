
var AppearsIn = require('../../models/AppearsIn');
var Person = require('../../models/Person');
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

exports.deleteMediaById = async function(mediaId) {    
    let media = await this.getMediaObjById(mediaId);
    let actors = media._actors;
    await actors.forEach(async (personId) => {
        // deleting media from actors' appearsins
        await this.removeMediaFromPerson(mediaId, personId);
        // deleting appearsIns entities with deleted media
        await this.deleteAppearsInByKeys(mediaId, personId);        
    });
    media.remove();
}