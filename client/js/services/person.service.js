var kitso = angular.module('kitso');

kitso.service('PersonService', ['$q','$http', function ($q, $http) {

    var person = {};
    var media = {};

    // return available functions for use in the controllers
    return ({
        loadPerson: loadPerson,
        getPerson: getPerson,
        loadMedia: loadMedia,
        getMedia: getMedia
    });

    function loadPerson(id) {
        var deferred = $q.defer();

        $http.get('/api/person/' + id)
            .then((response) => {
                if (response.status === 200) {
                    person = response.data;
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

    function getPerson() {
        return person;
    }

    function loadMedia(id) {
        var deferred = $q.defer();

        $http.get('/api/media/' + id)
            .then((response) => {
                if (response.status === 200) {
                    media = response.data;
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

    function getMedia() {
        return media;
    }

    function updatePerson(person) {
      var deferred = $q.defer();

      $http.put('/api/person/' + person._id, person)
          .then(function (response) {
              if (response.status === 200) {
                  person = response.data;
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
}]);
