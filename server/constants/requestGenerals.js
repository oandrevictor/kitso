const TVSHOW_ENDPOINT = "tvshow/";
const SEASON_ENDPOINT = "/season/";

class RequestGenerals {

    static get TVSHOW_ENDPOINT () {
        return TVSHOW_ENDPOINT ;
    }

    static get SEASON_ENDPOINT() {
        return SEASON_ENDPOINT;
    }
}

module.exports = RequestGenerals;