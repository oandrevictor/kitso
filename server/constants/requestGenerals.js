const TVSHOW_ENDPOINT = "tvshow/";
const SEASON_ENDPOINT = "/season/";
const MOVIE_ENDPOINT = "movie/";
const MEDIA_ENDPOINT = "media";

class RequestGenerals {

  static get TVSHOW_ENDPOINT () {
    return TVSHOW_ENDPOINT;
  }

  static get SEASON_ENDPOINT() {
    return SEASON_ENDPOINT;
  }

  static get MOVIE_ENDPOINT () {
    return MOVIE_ENDPOINT;
  }

  static get MEDIA_ENDPOINT () {
    return MEDIA_ENDPOINT;
  }
}

module.exports = RequestGenerals;
