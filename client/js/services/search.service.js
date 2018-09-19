var kitso = angular.module('kitso');

kitso.service('SearchService', ['$q','$http', function ($q, $http) {

    // return available functions for use in the controllers
    return ({
      search: search,
      getAutoComplete: getAutoComplete
    });

    function search(type, search){
      var deferred = $q.defer();

      $http.get('/api/search?type=' + type + '&search=' + search)
          .then((response) => {
              if (response.status === 200) {
                  var results = response.data;
                  deferred.resolve(results);
              } else {
                  deferred.reject();
              }
          })
          .catch((error) => {
              deferred.reject(error.data);
          });

      return deferred.promise;
    }

    function getAutoComplete(name){
      var deferred = $q.defer();
      var info = {name: name}

      $http.post('/api/search/getTaggable', info)
          .then(function (data) {
              if (data.status === 200) {
                  deferred.resolve(data);
              } else {
                  deferred.reject(data);
              }
          })
          .catch(function (error) {
              deferred.reject(error.data);
          });
      return deferred.promise;
    }

}]);
