var Entry = require('../app/models/entry');
var User = require('../app/models/user');
var fs = require('fs');
var indico = require('indico.io'); 

module.exports = function(app, passport) {

    app.get('/', function(req, res) {   


        fs.readFile('diary.txt', 'utf8', function(err, contents) {
            date = contents.split('\n')[0]; 
            contents = contents.replace(date, ""); 
            entry = contents.substring(0, contents.search(/MONDAY|TUESDAY|WEDNESDAY|THURSDAY|FRIDAY|SATURDAY|SUNDAY/));
            contents = contents.replace(entry, '');
            entry = entry.replace('\n', "");
            year = parseInt(date.split(",")[3]);

            console.log(date); 

            console.log(year);
            console.log(entry);

            indico.personas('onetuhoentuhoentuhoenthuonetuh I\'m a bird').then(function(res){
                console.log(res); 
                User.update({_id: req.user._id}, {

                    data:{persona:[2,2,2,2,2,2,2]}

                }, function(err, numberAffected, rawResponse) {
                   //handle it
                })
            })
              .catch(function(err){
                console.log('err: ', err);
              })
              console.log(req.user)


        });
        res.render('index.pug');
    });

        app.get('/login', isNotLoggedIn, function(req, res) {
            res.render('login.pug', { message: req.flash('loginMessage') }); 
        });

        app.get('/signup', isNotLoggedIn, function(req, res) {
            res.render('signup.pug', { message: req.flash('signupMessage') });
        });

        app.get('/profile', isLoggedIn, function(req, res) {
            arr = []; 
            datees = []; 
            Entry.find({userID: req.user._id}).exec(function(err, entries) {

            arr.length = entries.length; 
            datees.length = entries.length;
            for (i = 0; i < entries.length; i++){
                datees[i] = "";
                arr[i] = entries[i].data.emotion;
                datees[i] = entries[i].date.month+"/"+entries[i].date.date+"/"+entries[i].date.year;
            }
            arr = arr.reverse();
            console.log(datees);
            console.log(arr);
            if (err) throw err;
            res.render('profile.pug', {
                user: req.user,
                messages: req.flash('info'),
                entries: entries,
                emotionDataJoy: arr, 
                dates: datees
            });     
        });

    });

    app.get('/journal', isLoggedIn, function(req, res) {

        Entry.find({userID: req.user._id}).exec(function(err, entries) {
            if (err) throw err;
            res.render('journal.pug', {
                user:req.user,
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
        today = new Date()

        indico.apiKey = 'ab83001ca5c484aa92fc18a5b2d6585c';
        indico.emotion(req.body.entry).then(function(res){
            console.log(res.joy);     
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
                    emotion:res.joy,
                }
            })
            newEntry.save(function(err) {
              if (err) throw err;
            });
        })
        .then(

            indico.personas('onetuhoentuhoentuhoenthuonetuh I\'m a bird').then(function(res){
                console.log(res); 
                User.update({_id: req.user._id}, {
                    
                }, function(err, numberAffected, rawResponse) {
                   //handle it
                })
            })
              .catch(function(err){
                console.log('err: ', err);
              })
        )

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
