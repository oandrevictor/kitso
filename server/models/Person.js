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
        required: false
    },
    image_url: {
        type: String,
        required: false
    },
    _appears_in: [
        { type: mongoose.Schema.Types.ObjectId, ref: 'Media' }
    ]
});

var Person = mongoose.model('Person', PersonSchema);

module.exports = Person;