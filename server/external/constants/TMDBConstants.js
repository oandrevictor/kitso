const TMDB_API_SHOW_ROUTE = "https://api.themoviedb.org/3/tv/";
const TMDB_API_MOVIE_ROUTE = "https://api.themoviedb.org/3/movie/";
const TMDB_API_KEY = "?api_key=db00a671b1c278cd4fa362827dd02620";
const TMDB_BACK_IMAGE_PATH = "https://image.tmdb.org/t/p/original/";
const TMDB_POSTER_IMAGE_PATH = "https://image.tmdb.org/t/p/w500";
const TMDB_API_MEDIA_RECOMMENDATIONS = "&language=en-US&append_to_response=recommendations";

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

  static get TMDB_POSTER_IMAGE_PATH() {
    return TMDB_POSTER_IMAGE_PATH;
  }

  static get TMDB_API_MEDIA_RECOMMENDATIONS() {
    return TMDB_API_MEDIA_RECOMMENDATIONS;
  }

}

module.exports = TMDBConstants;
