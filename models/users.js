var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
  name: String,
  password: String,
  secure_key: String,
  secret: String,
  last_ip: String,
  last_visit: String,
  active: Boolean,
  recovery: Date,
  created: { type: Date, default: Date.now },
  modified: { type: Date, default: Date.now },
  date_of_birth: Date,
  gender: { type: String, default: 'm'},
  firstname: String,
  lastname: String,
  email: String,
  timezone: String
});

var User = mongoose.model('User', userSchema);