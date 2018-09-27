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

var RedisClient = require('./utils/lib/redisClient');

let client = RedisClient.createAndAuthClient();

//  ===========================================

// config files
var db = require('./config/db');

// set our port
var port = process.env.PORT || 8080;
var ENV = process.env.ENVIROMENT || 'development'
var db_url;
if(ENV == 'production'){
  db_url = db.url;
}
else {
  db_url = db.local_url;
}
// connect to our mongoDB database
// (uncomment after you enter in your own credentials in config/db.js)
mongoose.connect(db_url);

// Passport and sessions
require('./config/passport')(passport);
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(session({
  store: new MongoStore({
    mongooseConnection: mongoose.connection,
    ttl: 30 * 60 // = 30 minutos de sessão
  }),
  secret: process.env.SESSION_SECRET,
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

app.post('/passwordRecover/:email', function (req, res) {
  res.sendfile(path.resolve('client/index.html'));
});

app.get('/home', function (req, res) {
  res.sendfile(path.resolve('client/index.html'));
});

app.get('/explore', function (req, res) {
  res.sendfile(path.resolve('client/index.html'));
});

app.get('/profile', function (req, res) {
  res.sendfile(path.resolve('client/index.html'));
});

app.get('/vip', function (req, res) {
  res.sendfile(path.resolve('client/index.html'));
});

app.get('/user/:id', function (req, res) {
  res.sendfile(path.resolve('client/index.html'));
});

app.get('/list/:userlist_id', function (req, res) {
  res.sendfile(path.resolve('client/index.html'));
});

app.get('/list/edit/:userlist_id', function (req, res) {
  res.sendfile(path.resolve('client/index.html'));
});

app.get('/tvshow/:id', function (req, res) {
  res.sendfile(path.resolve('client/index.html'));
});

app.get('/tvshow/:id/season/:number', function (req, res) {
  res.sendfile(path.resolve('client/index.html'));
});

app.get('/tvshow/edit/:id', function (req, res) {
  res.sendfile(path.resolve('client/index.html'));
});

app.get('/movie/:id', function (req, res) {
  res.sendfile(path.resolve('client/index.html'));
});

app.get('/movie/edit/:id', function (req, res) {
  res.sendfile(path.resolve('client/index.html'));
});

app.get('/person/:id', function (req, res) {
  res.sendfile(path.resolve('client/index.html'));
});

app.get('/person/edit/:id', function (req, res) {
  res.sendfile(path.resolve('client/index.html'));
});

// Api routes
var emailRoutes = require('./routes/email');
app.use('/api/email', emailRoutes);

var movieRoutes = require('./routes/movie');
app.use('/api/movie', movieRoutes);

var personRoutes = require('./routes/person');
app.use('/api/person', personRoutes);

var appearsInRoutes = require('./routes/appearsin');
app.use('/api/appears_in', appearsInRoutes);

var userRoutes = require('./routes/user');
app.use('/api/user', userRoutes);

var userListRoutes = require('./routes/userList');
app.use('/api/userlist', userListRoutes);

var watchedRoutes = require('./routes/watched');
app.use('/api/watched', watchedRoutes);

var ratedRoutes = require('./routes/rated');
app.use('/api/rated', ratedRoutes);

var searchRoutes = require('./routes/search');
app.use('/api/search', searchRoutes);

var tvShowRoutes = require('./routes/tvShow');
app.use('/api/tvShow', tvShowRoutes);

var actionRoutes = require('./routes/action');
app.use('/api/action', actionRoutes);

var followsRoutes = require('./routes/follows');
app.use('/api/follows', followsRoutes);

var followsPageRoutes = require('./routes/followsPage');
app.use('/api/followsPage', followsPageRoutes);

var mediaRoutes = require('./routes/media');
app.use('/api/media', mediaRoutes);

var newsRoutes = require('./routes/news');
app.use('/api/news', newsRoutes);

var relatedRoutes = require('./routes/related');
app.use('/api/related', relatedRoutes);

var likedRoutes = require('./routes/liked');
app.use('/api/liked', likedRoutes);

var notificationRoutes = require('./routes/notification');
app.use('/api/notification', notificationRoutes);

// start app ===============================================
// startup our app at http://localhost:8080
app.listen(port);

// shoutout to the user
console.log('Magic happens on port ' + port);


// CronJob
const CronJob = require('cron').CronJob;
var crawler = require('./utils/crawler');
crawler.getTrending('tv');

// expose app
exports = module.exports = app;
