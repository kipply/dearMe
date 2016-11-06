
var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

var userSchema = mongoose.Schema({

    local: {
        email: String,
        password: String,
    },
    data: {
    	persona: {type: Array, default: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]},
      entities:[{
        form: String, 
        isPerson: Boolean, 
        sentiment: Number
      }]
    }
});

// WHOOOOOOOOOA SECURITY
userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.local.password);
};

// create the model for users
module.exports = mongoose.model('User', userSchema);
