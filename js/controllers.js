/* global angular, $ */
(function () {
    'use strict';

    var apiBase = 'http://tco-megahack:3100';
    var defaultDateFormat = "MM/dd/yyyy 'at' h:mm a";
    var pageLimit = 10;
    
    var geocodeBase = 'https://maps.googleapis.com/maps/api/geocode/json';
    
    var appControllers = angular.module('EPA.controllers', ['DMD.services']);
    var fixNaicsLabel = function(label) {
        return label.replace(/\d{3,}/, '');
    };

    // landing page controller
    appControllers.controller('homeCtrl',
        function ($scope, $rootScope, dataServices, $filter, $routeParams, loadingServices, $timeout, $location, $http) {
            $scope.selectedNaics = null;
            $scope.selectedSubstance = null;
            $scope.naicsSearchText = '';
            $scope.substanceSearchText = '';
            $scope.fixNaicsLabel = fixNaicsLabel;
              
            $scope.stateLang = {
                nothingSelected: "Select State..."
            };
            $scope.cityLang = {
                nothingSelected: "Select City..."
            };
            
            $scope.queries = {};
            $scope.states = [
                { name: 'Alabama' },
                { name: 'Alaska' },
                { name: 'Arizona' },
                { name: 'Arkansas' },
                { name: 'California' },
                { name: 'Colorado' },
                { name: 'Connecticut' },
                { name: 'Delaware' },
                { name: 'Florida' },
                { name: 'Georgia' },
                { name: 'Hawaii' },
                { name: 'Idaho' },
                { name: 'Illinois' },
                { name: 'Indiana' },
                { name: 'Iowa' },
                { name: 'Kansas' },
                { name: 'Kentucky' },
                { name: 'Louisiana' },
                { name: 'Maine' },
                { name: 'Maryland' },
                { name: 'Massachusetts' },
                { name: 'Michigan' },
                { name: 'Minnesota' },
                { name: 'Mississippi' },
                { name: 'Missouri' },
                { name: 'Montana' },
                { name: 'Nebraska' },
                { name: 'Nevada' },
                { name: 'New Hampshire' },
                { name: 'New Jersey' },
                { name: 'New Mexico' },
                { name: 'New York' },
                { name: 'North Carolina' },
                { name: 'North Dakota' },
                { name: 'Ohio' },
                { name: 'Oklahoma' },
                { name: 'Oregon' },
                { name: 'Pennsylvania' },
                { name: 'Rhode Island' },
                { name: 'South Carolina' },
                { name: 'South Dakota' },
                { name: 'Tennessee' },
                { name: 'Texas' },
                { name: 'Utah' },
                { name: 'Vermont' },
                { name: 'Virginia' },
                { name: 'Washington' },
                { name: 'West Virginia' },
                { name: 'Wisconsin' },
                { name: 'Wyoming' }
            ];
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
                $scope.queries = {};
                $scope.cities.forEach(function (e) {
                    e.ticked = false;
                });
                $scope.states.forEach(function (e) {
                    e.ticked = false;
                });
            };
            
            $scope.lookupNaics = function(naics) {
                var url = apiBase + '/api/lookups/naics';
                var params = (naics && naics.trim().length > 0) ? { searchTerm: naics } : null;
                return $http({ method: 'GET', url: url, params: params }).then(function(response) {
                   return response.data.items; 
                });
            };
            
            $scope.lookupSubstances = function(substance) {
                var url = apiBase + '/api/lookups/substances';
                var params = (substance && substance.trim().length > 0) ? { searchTerm: substance } : null;
                return $http({ method: 'GET', url: url, params: params }).then(function(response) {
                   return response.data.items; 
                });
            };
            
            $scope.goNext = function() {
                $rootScope.searchResults = [];
                $rootScope.totalResults = 0;
                
                var url = apiBase + '/api/search';
                var criteria = {};
                
                if ($scope.state && $scope.state.length > 0) {
                    criteria.state = $scope.state[0].name;
                }
                
                if ($scope.selectedNaics) {
                    criteria.naics = $scope.selectedNaics.code;
                } else if ($scope.naicsSearchText && $scope.naicsSearchText.trim().length > 0) {
                    criteria.naics = $scope.naicsSearchText;
                }
                
                if ($scope.queries.ZipCode &&
                    $scope.queries.ZipCode.trim().length > 0) {
                    criteria.zip = $scope.queries.ZipCode;
                }
                
                if ($scope.selectedSubstance) {
                    criteria.substance = $scope.selectedSubstance.name;
                } else if ($scope.substanceSearchText && $scope.substanceSearchText.trim().length > 0) {
                    criteria.substance = $scope.substanceSearchText;
                }
                
                
                if ($scope.queries.ProgramName &&
                    $scope.queries.ProgramName.trim().length > 0) {
                    criteria.program = $scope.queries.ProgramName;
                }
                
                criteria.offset = 0;
                criteria.limit = pageLimit;
                
                $rootScope.criteria = criteria;
                loadingServices.show();
                $http({method: 'GET', url: url, params: criteria }).then(
                    function success(response) {
                        if (response.data.items && response.data.items.length > 0) {
                            $rootScope.searchResults = response.data.items;
                            $rootScope.totalResults = response.data.total;
                        } else {
                            $rootScope.searchResults = [];
                            $rootScope.totalResults = 0;
                        }
                        $location.path('/results');
                        loadingServices.hide();
                    },
                    function error() {
                        alert('The request could not be completed successfully. Please try again.');
                        loadingServices.hide();
                    }
                );
            };

            // show or hide loading indicator
            loadingServices.init();
        });

    appControllers.controller('resultsCtrl',
        function ($scope, $rootScope, dataServices, $filter, $routeParams, loadingServices, $timeout, $location, $http) {
            $scope.dateFormat = defaultDateFormat;
            $scope.tableHeaders = ['Document ID', 'Document Title', 'Clean Air Act', 'Due Date', 'Action'];
            $scope.results = [];
            $scope.total = 0;
            $scope.map = null;
            
            $scope.loadDetails = function(documentId) {
                loadingServices.show();
                var url = apiBase + '/api/detail';
                var params = { documentId: documentId };
                if ($rootScope.criteria &&
                    $rootScope.criteria.zip &&
                    $rootScope.criteria.zip.trim().length > 0) {
                    params.zip = $rootScope.criteria.zip;
                }
                $http({method: 'GET', url: url, params: params }).then(
                    function success(response) {
                        $rootScope.documentId = documentId;
                        $rootScope.currentDocument = response.data;
                        $location.path('/details');
                        loadingServices.hide();
                    },
                    function error() {
                        alert('The request could not be completed successfully. Please try again.');
                        loadingServices.hide();
                    }
                );
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
        
            function onResultsLoaded() {
                if (!$rootScope.criteria) {
                    $location.path('/');
                    return;
                }
                
                var criteria = $rootScope.criteria;
                angular.element(document.getElementsByClassName('search-query-value-state')[0]).html(
                    criteria.state ? criteria.state : '<i>Unspecified</i>'
                );
                angular.element(document.getElementsByClassName('search-query-value-substance')[0]).html(
                    criteria.substance ? criteria.substance : '<i>Unspecified</i>'
                );
                angular.element(document.getElementsByClassName('search-query-value-naics')[0]).html(
                    criteria.naics ? criteria.naics : '<i>Unspecified</i>'
                );
                angular.element(document.getElementsByClassName('search-query-value-program')[0]).html(
                    criteria.program ? criteria.program : '<i>Unspecified</i>'
                );
                
                var applyLocationToMap = function(address) {
                    if ($scope.location) {
                        if (!$scope.map) {
                            $scope.map = new google.maps.Map(document.getElementById('search-map'), {
                                zoom: 12,
                                center: $scope.location
                            });
                        }
                        
                        var marker = new google.maps.Marker({
                            position: $scope.location,
                            map: $scope.map,
                            title: address
                        });
                        $scope.map.setCenter(marker.getPosition());
                    }
                };
                
                $scope.geocode = function(address) {
                    return $http({ method: 'GET', url: geocodeBase, params: { address: address } }).then(function(response) {
                        var results = response.data.results;
                        if (results && results.length > 0) {
                            $scope.location = results[0].geometry.location;
                            applyLocationToMap(address);
                        }
                        return response.data.results && response.data.results.length > 0 ? response.data.results[0] : null;
                    });
                };
                
                if (criteria.state || criteria.zip) {
                    var address = 'USA';
                    if (criteria.zip.trim().length > 0) {
                        address = criteria.zip + ', USA'; 
                    } else if (criteria.state.trim().length > 0) {
                        address = criteria.state + ', USA';
                    }
                    
                    var addressGeocode = $scope.geocode(address);
                    console.log(JSON.stringify(addressGeocode, null, 2));
                }
                
                $scope.results = $rootScope.searchResults;
                $scope.total = $rootScope.totalResults;
            }
            
            loadingServices.init();
            onResultsLoaded();            
        }
    );

    appControllers.controller('detailsCtrl',
        function ($scope, $rootScope, dataServices, $filter, $routeParams, loadingServices, $timeout, $location, $window) {
            $scope.map = null;
            $scope.documentId = null;
            $scope.currentDocument = null;
            $scope.fixNaicsLabel = fixNaicsLabel;
            
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

            $scope.commentRule = function () {
                $window.open('https://www.regulations.gov/document?D=' + $rootScope.documentId, '_blank');
            };
            
            function onDetailsLoaded() {
                if (!$rootScope.documentId || !$rootScope.currentDocument) {
                    $location.path('/home');
                    return;
                }
                
                $scope.documentId = $rootScope.documentId;
                $scope.currentDocument = $rootScope.currentDocument;
                $scope.facilities = $scope.currentDocument.facilities;
                $scope.affectedPrograms = $scope.currentDocument.programs;
                $scope.relatedNaics = $scope.currentDocument.naics;
                $scope.regulations = $scope.currentDocument.allRegulations;
                
                if ($scope.facilities.length > 0) {
                    if (!$scope.map) {
                        $scope.map = new google.maps.Map(document.getElementById('details-map'), {
                            zoom: 12,
                            center: $scope.location
                        });
                    }
                    
                    var markers = [];
                    for (let i = 0; i < $scope.facilities.length; i++) {
                        var facility = $scope.facilities[i];
                        var facilityLocation = { lat: facility.Latitude83, lng: facility.Longitude83 };
                        markers.push(new google.maps.Marker({
                            position: facilityLocation,
                            map: $scope.map,
                            title: facility.FacilityName}));
                    }
                    $scope.map.setCenter(markers[0].getPosition());
                }
            }

            loadingServices.init();
            onDetailsLoaded();
        }
    );


})();