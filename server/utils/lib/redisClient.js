var redis = require('redis');
var RedisClientConstants = require('../../constants/redisClient');

exports.createAndAuthClient = function() {
    let client = redis.createClient(
        RedisClientConstants.PORT,
        RedisClientConstants.SERVER,
        RedisClientConstants.OPTIONS);

    client.auth(RedisClientConstants.ACCESS_TOKEN, function (err) {
        if (err) throw err;
    });

    return client;
};
