const TMDB_API_ROUTE = "https://api.themoviedb.org/3/tv/";
const TMDB_API_KEY = "?api_key=db00a671b1c278cd4fa362827dd02620";

class TMDBConstants {

    static get TMDB_API_ROUTE() {
        return TMDB_API_ROUTE;
    }

    static get TMDB_API_KEY() {
        return TMDB_API_KEY;
    }

}

module.exports = TMDBConstants;