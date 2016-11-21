/* global angular */
(function () {
    'use strict';


    var app = angular
        .module('EPA', [
            'ngRoute',
            'ngMaterial',
            "isteven-multi-select",
            'EPA.controllers'

        ])
        .config(['$routeProvider', function ($routeProvider) {
            $routeProvider
                .when('/home', {
                    templateUrl: 'partials/home.html',
                    controller: 'homeCtrl'
                })
                .when('/details', {
                    templateUrl: 'partials/details.html',
                    controller: 'detailsCtrl'
                })
                .when('/results', {
                    templateUrl: 'partials/results.html',
                    controller: 'resultsCtrl'
                })
                .otherwise({
                    redirectTo: '/home'
                });
        }]);


})();