const TMDB_API_SHOW_ROUTE = "https://api.themoviedb.org/3/tv/";
const TMDB_API_MOVIE_ROUTE = "https://api.themoviedb.org/3/movie/";
const TMDB_API_KEY = "?api_key=db00a671b1c278cd4fa362827dd02620";
const TMDB_BACK_IMAGE_PATH = "https://image.tmdb.org/t/p/original/";

class TMDBConstants {

    static get TMDB_API_SHOW_ROUTE() {
        return TMDB_API_SHOW_ROUTE;
    }

    static get TMDB_API_MOVIE_ROUTE() {
        return TMDB_API_MOVIE_ROUTE;
    }


    static get TMDB_API_KEY() {
        return TMDB_API_KEY;
    }

    static get TMDB_BACK_IMAGE_PATH() {
        return TMDB_BACK_IMAGE_PATH;
    }

}

module.exports = TMDBConstants;