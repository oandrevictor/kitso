const EPISODE = "Episode";
const TVSHOW = "TvShow";
const SEASON = "Season";
const MOVIE = "Movie";

class MediaType {
  
  static get EPISODE() {
    return EPISODE;
  }
  
  static get TVSHOW() {
    return TVSHOW
  }
  
  static get SEASON() {
    return SEASON;
}

  static get MOVIE() {
    return MOVIE;
  }
  
}

module.exports = MediaType;
