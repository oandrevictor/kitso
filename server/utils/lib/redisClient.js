var redis = require('redis');
var RedisClientConstants = require('../../constants/redisClient');

let redisClient = null;
var ENV = process.env.ENVIROMENT || 'development'

exports.createAndAuthClient = function() {

  if (redisClient)
    return redisClient;

  if(ENV == 'production'){
    redisClient = redis.createClient(
      RedisClientConstants.PORT,
      RedisClientConstants.SERVER,
      RedisClientConstants.OPTIONS
    );
    redisClient.auth(RedisClientConstants.ACCESS_TOKEN, function (err) {
      if (err) throw err;
    });
  }
  else {
    redisClient = redis.createClient();
  }



  return redisClient;
};
