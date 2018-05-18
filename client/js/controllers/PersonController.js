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

                        if ($scope.person._appears_in.length === 0) {
                            $scope.background = "/images/It-Follows-background.jpg"; // Criar um cover default do kisto
                        }

                        PersonService.loadMedias( $scope.person._appears_in)
                            .then(() => {
                                $scope.mediasPersonAppears = PersonService.getMedias();

                                $scope.background = ($scope.mediasPersonAppears[Math.floor((Math.random() * $scope.mediasPersonAppears.length))])['media']['images']['cover'];
                            })
                            .catch((error) => {
                                UIkit.notification({
                                    message: '<span uk-icon=\'icon: check\'></span> ' + 'Person medias data cannot be loaded. Sorry for that :(',
                                    status: 'danger',
                                    timeout: 2500
                                });
                            });


                    }).catch((error) => {
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
                }
            }
        }]);