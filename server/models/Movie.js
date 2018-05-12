var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Media = require('./Media');

var MovieSchema = new Schema({
    isBoxOffice: {
        type: Boolean,
        required: true,
        default: false
    }
});

var Movie = Media.discriminator('Movie',
     MovieSchema);


module.exports = Movie;
