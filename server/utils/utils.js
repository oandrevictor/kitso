var Media = require('../models/Media');

class Utils {

    static async removePersonFromMediaCast(mediaId, personId) {
        let media = await this.getMediaObj(mediaId);
        let index = media._actors.indexOf(personId);
        if (index > -1) {
            media._actors.splice(index, 1);
        }
        media.save();
    }

    static async getMediaObj(mediaId) {
        return Media.findById(mediaId).exec();
    }

}

module.exports = Utils;
