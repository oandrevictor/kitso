var redis = require('redis');
var RedisClientConstants = require('../../constants/redisClient');

var redisClient = redis.createClient(
        RedisClientConstants.PORT,
        RedisClientConstants.SERVER,
        RedisClientConstants.OPTIONS);

redisClient.auth(RedisClientConstants.ACCESS_TOKEN, function (err) {
    if (err) throw err;
});


redisClient.on('connect', function() {
    console.log('connected to Redis');
});

exports = module.exports = redisClient;
