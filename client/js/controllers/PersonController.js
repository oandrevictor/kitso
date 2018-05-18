kitso = angular.module('kitso');

kitso.controller('PersonController',
    ['$scope', '$location', '$timeout', 'PersonService', '$routeParams', 'AuthService',
        function($scope, $location, $timeout, PersonService, $routeParams, AuthService) {

            PersonService.loadPerson($routeParams.person_id)
                .then(() => {
                    AuthService.getStatus().then(function(){
                        $scope.user = AuthService.getUser();
                        $scope.person = PersonService.getPerson();
                        $scope.birthday_date_formated = moment($scope.person.birthday).format('DD/MM/YYYY');

                        $scope.mediasPersonAppears = [];

                        $scope.person._appears_in.forEach(function(media_id){
                            PersonService.loadMedia(media_id)
                                .then(() => {
                                    $scope.mediasPersonAppears.push(PersonService.getMedia());
                                })
                                .catch((error) => {
                                });
                        });

                        console.log($scope.mediasPersonAppears);

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

            $scope.editionMode = function () {
                $location.path('person/edit/' + $routeParams.person_id);
            };

            $scope.goToMedia = function (media) {
                if (media.__t === 'TvShow') {
                    $location.path('tvshow/' + media._id);
                } else if (media.__t === "Movie") {
                    $location.path('movie/' + media._id);
                }
            }
        }]);