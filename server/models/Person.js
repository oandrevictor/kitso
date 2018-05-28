var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var AppearsIn = require('../models/AppearsIn');
// var Utils = require('../utils/lib/utils');
// var DataStoreUtils = require('../utils/lib/dataStoreUtils');


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

// PersonSchema.pre('remove', async function(next) {

//     let mAppearsIns = this._appears_in;
//     let mPersonId = this._id;
    
//     Utils.test();
//     DataStoreUtils.test();

//     // deleting person from medias' casts
//     await mAppearsIns.forEach(async (appearsInId) => {
//         let appearsIn = await AppearsIn.findById(appearsInId).exec();
//         let mediaId = appearsIn._media;
//         let media = await DataStoreUtils.getMediaEntityById(mediaId);
//         Utils.removeItemFromList(mPersonId, media._actors);
//         media.save();
//     });
    
//     // deleting appearsIns entities when delete person entity
//     await mAppearsIns.forEach(async (appearsInId) => {
//         await AppearsIn.remove({_id: appearsInId}).exec();
//     });

//     next();
// });

var Person = mongoose.model('Person', PersonSchema);

module.exports = Person;