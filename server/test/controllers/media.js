process.env.NODE_ENV = 'test';

let mongoose = require("mongoose");
let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../../app');
let should = chai.should();
chai.use(chaiHttp);

let Media = require('../../models/Media');
let RequestStatus = require('../../constants/requestStatus');
let RequestGenerals = require('../../constants/requestGenerals');
let API = '/api/';

describe('Media', () => {

    beforeEach(function(done) {
        Media.remove({}, function(err) {
            if (err) return done(err);
            done();
        });
    });

    /*
     * Test the /GET media
     */
    describe('/GET media', function() {
        it('It should return 0 medias since there is no media created.', function(done) {
            chai.request(server)
                .get(API + RequestGenerals.MEDIA_ENDPOINT)
                .end(function(error, res) {
                    res.should.have.status(RequestStatus.OK);
                    res.body.should.be.a('array');
                    res.body.length.should.be.eql(0);
                    done();
                });
        });
    });

});