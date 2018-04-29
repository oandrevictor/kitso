var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var AppearsInSchema = new Schema({
    person: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Person'
    },
    media: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Media'
    }
});

var AppearsIn = mongoose.model('AppearsIn', AppearsInSchema);

module.exports = AppearsIn;