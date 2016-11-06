var indico = require('indico.io'); 
var express = require('express'); 
var app = express(); 
var port = process.env.PORT || 8000; 
var mongoose = require('mongoose'); 
var passport = require('passport'); 
var flash = require('connect-flash');

var morgan = require('morgan'); 
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');

var configDB = require('./config/database.js'); 

mongoose.Promise = global.Promise;
mongoose.connect(configDB.url); 

app.use(morgan('dev')); 
app.use(cookieParser()); 
app.use(bodyParser()); 

app.set('view engine', 'pug');

app.use(session({secret: 'dearmehorsebatterystaple'})); 
app.use(passport.initialize()); 
app.use(passport.session()); 
app.use(flash()); 

app.use(express.static(__dirname + '/views'));

require('./app/routes.js')(app, passport); 
require('./config/passport')(passport);

app.listen(port); 
console.log('Listening of port' + port); 

