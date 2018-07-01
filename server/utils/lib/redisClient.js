var redis = require('redis');
var RedisClientConstants = require('../../constants/redisClient');

let redisClient = null;

exports.createAndAuthClient = function() {

  if (redisClient)
    return redisClient;

  redisClient = redis.createClient(
    RedisClientConstants.PORT,
    RedisClientConstants.SERVER,
    RedisClientConstants.OPTIONS
  );
  
  redisClient.auth(RedisClientConstants.ACCESS_TOKEN, function (err) {
    if (err) throw err;
  });

  return redisClient;
};
