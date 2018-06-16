kitso = angular.module('kitso');

kitso.controller('PersonController',
  ['$scope', '$location', '$timeout', '$route', '$routeParams', 'PersonService', 'AuthService', 'FollowService',
    function ($scope, $location, $timeout, $route, $routeParams, PersonService, AuthService, FollowService) {

      PersonService.loadPerson($routeParams.person_id)
        .then((loadedPerson) => {
          AuthService.getStatus()
            .then(() => {
              $scope.user = AuthService.getUser();
              $scope.person = loadedPerson;
              $scope.birthday_date_formated = moment($scope.person.birthday).format('DD/MM/YYYY');
              $scope.deathday_date_formated = moment($scope.person.deathday).format('DD/MM/YYYY');
              FollowService.isFollowingPage($scope.user._id, $routeParams.person_id)
                .then((followed) => {
                  $scope.person.followed = followed;
                })
                .catch((error) => {
                  UIkit.notification({
                    message: '<span uk-icon=\'icon: check\'></span> ' + error.errmsg,
                    status: 'danger',
                    timeout: 2500
                  });
              });
              FollowService.countFollowers($routeParams.person_id)
                .then((count) => {
                  $scope.person.followers = count;
                })
                .catch((error) => {
                  UIkit.notification({
                    message: '<span uk-icon=\'icon: check\'></span> ' + error.errmsg,
                    status: 'danger',
                    timeout: 2500
                  });
              });
              $('.full-loading').hide();
              if (!$scope.person.image_url) {
                $scope.person.image_url = "/images/person-edited.png";
              }

              if ($scope.person._appears_in.length === 0) {
                $scope.background = "/images/purple-edit-placeholder.jpg"; // Criar um cover default do kisto
              } else {
                $scope.mediasPersonAppears = PersonService.loadMedias($scope.person._appears_in);
                $scope.background = ($scope.person._appears_in[Math.floor((Math.random() * $scope.person._appears_in.length))])['_media']['helper']['backdrop_path'];
              }

            }).catch((error) => {
              console.log($scope.mediasPersonAppears);
              UIkit.notification({
                message: '<span uk-icon=\'icon: check\'></span> ' + 'Something went wrong. Try to reload the page.',
                status: 'danger',
                timeout: 2500
              });
            });
        })
        .catch((error) => {
          UIkit.notification({
            message: '<span uk-icon=\'icon: check\'></span> ' + 'Person data cannot be loaded. Sorry for that :(',
            status: 'danger',
            timeout: 2500
          });
        });

      $scope.editionMode = function () {
        $location.path('person/edit/' + $routeParams.person_id);
      };

      $scope.goToMedia = function (media) {
        if (media.__t === 'TvShow') {
          $location.path('tvshow/' + media._id);
        } else if (media.__t === "Movie") {
          $location.path('movie/' + media._id);
        } else if (media.__t === "Episode"){
          $location.path('tvshow/' + media._tvshow_id + '/season/'+ media.season_number);
        }
      }

      $scope.follow = function(person){
        FollowService.followPage($scope.user._id, person)
        .then((followed) => {
          $scope.person.followed = followed;
          $scope.person.followed.following_id = followed._id;
          $scope.person.followed.is_following = true;
        })
        .catch((error) => {
          UIkit.notification({
            message: '<span uk-icon=\'icon: check\'></span> ' + error.errmsg,
            status: 'danger',
            timeout: 2500
          });
        });
        FollowService.countFollowers($routeParams.person_id)
          .then((count) => {
            $scope.person.followers = count;
          })
          .catch((error) => {
            UIkit.notification({
              message: '<span uk-icon=\'icon: check\'></span> ' + error.errmsg,
              status: 'danger',
              timeout: 2500
            });
        });
    };

    $scope.unfollow = function(person){
      var followId = person.followed.following_id;
      FollowService.unfollowPage(followId)
      .then((followed) => {
          $scope.person.followed = false;
      })
      .catch((error) => {
          UIkit.notification({
              message: '<span uk-icon=\'icon: check\'></span> ' + error.errmsg,
              status: 'danger',
              timeout: 2500
          });
      });
      FollowService.countFollowers($routeParams.person_id)
        .then((count) => {
          $scope.person.followers = count;
        })
        .catch((error) => {
          UIkit.notification({
            message: '<span uk-icon=\'icon: check\'></span> ' + error.errmsg,
            status: 'danger',
            timeout: 2500
          });
      });
    }

    $scope.range = function(count){
      var ratings = [];
      for (var i = 0; i < count; i++) {
        ratings.push(i+1)
      }
      return ratings;
    }
    }]);
