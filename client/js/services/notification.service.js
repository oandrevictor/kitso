var kitso = angular.module('kitso');

kitso.service('NotificationService', ['$q', '$http', function ($q, $http) {
    // return available functions for use in the controllers
    return ({
        getNotifications: getNotifications,
        getNotificationsRequest: getNotificationsRequest,
        create: create,
        setViewed: setViewed,
        deleteNotification: deleteNotification
    });

    function create(notification) {
        var deferred = $q.defer();

        $http.post('/api/notification/', notification)
            .then(function (data) {
              if (data.status === 200) {
                deferred.resolve();
              } else {
                deferred.reject();
              }
            })
            .catch(function (error) {
              deferred.reject(error.data);
            });

        return deferred.promise;
    }

    function getNotificationsRequest(user_id) {
        // create a new instance of deferred
        var deferred = $q.defer();

        $http.get('/api/notification/' + user_id)
            .then(function (response) {
                if (response.status === 200) {
                    this.notifications = response.data;
                    deferred.resolve(response.data);
                } else {
                    deferred.reject();
                }
            })
            .catch(function (error) {
                user = error.data;
                deferred.reject(error.data);
            });

        return deferred.promise;
    }

    function getNotifications() {
      return this.notifications;
    }

    function setViewed(notification) {
      var deferred = $q.defer();

      $http.put('/api/notification/' + notification._id, { "viewed": true })
          .then(function (response) {
              if (response.status === 200) {
                  deferred.resolve();
              } else {
                  deferred.reject();
              }
          })
          .catch(function (error) {
              deferred.reject(error.data);
          });

      return deferred.promise;
    }

    function deleteNotification(notification) {
      var deferred = $q.defer();
      var req = {
        method: 'DELETE',
        url: '/api/notification/' + notification._id,
        headers: {
          'Content-Type': 'application/json'
        }
      }

      $http(req)
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
