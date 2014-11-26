var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
  name: String,
  password: String,
  email: String,
  last_ip: String,
  last_visit: { type: Date, default: Date.now },
  secret: String,
  active: Boolean,
  recovery: Date,
  created: { type: Date, default: Date.now },
  modified: { type: Date, default: Date.now },
  date_of_birth: Date,
  gender: { type: String, default: 'm'},
  firstname: String,
  lastname: String,
  timezone: String
});

module.exports = mongoose.model('User', userSchema);