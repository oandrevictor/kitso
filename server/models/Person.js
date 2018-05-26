var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var AppearsIn = require('../models/AppearsIn');
var Utils = require('../utils/utils');


var PersonSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true,
        default: ''
    },
    birthday: {
        type: Date,
        required: false
    },
    image_url: {
        type: String,
        required: false
    },
    _appears_in: [{ type: mongoose.Schema.Types.ObjectId, ref: 'AppearsIn' }]
});


PersonSchema.pre('remove', async function(next) {

    let mAppearsIns = this._appears_in;
    let mId = this._id;

    // deleting person from medias' casts
    await mAppearsIns.forEach(async (appearsInId) => {
        let appearsIn = await AppearsIn.findById(appearsInId).exec();
        let mediaId = appearsIn._media;
        await Utils.removePersonFromMediaCast(mediaId, mId);
    });
    
    // deleting appearsIns entities when delete person entity
    await mAppearsIns.forEach(async (appearsInId) => {
        await AppearsIn.remove({_id: appearsInId}).exec();
    });

    next();
});

var Person = mongoose.model('Person', PersonSchema);

module.exports = Person;