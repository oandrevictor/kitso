var redis = require('redis');
var RedisClientConstants = require('../../constants/redisClient');

exports.createAndAuthClient = function() {
    let client = redis.createClient(
        19990,
        'redis-19990.c16.us-east-1-2.ec2.cloud.redislabs.com',
        {no_ready_check: true});

    client.auth(RedisClientConstants.ACCESS_TOKEN, function (err) {
        if (err) throw err;
    });

    return client;
};
