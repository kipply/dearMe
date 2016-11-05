
var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

var entrySchema = mongoose.Schema({
	userID: String,
    entry: {
    	plaintext: String,
    	html: String,
    },
    date: {
    	year: Number, 
    	month: Number, 
    	date: Number,
    	day: Number,
    }, 
    data:{
        emotion: Number,
        persona: []
    }
});

var Entry = mongoose.model('Entry', entrySchema);

module.exports = Entry;