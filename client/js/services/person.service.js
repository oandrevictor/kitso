var kitso = angular.module('kitso');

kitso.service('PersonService', ['$q','$http', function ($q, $http) {

    var person = {};
    var medias = {};

    // return available functions for use in the controllers
    return ({
        loadPerson: loadPerson,
        getPerson: getPerson,
        loadMedias: loadMedias,
        getMedias: getMedias,
        updatePerson: updatePerson,
        getAllPeople: getAllPeople
    });

    function loadPerson(id) {
        var deferred = $q.defer();

        $http.get('/api/person/' + id)
            .then((response) => {
                if (response.status === 200) {
                  var result = response.data;
                  result._appears_in.forEach(function(appearsIn){
                    if(appearsIn._media.helper){
                      appearsIn._media.helper = JSON.parse(appearsIn._media.helper)
                    }
                  });
                    deferred.resolve(result);
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

    function loadMedias(appearsIns) {
        var loadedMedias = [];
        appearsIns.forEach((appearsIn, i) => {
            loadedMedias[i] = appearsIn._media;
        });
        return loadedMedias;
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
                  deferred.resolve(person);
              } else {
                  deferred.reject();
              }
          })
          .catch(function (error) {
              deferred.reject(error.data);
          });

      return deferred.promise;
    }

    function getAllPeople(page){
        var deferred = $q.defer();
        var page_query = "";
        if (page){
          page_query = "?page=" + page;
        }
        $http.get('/api/person/' + page_query)
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
