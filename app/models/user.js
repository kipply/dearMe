
var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

var userSchema = mongoose.Schema({

    local: {
        email: String,
        password: String,
    },
    data: {
    	persona: [],
    	//{ advocate: 0.0508959432,
  // debater: 0.07435993390000001,
  // mediator: 0.0606351763,
  // consul: 0.0344166172,
  // executive: 0.058148533100000004,
  // adventurer: 0.0564892606,
  // logistician: 0.0801115243,
  // commander: 0.0624162278,
  // entrepreneur: 0.0692755912,
  // logician: 0.1024460521,
  // protagonist: 0.0369425556,
  // architect: 
  // campaigner:
  // entertainer
  // defender
  // virtuoso: 
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
