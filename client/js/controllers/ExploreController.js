var kitso = angular.module('kitso');

kitso.controller('ExploreController',
['$scope', '$location', '$timeout', 'MovieService', 'TvShowService', 'WatchedService', 'PersonService', '$routeParams', 'AuthService',
function($scope, $location, $timeout, MovieService, TvShowService, WatchedService, PersonService, $routeParams, AuthService) {
  $('.full-loading').show();
  loading_feed = 0;

  all_current_page = 0;
  movie_current_page = 0;
  tvshow_current_page = 0;
  person_current_page = 0;

  stop_loading_all = false;
  stop_loading_movie = false;
  stop_loading_tvshow = false;
  stop_loading_person = false;

  $scope.allMedias = [];

  AuthService.getStatus().then(function(){
    $scope.user = AuthService.getUser();
    loadMovies(0);
    loadTvShow(0);
    loadPeople(0);
  }).catch(function(){});

  var compareDates = function(a,b){
    return - moment(a.release_date).diff(moment(b.release_date))
  }

  $scope.gridExhibitionMode = true;

  $( "body" ).scroll(function() {
    if($("body").scrollTop() + $("body").height() >= $(document).height() - 100) {
      if (!loading_feed){
        if ($('#movie.uk-active').length > 0 && !stop_loading_movie) {
          movie_current_page = movie_current_page + 1;
          loadMovies(movie_current_page);
        } else if ($('#tvshow.uk-active').length > 0 && !stop_loading_tvshow) {
          tvshow_current_page = tvshow_current_page + 1;
          loadTvShow(tvshow_current_page);
        } else if ($('#person.uk-active').length > 0 && !stop_loading_person) {
          person_current_page = person_current_page + 1;
          loadPeople(person_current_page);
        } else if ($('#all.uk-active').length > 0 && !stop_loading_all) {
          all_current_page = all_current_page + 1;
          loadAllMedias(all_current_page);
        }
      }
    }
  });

  var loadAllMedias = function(page){
    $('.bubble-loading').show();
    loading_feed = true;

    TvShowService.getAllShows(page)
      .then((allShows) => {
        $scope.allMedias = $scope.allMedias.concat(allShows);

        MovieService.getAllMovies(page)
          .then((allMovies) => {
            if (allShows.length === 0 && allMovies.length === 0)
              stop_loading_all = true;

            $scope.allMedias = $scope.allMedias.concat(allMovies);

            loading_feed = false;
            $('.full-loading').hide();
            $('.bubble-loading').hide();
          })
      })
      .catch(
        function(result){
          loading_feed = false;
          $('.bubble-loading').hide();

        }
      )
  };

  var loadMovies = function(page){
    $('.bubble-loading').show();
    loading_feed = true;

    MovieService.getAllMovies(page)
      .then((allMovies) => {
        if (allMovies.length === 0)
          stop_loading_movie = true;

        if (page && page >=1 ){
          $scope.$applyAsync(function(){
            $scope.allMovies = $scope.allMovies.concat(allMovies);
          });
        }
        else {
          $scope.allMovies = allMovies.sort(compareDates);
          $scope.allMedias = $scope.allMedias.concat($scope.allMovies);
        }
        loading_feed = false;
        $('.full-loading').hide();
        $('.bubble-loading').hide();
      })
      .catch(
        function(result){
          loading_feed = false;
          $('.bubble-loading').hide();

        }
      )
  };

  var loadTvShow = function(page){
    $('.bubble-loading').show();
    loading_feed = true;

    TvShowService.getAllShows(page)
      .then((allShows) => {
        if (allShows.length === 0)
          stop_loading_tvshow = true;

        if (page && page >=1 ){
          $scope.$applyAsync(function(){
            $scope.allShows = $scope.allShows.concat(allShows);
          });
        }
        else {
          $scope.allShows = allShows.sort(compareDates);
          $scope.allMedias = $scope.allMedias.concat($scope.allShows);
        }
        loading_feed = false;
        $('.full-loading').hide();
        $('.bubble-loading').hide();
      })
      .catch(
        function(result){
          loading_feed = false;
          $('.bubble-loading').hide();
        }
      )
  };


  var loadPeople = function(page){
    $('.bubble-loading').show();
    loading_feed = true;

    PersonService.getAllPeople(page)
      .then((allPeople) => {
        if (allPeople.length === 0)
          stop_loading_people = true;

        if (page && page >=1 ){
          $scope.$applyAsync(function(){
            $scope.allPeople = $scope.allPeople.concat(allPeople);
          });
        }
        else {
          $scope.allPeople = allPeople.sort(compareDates);
        }
        loading_feed = false;
        $('.full-loading').hide();
        $('.bubble-loading').hide();
      })
      .catch(
        function(result){
          loading_feed = false;
          $('.bubble-loading').hide();
        }
      )
  };

  $scope.markAsWatched = function(movieId, runtime){
    WatchedService.markAsWatched($scope.user._id, movieId, runtime, $scope.movie.genres)
    .then((watched) => {
      $scope.movie.watched = watched;
    })
    .catch((error) => {
      UIkit.notification({
        message: '<span uk-icon=\'icon: check\'></span> ' + error.errmsg,
        status: 'danger',
        timeout: 2500
      });
    });
  }

  $scope.getPoster = function(media){
    if (media.poster_path){
      return media.poster_path;
    }
    if(media.images && media.images.poster){
      return media.images.poster;
    }
    if(media.helper && media.helper.poster_path){
      return 'https://image.tmdb.org/t/p/w500/' + media.helper.poster_path;
    }
  }

  $scope.getName = function(media){
    if (media.name){
      return media.name;
    }
    if(media.title){
      return media.title;
    }
  }

  $scope.changeExhibitionMode = function(mode) {
    if (mode === 'grid') {
      $scope.gridExhibitionMode = true;
    } else {
      $scope.gridExhibitionMode = false;
    }
  }

  $scope.markAsNotWatched = function(watchedId){
    WatchedService.markAsNotWatched(watchedId)
    .then(() => {
      $scope.movie.watched = false;
    })
    .catch((error) => {
      UIkit.notification({
        message: '<span uk-icon=\'icon: check\'></span> ' + error.errmsg,
        status: 'danger',
        timeout: 2500
      });
    });
  }

  $scope.editionMode = function () {
    $location.path('movie/edit/' + $routeParams.movie_id);
  }
}]);
