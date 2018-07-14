var kitso = angular.module('kitso');

kitso.service('TvShowService', ['$q', '$http', function ($q, $http) {

    var tvshow = {};

    // return available functions for use in the controllers
    return ({
        loadTvShow: loadTvShow,
        getTvShow: getTvShow,
        updateTvShow: updateTvShow,
        updateTvShowInfo: updateTvShowInfo,
        getAllShows: getAllShows,
        loadEpisode: loadEpisode,
        loadSeason: loadSeason
    });

    function loadSeason(showId, season){
      var deferred = $q.defer();

      $http.get('/api/tvShow/' + showId + '/season/' + season)
          .then((response) => {
              if (response.status === 200) {
                  var found_season = response.data;
                  deferred.resolve(found_season);
              } else {
                  deferred.reject();
              }
          })
          .catch((error) => {
              deferred.reject(error.data);
          });

      return deferred.promise;
    }

    function loadEpisode(showId, season, episode){
      $http.get('/api/tvShow/' + showId + '/season/' + season + '/' + episode)
          .then((response) => {
              if (response.status === 200) {
                  var found_episode = response.data;
                  deferred.resolve(found_episode);
              } else {
                  deferred.reject();
              }
          })
          .catch((error) => {
              deferred.reject(error.data);
          });

      return deferred.promise;

    }

    function loadTvShow(id) {
        var deferred = $q.defer();

        $http.get('/api/tvShow/' + id)
            .then((response) => {
                if (response.status === 200) {
                    tvshow = response.data;
                    deferred.resolve();
                } else {
                    deferred.reject();
                }
            })
            .catch((error) => {
                deferred.reject(error.data);
            });

        return deferred.promise;
    }

    function getTvShow() {
        return tvshow;
    }

    function updateTvShow(tvShow) {
        var deferred = $q.defer();

        $http.put('/api/tvshow/' + tvShow._id, tvShow)
            .then(function (response) {
                if (response.status === 200) {
                    tvshow = response.data;
                    deferred.resolve(tvshow);
                } else {
                    deferred.reject();
                }
            })
            .catch(function (error) {
                deferred.reject(error.data);
            });

        return deferred.promise;
      }
  
    function updateTvShowInfo(tvShowId) {
      var deferred = $q.defer();
      
      let data = {
        "_tvshow_id": tvShowId
      };
      
      $http.put('/api/updatetvshow/', data)
        .then(function (response) {
          if (response.status === 200) {
            deferred.resolve(response.data);
          } else {
            deferred.reject();
          }
        })
        .catch(function (error) {
          deferred.reject(error.data);
        });
      
      return deferred.promise;
    }
    
    function getAllShows(){
      var deferred = $q.defer();
      $http.get('/api/tvshow/')
          .then((response) => {
              if (response.status === 200) {
                  deferred.resolve(response.data);
              } else {
                  deferred.reject();
              }
          })
          .catch((error) => {
              deferred.reject(error.data);
          });
      return deferred.promise;
    }

}]);
