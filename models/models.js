var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new mongoose.Schema({
	username: String,
	password: String,
	created_at: {type: Date, default: Date.now},
	created_polls: Array,
	voted_polls: Array
});

var pollSchema = new mongoose.Schema({
	created_by: String,
	created_at: {type: Date, default: Date.now},
	topic: String,
	options: Array
});

mongoose.model('Poll', pollSchema);
mongoose.model('User', userSchema);