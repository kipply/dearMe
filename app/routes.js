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
           
            var personasDB = req.user.data.persona;

            var topPersonasVals = [];
            var topPersonasNames = [];

            var types = ["", "advocate", "debater", "mediator", "consul", "executive", "adventurer", "logistician", "commander","entrepreneur", "logician", "protagonist", "architect", "campaigner", "entertainer", "defender", "virtuoso"];

            var preNum = 234987838769;
           for (var i = 0; i < 6; i++) {
               var max = -1;
               var maxName = "";
               var maxInd = -1;
               for (var j = 1; j < personasDB.length; j++) {
                   if (i==0&&j==i) {preNum=personasDB[j]}
                   if (personasDB[j]>max&&personasDB[j]<=preNum) {
                       max = personasDB[j];
                       maxName = types[j];
                       maxInd = j;
                   }
               }
               personasDB[maxInd] = -10;
               topPersonasNames.push(maxName);
               topPersonasVals.push(max);
               preNum = max;
           }
           var people = []; 
           for (var i = 0; i < req.user.data.entities.length; i++){
                if (req.user.data.entities[i].isPerson == true){
                    people.push(req.user.data.entities[i]);

                }
           }
           var sort_by = function(field, reverse, primer){

               var key = primer ? 
                   function(x) {return primer(x[field])} : 
                   function(x) {return x[field]};

               reverse = !reverse ? 1 : -1;

               return function (a, b) {
                   return a = key(a), b = key(b), reverse * ((a > b) - (b > a));
                 } 
            }
            people = people.sort(sort_by('sentiment', true, parseInt));
            res.render('profile.pug', {
                user: req.user,
                messages: req.flash('info'),
                entries: entries,
                personasix: topPersonasVals, 
                legend: topPersonasNames,
                emotionDataJoy: arr, 
                dates: datees, 
                people: people
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


    app.post('/inspire', isLoggedIn, function(req, res) {

        'use strict';

        var google = require('googleapis');

        var customsearch = google.customsearch('v1');

       var interests = []; 
       for (var i = 0; i < req.user.data.entities.length; i++){
            if (req.user.data.entities[i].isPerson != true){
                interests.push(req.user.data.entities[i]);

            }
       }
       var sort_by = function(field, reverse, primer){

           var key = primer ? 
               function(x) {return primer(x[field])} : 
               function(x) {return x[field]};

           reverse = !reverse ? 1 : -1;

           return function (a, b) {
               return a = key(a), b = key(b), reverse * ((a > b) - (b > a));
             } 
        }
            interests = interests.sort(sort_by('sentiment', true, parseInt));
        const CX = '010121651302582544090:8h0szinltrc';
        const API_KEY = 'AIzaSyBw2thKTXlGCGRKK0c1eVRfpR7ine-vbNY';
        const SEARCH = interests[0].form;

        customsearch.cse.list({ cx: CX, q: SEARCH, auth: API_KEY }, function (err, resp) {
          if (err) {
            return console.log('An error occured', err);
          }
          // Got the response from custom search
          console.log('Result: ' + resp.searchInformation.formattedTotalResults);
          if (resp.items && resp.items.length > 0) {
            console.log('First result name is ' + resp.items[0].link);
          }

            req.flash('info', 'Hey there! This link might interest you; '+ resp.items[0].link);
            res.redirect('/profile');
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
                arr[0]++; 
                arr[1] += res.advocate;
                arr[2] += res.debater; 
                arr[3] += res.mediator; 
                arr[4] += res.consul; 
                arr[5] += res.executive;
                arr[6] += res.adventurer; 
                arr[7] += res.logistician; 
                arr[8] += res.commander; 
                arr[9] += res.entrepreneur; 
                arr[10] += res.logician; 
                arr[11] += res.protagonist; 
                arr[12] += res.architect; 
                arr[13] += res.campaigner;
                arr[14] += res.entertainer;
                arr[15] += res.defender; 
                arr[16] += res.virtuoso;
                User.update({_id: req.user._id}, {
                    data:{
                        persona: arr
                    }
                }, function(err, numberAffected, rawResponse) {
                   //handle it
                })
            })

        )
        


        var spawn = require('child_process').spawn;
        child = spawn('java', ['-jar', 'SentimentCore.jar']);

        child.stdin.setEncoding('utf-8');
        child.stdout.pipe(process.stdout);

        child.stdin.write((req.body.entry.replace("\n", "")).replace(/<(?:.|\n)*?>/gm, "").replace(/(\r\n|\n|\r)/gm,"") + "\n");
        child.stdin.write("EOF\n");

        var jsonObj;
        child.stdout.on('data', function (data) {
          jsonObj = JSON.parse(data.toString());
            var entities = jsonObj.Entities; 
            var flag;
            var importantVariable;
            var importantArray = req.user.data.entities; 
            var temp;
            for (var i = 0; i < jsonObj.Entities.length; i++) {
                importantVariable = jsonObj.Entities[i];
                flag = false; 
                for (var j = 0; j < req.user.data.entities.length; j++){
                    if (importantVariable.form == req.user.data.entities[j].form){
                        flag = true;
                        temp =j;
                    }
                }
                if (flag){
                    importantArray[temp].sentiment += importantVariable.form;
                } else{
                    importantArray.push(importantVariable);
                }
                    
            }
            User.update({_id: req.user._id}, {
                        data:{
                            entities: importantArray,
                            persona: req.user.data.persona
                        }
                    }, function(err, numberAffected, rawResponse) {
                       //handle it
                    })
        });

        
        req.flash('info', 'Journal sent!');
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
