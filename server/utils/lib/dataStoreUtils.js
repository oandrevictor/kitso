
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
