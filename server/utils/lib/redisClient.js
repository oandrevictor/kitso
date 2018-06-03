var redis = require('redis');
var RedisClientConstants = require('../../constants/redisClient');

var redisClient = null;

exports.createAndAuthClient = function() {

    if (redisClient && redisClient.connected)
        return redisClient;

    // if (redisClient)
    //     redisClient.quit();

    redisClient = redis.createClient(
        RedisClientConstants.PORT,
        RedisClientConstants.SERVER,
        RedisClientConstants.OPTIONS);

    redisClient.auth(RedisClientConstants.ACCESS_TOKEN, function (err) {
        if (err) throw err;
    });

    return redisClient;
};

