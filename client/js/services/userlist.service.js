var kitso = angular.module('kitso');

kitso.service('UserListService', ['$q','$http', function ($q, $http) {

    var userlist = {};

    // return available functions for use in the controllers
    return ({
        addItem: addItem,
        loadUserList: loadUserList,
        getUserList: getUserList,
        updateUserList: updateUserList,
        isAdded: isAdded
    });

    function addItem(userlistId, mediaId, userId, date) {
      var deferred = $q.defer();

      var req = {
        method: 'POST',
        url: '/api/userlist/' + userlistId + '/item',
        headers: {
          'Content-Type': 'application/json',
          'user_id': userId
        },
        data: {
          "_media": mediaId,
          "date": date
          }
      }

      $http(req)
        .then((response) => {
          if (response.status === 200) {
            response.data.item_id = response.data._id
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

    function loadUserList(id) {
        var deferred = $q.defer();

        $http.get('/api/userlist/' + id)
            .then((response) => {
                if (response.status === 200) {
                    userlist = response.data;
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

    function getUserList() {
        return userlist;
    }

    function updateUserList(userlist) {
      var deferred = $q.defer();

      $http.put('/api/userlist/' + userlist._id, userlist)
          .then(function (response) {
              if (response.status === 200) {
                  userlist = response.data;
                  deferred.resolve(userlist);
              } else {
                  deferred.reject();
              }
          })
          .catch(function (error) {
              deferred.reject(error.data);
          });

      return deferred.promise;
    }

    function isAdded(mediaId) {
      var list = getUserList();
      list.forEach((item) => {
        if (item._media._id === mediaId) {
          return {
            "added": true,
            "date": item.date,
            "userlist": list
          };
        };
      });
      return {
        "added": false
      };
    }
}]);
