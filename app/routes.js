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
            booparr = [];
            legend = []; 
            console.log(req.user.data.persona);
            
            Entry.find({userID: req.user._id}).exec(function(err, entries) {

            arr.length = entries.length; 
            datees.length = entries.length;
            for (i = 0; i < entries.length; i++){
                datees[i] = "";
                arr[i] = entries[i].data.emotion;
                datees[i] = entries[i].date.month+"/"+entries[i].date.date+"/"+entries[i].date.year;
            }
            arr = arr.reverse();
            if (err) throw err;
            res.render('profile.pug', {
                user: req.user,
                messages: req.flash('info'),
                entries: entries,
                personasix: booparr, 
                legend: legend,
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

            indico.personas(req.body.entry).then(function(res){
                arr = req.user.data.persona;
                console.log(arr);
                arr[0]++; 
                arr[1] += res.debater;
                arr[2] += res.mediator; 
                arr[3] += res.consul; 
                arr[4] += res.executive; 
                arr[5] += res.adventurer;
                arr[6] += res.logistician; 
                arr[7] += res.commander; 
                arr[8] += res.entrepreneur; 
                arr[9] += res.entrepreneur; 
                arr[10] += res.logician; 
                arr[11] += res.protagonist; 
                arr[12] += res.architect; 
                arr[13] += res.campaigner;
                arr[14] += res.entertainer;
                arr[15] += res.defender; 
                arr[16] += res.virtuoso;
                User.update({_id: req.user._id}, {
                    data:{persona: arr}
                }, function(err, numberAffected, rawResponse) {
                   //handle it
                })
                console.log(arr)
            })

        )
        
        
        var spawn = require('child_process').spawn;
        child = spawn('java', ['-jar', 'SentimentCore.jar']);

        child.stdin.setEncoding('utf-8');
        child.stdout.pipe(process.stdout);

        child.stdin.write(req.body.entry + "\n");
        child.stdin.write("EOF\n");

        var jsonObj;
        child.stdout.on('data', function (data) {
          jsonObj = JSON.parse(data.toString());
        });

        var entities = jsonObj.Entities;

        for (var i = 0; i < entities.length; i++) {
            var entity = entities[i];

            var curEntities = req.user.data.entities;
            for (var j = 0; j < curEntities.length; j++) {
                var curEntity = curEntities[j];
                if (entity.form === curEntity.form) {
                    var curCount = curEntity.count;
                    curEntities[j].count = curCount+1;
                    User.update({_id: req.user_id}, {
                        data:{entities:curEntities}
                    }, function(err, numberAffected, rawResponse){})
                }else{
                    var newEntity = {
                        count : 1,
                        form : entity.form,
                        isPerson : entity.isPerson,
                        sentiment : entity.sentiment
                    };
                    curEntities.push(newEntity);
                    User.update({_id: req.user_id}, {
                        data:{entities:curEntities}
                    }, function(err, numberAffected, rawResponse){})
                }
            }
        }

        
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
