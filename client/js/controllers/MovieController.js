var kitso = angular.module('kitso');

kitso.controller('MovieController',
['$scope', '$location', '$timeout', 'MovieService', 'WatchedService', 'FollowService', 'RatedService', 'UserListService','$routeParams', 'AuthService',
function($scope, $location, $timeout, MovieService, WatchedService, FollowService, RatedService, UserListService, $routeParams, AuthService) {
  $('.full-loading').show();
    MovieService.loadMovie($routeParams.movie_id)
        .then(() => {
          AuthService.getStatus().then(function(){
            $scope.user = AuthService.getUser();
            $scope.movie = MovieService.getMovie();
            $scope.release_date_formated = moment($scope.movie.release_date).format('YYYY');
            $('.full-loading').hide();
            var lists = [];
            $scope.user._lists.forEach((listId) => {
              UserListService.loadUserList(listId).then( function(){
                lists.push(UserListService.getUserList());
              }).catch(function(error){
                console.log(error);
              })
            });
            $scope.user.lists = lists;

            RatedService.isRated($scope.user._id ,$routeParams.movie_id).then((rated) => {
                $scope.movie.rated = rated;
                if (! rated.rated_id){
                  $scope.movie.rated = false;
                  $scope.updateRating(0);
                }else{
                  RatedService.getRated($scope.movie.rated.rated_id).then((rated) => {
                    $scope.updateRating(rated.rating);
                  }).catch((error) => {
                    UIkit.notification({
                        message: '<span uk-icon=\'icon: check\'></span> ' + error.errmsg,
                        status: 'danger',
                        timeout: 2500
                    });
                  })
                }
            }).catch((error) => {
              UIkit.notification({
                  message: '<span uk-icon=\'icon: check\'></span> ' + error.errmsg,
                  status: 'danger',
                  timeout: 2500
              });
            });
            WatchedService.isWatched($scope.user._id ,$routeParams.movie_id).then((watched) => {
                $scope.movie.watched = watched;
                if (! watched.watched_id)
                  $scope.movie.watched = false;
            }).catch((error) => {
              UIkit.notification({
                  message: '<span uk-icon=\'icon: check\'></span> ' + error.errmsg,
                  status: 'danger',
                  timeout: 2500
              });
            });

            FollowService.isFollowingPage($scope.user._id ,$routeParams.movie_id).then((followed) => {
              $scope.movie.followed = followed;
            }).catch((error) => {
              UIkit.notification({
                  message: '<span uk-icon=\'icon: check\'></span> ' + error.errmsg,
                  status: 'danger',
                  timeout: 2500
              });
            });

            FollowService.friendsWatchingMedia($scope.user._id, $scope.movie._id)
            .then((response) => {
                $scope.friendsWatching = response;
            })
            .catch((error) => {
                console.log('error', error);
            });
          }).catch(function(){

          })
        })
        .catch((error) => {
            UIkit.notification({
                message: '<span uk-icon=\'icon: check\'></span> ' + error.errmsg,
                status: 'danger',
                timeout: 2500
            });
        });

    $scope.addToList = function(movieId, userListId){
        UserListService.addItem(userListId, movieId, $scope.user._id, date = moment())
        .then((added) => {
            $scope.movieAdded = true;
        })
        .catch((error) => {
            UIkit.notification({
                message: '<span uk-icon=\'icon: check\'></span> ' + error.errmsg,
                status: 'danger',
                timeout: 2500
            });
        });
    }

    $scope.removeFromList = function(movieId, userListId) {
      UserListService.loadUserList(userListId).then( function() {
        UserListService.getUserList()['itens'].forEach(function(item){
          if (item['_media']['_id'] == movieId) {
                   UserListService.deleteItem(userListId, $scope.user._id, item['ranked'])
              .then((deleted) => {
                $scope.movieAdded = false;
              })
              .catch((error) => {
                UIkit.notification({
                  message: '<span uk-icon=\'icon: check\'></span> ' + error.errmsg,
                  status: 'danger',
                  timeout: 2500
                });
              });
          }
        });
      });
    }

  $scope.markAsAdded = function(movieId, userListId) {
    UserListService.loadUserList(userListId).then( function() {
      UserListService.getUserList()['itens'].forEach(function(item){
        if (item['_media']['_id'] == movieId) {
          $scope.movieAdded = true;
        }
      });
    });
  }

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

    $scope.follow = function(movie){
        FollowService.followPage($scope.user._id, movie)
        .then((followed) => {
            $scope.movie.followed = followed;
            $scope.movie.followed.following_id = followed._id;
            $scope.movie.followed.is_following = true;

        })
        .catch((error) => {
            UIkit.notification({
                message: '<span uk-icon=\'icon: check\'></span> ' + error.errmsg,
                status: 'danger',
                timeout: 2500
            });
        });
    };

    $scope.unfollow = function(movie){
      var followId = movie.followed.following_id;
        FollowService.unfollowPage(followId)
        .then((followed) => {
            $scope.movie.followed = false;
        })
        .catch((error) => {
            UIkit.notification({
                message: '<span uk-icon=\'icon: check\'></span> ' + error.errmsg,
                status: 'danger',
                timeout: 2500
            });
        });
    }

    $scope.markAsNotWatched = function(watchedId){
        WatchedService.markAsNotWatched(watchedId)
        .then(() => {
            $scope.movie.watched = false;
            $scope.movie.rating = 0;
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

  $scope.rate = function(movieId, rating){
    if ($scope.movie.rated) {
        if (rating !== $scope.movie.rating) {
          $scope.updateRated($scope.movie.rated.rated_id, rating);
          $scope.updateRating(rating);
          UIkit.notification({
            message: '<span uk-icon=\'icon: check\'></span> Rating edited!',
            status: 'success',
            timeout: 1500
          });
        } else {
          $scope.markAsNotRated($scope.movie.rated.rated_id);
          $scope.updateRating(0);
          UIkit.notification({
            message: '<span uk-icon=\'icon: check\'></span> Rating removed!',
            status: 'warning',
            timeout: 1500
          });
        }

    } else {
        $scope.markAsRated(movieId, rating);
        $scope.updateRating(rating);
        UIkit.notification({
            message: '<span uk-icon=\'icon: check\'></span> Rated!',
            status: 'success',
            timeout: 1500
        });
    }
  }

  $scope.markAsRated = function(movieId, rating) {
    RatedService.markAsRated($scope.user._id, movieId, date = moment(), rating)
    .then((rated) => {
        $scope.movie.rated = rated;
    })
    .catch((error) => {
        UIkit.notification({
            message: '<span uk-icon=\'icon: check\'></span> ' + error.errmsg,
            status: 'danger',
            timeout: 2500
        });
    });
    }

    $scope.markAsNotRated = function(ratedId){
        RatedService.markAsNotRated(ratedId)
        .then(() => {
            $scope.movie.rated = false;
        })
        .catch((error) => {
            UIkit.notification({
                message: '<span uk-icon=\'icon: check\'></span> ' + error.errmsg,
                status: 'danger',
                timeout: 2500
            });
        });
    }

    $scope.updateRated = function (ratedId, rating){
      var ratedObj = {
          "date" : date = moment(),
          "rating" : rating,
          "_id" : ratedId
      };
      RatedService.updateRated(ratedObj);
    }

    $scope.updateRating = function(rating){
      $scope.movie.rating = rating;
    }

    $scope.range = function(count){
        var ratings = [];
        for (var i = 0; i < count; i++) {
            ratings.push(i+1)
        }
        return ratings;
    }

}]);
