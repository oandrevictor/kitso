// config/db.js
module.exports = {
    url: "mongodb://" + process.env.DATABASE_USERNAME + ":" + process.env.DATABASE_PASSWORD + "@ds237669.mlab.com:37669/savetv-dev",
    local_url: "mongodb://localhost/kitso-dev",
    test_url: "mongodb://localhost/kitso-test"
};
