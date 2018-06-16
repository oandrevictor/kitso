process.env.NODE_ENV = 'test';

let mongoose = require("mongoose");
let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../../app');
let should = chai.should();
chai.use(chaiHttp);

let Media = require('../../models/Media');
let AppearsIn = require('../../models/AppearsIn');
let Person = require('../../models/Person');
let RequestStatus = require('../../constants/requestStatus');
let RequestGenerals = require('../../constants/requestGenerals');
let API = '/api/';

describe('Movie', () => {

    beforeEach(function(done) {
        Media.remove({}, function(err) {
            if (err) return done(err);
        });
        AppearsIn.remove({}, function(err) {
            if (err) return done(err);
        });
        Person.remove({}, function(err) {
            if (err) return done(err);
        });
        done();
    });

    afterEach(function(done) {
        Media.remove({}, function(err) {
            if (err) return done(err);
        });
        AppearsIn.remove({}, function(err) {
            if (err) return done(err);
        });
        Person.remove({}, function(err) {
            if (err) return done(err);
        });
        done();
    });

    /*
     * Test the /GET movie
     */
    // describe('/GET movie', function() {
    //     it('It should return 0 movies since there is no media created.', function(done) {
    //         chai.request(server)
    //             .get(API + RequestGenerals.MOVIE_ENDPOINT)
    //             .end(function(error, res) {
    //                 res.should.have.status(RequestStatus.OK);
    //                 res.body.should.be.a('array');
    //                 res.body.length.should.be.eql(0);
    //                 done();
    //             });
    //     });
    // });

    /*
     * Test the /POST movie
     */
    describe('/POST movie', () => {

        let corret_movie_obj = {
            name: "The Shawshank Redemption",
            imdb_id:"tt0111161",
            _tmdb_id: "278"
        };
        let movie_without_required_params = {
            name: "The Shawshank Redemption",
        };
        let movie_with_wrong_tmdbid = {
            name: "The Shawshank Redemption",
            imdb_id:"tt0111161",
            _tmdb_id: "wrong_tdmb_id"
        };

        it('Movie should not be created and return http status 400', (done) => {
            chai.request(server)
                .post(API + RequestGenerals.MOVIE_ENDPOINT)
                .send(movie_without_required_params)
                .end((err, res) => {
                    res.should.have.status(RequestStatus.BAD_REQUEST);
                    done();
                });
        });

        it('Movie should not be created and return http status 400', (done) => {
            chai.request(server)
                .post(API + RequestGenerals.MOVIE_ENDPOINT)
                .send(movie_with_wrong_tmdbid)
                .end((err, res) => {
                    res.should.have.status(RequestStatus.BAD_REQUEST);
                    done();
                });
        });

        it('Movie should be created and return http status 200', (done) => {
            chai.request(server)
                .post(API + RequestGenerals.MOVIE_ENDPOINT)
                .send(corret_movie_obj)
                .end((err, res) => {
                    res.should.have.status(RequestStatus.OK);
                    res.body.should.be.a('object');
                    res.body.should.have.property('title');
                    res.body.should.have.property('imdb_id');
                    res.body.should.have.property('id');
                    // res.body.errors.should.have.property('pages');
                    // res.body.errors.pages.should.have.property('kind').eql('required');
                    done();
                });
        });

    });

});