var Media = require('../models/Media');
var AppearsIn = require('../models/AppearsIn');
var Person = require('../models/Person');

class Utils {
    
    static async getMediaObjById(mediaId) {
        return Media.findById(mediaId).exec();
    }

    static async getPersonObjById(personId) {
        return Person.findById(personId).exec();
    }

    static async getAppearsInByKeys(mediaId, personId) {
        let array = await AppearsIn.find({_media: mediaId, _person: personId}).exec();
        return array[0];  // since there's just 1 appearsIn with same mediaid and personId
    }

    static async removePersonFromMediaCast(mediaId, personId) {
        let media = await this.getMediaObjById(mediaId);
        let index = media._actors.indexOf(personId);
        if (index > -1) {
            media._actors.splice(index, 1);
        }
        media.save();
    }

    static async removeMediaFromPerson(mediaId, personId) {
        let person = await this.getPersonObjById(personId);
        let appearsIn = await this.getAppearsInByKeys(mediaId, personId);
        let appearsInId = appearsIn._id;

        let index = person._appears_in.indexOf(appearsInId);
        if (index > -1) {
            person._appears_in.splice(index, 1);
        }

        person.save();
    }

    static async deleteAppearsInByKeys(mediaId, personId) {
        let appearsIn = await this.getAppearsInByKeys(mediaId, personId);
        appearsIn.remove();
    }

}

module.exports = Utils;
