var client = redis.createClient(19990, 'redis-19990.c16.us-east-1-2.ec2.cloud.redislabs.com', {no_ready_check: true});
client.auth('nsXmMM8VvJ7PrbYc4q6WZ50ilryBdbmM', function (err) {
    if (err) throw err;
});

client.on('connect', function() {
    console.log('connected to Redis');
});

