var LocalStrategy = require('passport-local').Strategy;
var User          = require('../models/User');

module.exports = function(passport){
   
   function findUser(username, callback) {
        User.findOne({"username": username}, function(err, doc){
            callback(err, doc);
        });
    }

    function findUserById(id, callback) {
        const ObjectId = require("mongodb").ObjectId;
        User.findById(id, (err, doc) => {
            callback(err, doc);
        });
    }

    passport.serializeUser(function(user, done) {
        done(null, user._id);
    });

    passport.deserializeUser(function(id, done) {
        findUserById(id, function(err,user) {
            done(err, user);
        });
    });

    passport.use(new LocalStrategy( {
        usernameField: 'username',
        passwordField: 'password'
    },
    (username, password, done) => {
        findUser(username, (err, user) => {
            if (err) {
                return done(err);
            }
            // if no user is found, return the message
            if (!user) {
                return done(null, false, 'User not found.'); // req.flash is the way to set flashdata using connect-flash
            }
            // if the user is found but the password is wrong
            if (!user.validPassword(password)) {
                return done(null, false, 'Wrong password.'); // create the loginMessage and save it to session as flashdata
            }
            // all is well, return successful user
            return done(null, user);
        });
    }));
}