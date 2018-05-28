var Media = require('../models/Media');
var AppearsIn = require('../models/AppearsIn');
var Person = require('../models/Person');
var Follows = require('../models/Follows');
var Action = require('../models/Action');
var User = require('../models/User');
var FollowsPage = require('../models/FollowsPage');
var Rated = require('../models/Rated');
var Watched = require('../models/Watched');

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

    static async getFollowsPage(mediaId) {
        return FollowsPage.find({_media: mediaId}).exec();
    }

    static async deleteMediaAndFollowsPage(mediaId) {
        let followsPages = await this.getFollowsPage(mediaId);
        await followsPages.forEach(async (followPage) => {
            await followPage.remove().exec();
        });
    }

    static async getWatched(mediaId) {
        return Watched.find({_media: mediaId}).exec();
    }

    static async deleteMediaAndWatched(mediaId) {
        let watcheds = await this.getWatched(mediaId);
        console.log(watcheds);
        await watcheds.forEach(async (watched) => {
            await watched.remove().exec();
        });
    }

    static async getRated(mediaId) {
        return Rated.find({_media: mediaId}).exec();
    }

    static async deleteMediaAndRated(mediaId) {
        let rateds = await this.getRated(mediaId);
        await rateds.forEach(async (rated) => {
            await rated.remove().exec();
        });
    }

}

module.exports = Utils;
