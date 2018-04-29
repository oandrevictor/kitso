var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var AppearsInSchema = new Schema({
    _person: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Person'
    },
    _media: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Media'
    }
});

var AppearsIn = mongoose.model('AppearsIn', AppearsInSchema);

module.exports = AppearsIn;