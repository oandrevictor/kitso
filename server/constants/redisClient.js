const ACCESS_TOKEN = "nsXmMM8VvJ7PrbYc4q6WZ50ilryBdbmM";
const PORT = 19990;
const SERVER = 'redis-19990.c16.us-east-1-2.ec2.cloud.redislabs.com';
const OPTIONS = {no_ready_check: true};

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