var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var translationSchema = new Schema({
  _language: {type: Schema.Types.ObjectId, ref: 'Language'},
  object_key: String,
  object_values: String
});

module.exports = mongoose.model('Translation', translationSchema);