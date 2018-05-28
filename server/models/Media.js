var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var DataStoreUtils = require('../utils/lib/dataStoreUtils');

var MediaSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    overview: {
        type: String,
        required: true,
        default: "No information now, come back soon."
    },
    release_date: {
        type: Date,
        required: true
    },
    _directors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Person' }],
    _actors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Person' }],
    imdb_id: {
        type: String,
        required: true
    },
    genres: {
      type: [String],
      default: [],
      required: true
    },
    images: { 
        poster: {
            type: String
        },
        cover: {
            type: String
        }
    }
});

MediaSchema.pre('remove', async function(next) {

    let mActors = this._actors;
    let mId = this._id;

    console.log(mActors);
    await mActors.forEach(async (personId) => {
        console.log(personId);
        // deleting media from actors' appearsins
        await DataStoreUtils.removeMediaFromPerson(mId, personId);

        console.log('deletnado appears in...')
        // deleting appearsIns entities with deleted media
        await DataStoreUtils.deleteAppearsInByKeys(mId, personId);        
    });

    await Utils.deleteMediaAndFollowsPage(mId);
    await Utils.deleteMediaAndRated(mId);
    await Utils.deleteMediaAndWatched(mId);
    
    next();
});

var Media = mongoose.model('Media', MediaSchema);

module.exports = Media;
