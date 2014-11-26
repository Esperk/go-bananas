var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var languageSchema = new Schema({
  language: String,
  label: String,
  icon: String
});

module.exports = mongoose.model('Language', languageSchema);