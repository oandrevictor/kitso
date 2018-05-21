var kitso = angular.module('kitso');

kitso.service('MovieService', ['$q','$http', function ($q, $http) {

    var movie = {};

    // return available functions for use in the controllers
    return ({
        loadMovie: loadMovie,
        getMovie: getMovie,
        updateMovie: updateMovie,
        getAllMovies: getAllMovies
    });

    function loadMovie(id) {
        var deferred = $q.defer();

        $http.get('/api/movie/' + id)
            .then((response) => {
                if (response.status === 200) {
                    movie = response.data;
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

    function getMovie() {
        return movie;
    }

    function updateMovie(movie) {
      var deferred = $q.defer();

      $http.put('/api/movie/' + movie._id, movie)
          .then(function (response) {
              if (response.status === 200) {
                  movie = response.data;
                  deferred.resolve(movie);
              } else {
                  deferred.reject();
              }
          })
          .catch(function (error) {
              deferred.reject(error.data);
          });

      return deferred.promise;
    }

    function getAllMovies(){
      var deferred = $q.defer();
      $http.get('/api/movie/')
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
