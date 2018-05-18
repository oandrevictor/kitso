var kitso = angular.module('kitso');

kitso.service('PersonService', ['$q','$http', function ($q, $http) {

    var person = {};
    var medias = {};

    // return available functions for use in the controllers
    return ({
        loadPerson: loadPerson,
        getPerson: getPerson,
        loadMedias: loadMedias,
        getMedias: getMedias
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

    function loadMedias(mediasId) {
        var deferred = $q.defer();

        var data = {
            "medias": mediasId
        };

        $http.post('/api/media/list', data)
            .then((response) => {
                if (response.status === 200) {
                    medias = response.data;
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

    function getMedias() {
        return medias;
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
