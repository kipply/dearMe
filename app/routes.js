var Entry = require('../app/models/entry');
var User = require('../app/models/user');
var fs = require('fs');
var indico = require('indico.io'); 

module.exports = function(app, passport) {

    app.get('/', function(req, res) {   
        res.render('index.pug');
    });

    app.get('/login', isNotLoggedIn, function(req, res) {
        res.render('login.pug', { message: req.flash('loginMessage') }); 
    });

    app.get('/signup', isNotLoggedIn, function(req, res) {
        res.render('signup.pug', { message: req.flash('signupMessage') });
    });

    app.get('/profile', isLoggedIn, function(req, res) {
        arr= [12, 19, 3, 5, 2, 3];

        Entry.find({userID: req.user._id}).exec(function(err, entries) {
            if (err) throw err;
            res.render('profile.pug', {
                user: req.user,
                messages: req.flash('info'),
                entries: entries
            });     
        });

    });

    app.get('/journal', isLoggedIn, function(req, res) {

        Entry.find({userID: req.user._id}).exec(function(err, entries) {
            if (err) throw err;
            res.render('journal.pug', {
                user: req.user,
                entries: entries
            });     
        });

    });

    app.get('/write', isLoggedIn, function(req, res) {
        res.render('write.pug', {
            user : req.user // get the user out of session and pass to template
        });
    });


    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });

    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect : '/profile', // redirect to the secure profile section
        failureRedirect : '/signup', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));

        // process the login form
    app.post('/login', passport.authenticate('local-login', {
        successRedirect : '/profile', // redirect to the secure profile section
        failureRedirect : '/login', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));

    app.post('/submitEntry', isLoggedIn, function(req, res) {
        today = new Date();
        var temp = []; 
        var tempo = [];
        tempo.length = 6;
        temp.length = 6; 
        for (i = 0; i < 6; i++){
            temp[i] = 0;
            tempo[i] = "";
        }

        indico.apiKey = 'ab83001ca5c484aa92fc18a5b2d6585c';
        indico.personas(req.body.entry).then(function(res){

            for (var key in res) {
                for (i = 0; i < 6; i++){

                    if (res[key] > temp[i]) {
                        temp[i] = res[key];
                        tempo[i] = key;
                        i = i + 7;
                    } 
                }
            }
            console.log (JSON.stringify(temp) + "\n" + JSON.stringify(tempo));
            // console.log(persona);
        }).then(function(){
            
        });

            newEntry = Entry({
                userID: req.user._id,
                entry: {
                    plaintext: req.body.entry.replace(/<(?:.|\n)*?>/gm, ''),
                    html: req.body.entry,
                }, 
                date:{ 
                    year: today.getFullYear(),
                    month: today.getMonth() + 1, 
                    date: today.getDate(),
                    day: today.getDay(), 
                },
                data:{
                    persona: {
                        values: temp, 
                        name: tempo
                    }
                }
            })

            newEntry.save(function(err) {
              if (err) throw err;
            });


        req.flash('info', 'Flash is back!');
        res.redirect('/profile')

    });
};


// route middleware to make sure a user is logged in
function isNotLoggedIn(req, res, next) {

    if (req.isAuthenticated() == false)
        return next();

    res.redirect('/profile');
}

function isLoggedIn(req, res, next) {

    if (req.isAuthenticated())
        return next();

    res.redirect('/');
}        
