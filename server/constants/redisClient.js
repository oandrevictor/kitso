const ACCESS_TOKEN = "nsXmMM8VvJ7PrbYc4q6WZ50ilryBdbmM";
const PORT = 19990;
const SERVER = 'redis-19990.c16.us-east-1-2.ec2.cloud.redislabs.com';
const OPTIONS = {
  no_ready_check: true,
  retry_strategy: function (options) {
    if (options.error && options.error.code === 'ECONNREFUSED') {
      // End reconnecting on a specific error and flush all commands with
      // a individual error
      return new Error('The server refused the connection');
    }
    if (options.total_retry_time > 1000 * 60 * 60) {
      // End reconnecting after a specific timeout and flush all commands
      // with a individual error
      return new Error('Retry time exhausted');
    }
    if (options.attempt > 10) {
      // End reconnecting with built in error
      return undefined;
    }
    // reconnect after
    return Math.min(options.attempt * 100, 3000);
  }
};

class RedisClientConstants {

  static get ACCESS_TOKEN() {
    return ACCESS_TOKEN;
  }

  static get PORT() {
    return PORT;
  }

  static get SERVER() {
    return SERVER;
  }

  static get OPTIONS() {
    return OPTIONS;
  }

}

module.exports = RedisClientConstants;
