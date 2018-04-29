var mongoose = require('mongoose');
var Schema = mongoose.Schema;

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
        required: true
    },
    _appears_in: [
        { type: mongoose.Schema.Types.ObjectId, ref: 'AppearsIn' }
    ]
});

var Person = mongoose.model('Person', PersonSchema);

module.exports = Person;