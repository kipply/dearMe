
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
        persona: {
            values: Array, 
            name: Array
        }
    }
});

var Entry = mongoose.model('Entry', entrySchema);

module.exports = Entry;