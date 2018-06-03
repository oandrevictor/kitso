var kitso = angular.module('kitso');

kitso.controller('ExploreController',
['$scope', '$location', '$timeout', 'MovieService', 'TvShowService', 'WatchedService', 'PersonService', '$routeParams', 'AuthService',
function($scope, $location, $timeout, MovieService, TvShowService, WatchedService, PersonService, $routeParams, AuthService) {
  $('.full-loading').show();
  $scope.allMedias = [];

  AuthService.getStatus().then(function(){
    $scope.user = AuthService.getUser();

  }).catch(function(){});

  var compareDates = function(a,b){
        return - moment(a.release_date).diff(moment(b.release_date))
    }

    MovieService.getAllMovies()
        .then((allMovies) => {
            $scope.allMovies = allMovies;
            $scope.allMovies = allMovies.sort(compareDates);
            $scope.allMedias = $scope.allMedias.concat($scope.allMovies).sort(compareDates)
            $('.full-loading').hide();
          })
        .catch((error) => {
          console.log(error)
            UIkit.notification({
                message: '<span uk-icon=\'icon: check\'></span> ' + error.errmsg,
                status: 'danger',
                timeout: 2500
            });
        });

    TvShowService.getAllShows()
        .then((allShows) => {
          $('.full-loading').hide();
            $scope.allShows = allShows;
            $scope.allShows = allShows.sort(compareDates)
            $scope.allMedias = $scope.allMedias.concat($scope.allShows).sort(compareDates)
          })
        .catch((error) => {
            UIkit.notification({
                message: '<span uk-icon=\'icon: check\'></span> ' + error.errmsg,
                status: 'danger',
                timeout: 2500
            });
        });

    PersonService.getAllPeople()
        .then((allPeople) => {
            $scope.allPeople = allPeople;
            $scope.allPeople = allPeople.sort(compareDates)
        })
        .catch((error) => {
            UIkit.notification({
                message: '<span uk-icon=\'icon: check\'></span> ' + error.errmsg,
                status: 'danger',
                timeout: 2500
            });
        });

    $scope.markAsWatched = function(movieId){
        WatchedService.markAsWatched($scope.user._id, movieId)
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
