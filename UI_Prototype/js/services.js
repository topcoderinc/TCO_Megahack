/* global angular, $ */
(function () {
    'use strict';

    var appServices = angular.module('DMD.services', []);


    appServices.factory('dataServices', ['$http', '$q', function ($http, $q) {
        return {
            query: function (url) {
                var deferred = $q.defer();
                $http({method: 'GET', url: 'data/' + url + '.json'}).
                    success(function (data, status, headers, config) {
                        deferred.resolve(data);
                    }).
                    error(function (data, status, headers, config) {
                        deferred.reject(data);
                    });
                return deferred.promise;
            }
        };
    }]);

    appServices.factory('loadingServices', [function () {
        return {
            init: function () {
                if(document.querySelector('#loading')) {
                    return;
                }
                var $body = angular.element(document.querySelector('body'));
                $body.append('<div id="loading"><div class="loader"></div><div>')
            },
            show: function () {
                angular.element(document.querySelector('#loading')).css({'display': 'block'});
            },
            hide: function () {
                angular.element(document.querySelector('#loading')).css({'display': 'none'});
            }
        };
    }]);

})();
