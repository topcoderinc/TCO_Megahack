/* global angular, $ */
(function () {
    'use strict';

    var appControllers = angular.module('EPA.controllers', ['DMD.services']);


    // landing page controller
    appControllers.controller('homeCtrl',
        function ($scope, $rootScope, dataServices, $filter, $routeParams, loadingServices, $timeout, $location) {
            $scope.queries = {};
            $scope.states = [{
                name: 'California'
            }, {
                name: 'Ohio'
            }];
            $scope.countries = [{
                name: 'USA'
            }, {
                name: 'UK'
            }];
            $scope.cities = [{
                name: 'New York'
            }, {
                name: 'London'
            }];
            $scope.clearInput = function () {
                $scope.$broadcast('angucomplete-alt:clearInput');
                $scope.queries = {};
            };
            $scope.goNext = function () {
                loadingServices.show();
                $timeout(function () {
                    $location.path('/results');
                    loadingServices.hide();
                }, 2000);
            };



            // show or hide loading indicator
            loadingServices.init();

        });

    appControllers.controller('resultsCtrl',
        function ($scope, $rootScope, dataServices, $filter, $routeParams, loadingServices, $timeout, $location) {
            
            $scope.goNext = function () {
                $location.path('/details');
            };
            $scope.goPrev = function () {
                $location.path('/home');
            };

            $scope.loadMore = function () {
                loadingServices.show();
                $timeout(function () {
                    loadingServices.hide();
                }, 2000);

            };
            loadingServices.init();
            
        }
    );

    appControllers.controller('detailsCtrl',
        function ($scope, $rootScope, dataServices, $filter, $routeParams, loadingServices, $timeout, $location) {
            loadingServices.init();
            
            $scope.currentIndex = 0;
            $scope.goPrev = function () {
                $location.path('/results');
            };

            $scope.loadMore = function () {
                loadingServices.show();
                $timeout(function () {
                    loadingServices.hide();
                }, 2000);

            };

            loadingServices.init();
            
        }
    );


})();