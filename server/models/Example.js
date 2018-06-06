var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ExampleSchema = new Schema({
  nome: String
});

var Example = mongoose.model('Example', ExampleSchema);

module.exports = Example;
