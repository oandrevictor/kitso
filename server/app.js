// server.js

// modules =================================================
var express        = require('express');
var app            = express();
var bodyParser     = require('body-parser');
var methodOverride = require('method-override');
var path           = require('path');
var mongoose       = require('mongoose');
var passport       = require('passport');
var session        = require('express-session');
var MongoStore     = require('connect-mongo')(session);
var dotenv         = require('dotenv').load();
// configuration ===========================================

// config files
var db = require('./config/db');

// set our port
var port = process.env.PORT || 8080;

// connect to our mongoDB database
// (uncomment after you enter in your own credentials in config/db.js)
mongoose.connect(db.local_url);

// Passport and sessions
require('./config/passport')(passport);

app.use(session({
  store: new MongoStore({
    mongooseConnection: mongoose.connection,
    ttl: 30 * 60 // = 30 minutos de sessão
  }),
  secret: process.env.SESSION_SECRET, // Colocar nas variaveis de ambiente do heroku em producao (process.env.nomeDaVariavel)
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

// get all data/stuff of the body (POST) parameters
// parse application/json
app.use(bodyParser.json());

// parse application/vnd.api+json as json
app.use(bodyParser.json({ type: 'application/vnd.api+json' }));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// override with the X-HTTP-Method-Override header in the request. simulate DELETE/PUT
app.use(methodOverride('X-HTTP-Method-Override'));

// set the static files location /public/img will be /img for users
app.use(express.static(path.join(__dirname, '../client')));

// Cliente Routes  ==================================================
app.get('/', function (req, res) {
  res.sendfile(path.resolve('client/index.html'));
});

app.get('/signup', function (req, res) {
  res.sendfile(path.resolve('client/index.html'));
});

app.get('/login', function (req, res) {
  res.sendfile(path.resolve('client/index.html'));
});

app.get('/home', function (req, res) {
  res.sendfile(path.resolve('client/index.html'));
});

app.get('/profile', function (req, res) {
  res.sendfile(path.resolve('client/index.html'));
});

app.get('/movie/:id', function (req, res) {
  res.sendfile(path.resolve('client/index.html'));
});

// Api routes
var exampleRoutes = require('./routes/example');
app.use('/example', exampleRoutes);

var movieRoutes = require('./routes/movie');
app.use('/api/movie', movieRoutes);

var personRoutes = require('./routes/person');
app.use('/api/person', personRoutes);

var appearsInRoutes = require('./routes/appearsin');
app.use('/api/appears_in', appearsInRoutes);

var userRoutes = require('./routes/user');
app.use('/api/user', userRoutes);

var watchedRoutes = require('./routes/watched');
app.use('/api/watched', watchedRoutes);

var tvShowRoutes = require('./routes/tvShow');
app.use('/api/tvShow', tvShowRoutes);

var actionRoutes = require('./routes/action');
app.use('/api/action', actionRoutes);

// start app ===============================================
// startup our app at http://localhost:8080
app.listen(port);

// shoutout to the user
console.log('Magic happens on port ' + port);

// expose app
exports = module.exports = app;
