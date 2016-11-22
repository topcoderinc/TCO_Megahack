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
    var extractCfrs = function(cfrString) {
        const cfrs = cfrString.substring('40 CFR'.length).match(/\d+/g);
        return cfrs;
    };
    var isCaa = function(cfrString) {
        var cfrs = extractCfrs(cfrString);
        for (let i = 0; i < cfrs.length; i++) {
            var cfr = parseInt(cfrs[i], 10);
            if (cfr >= 50 && cfr <= 98) {
                return true;
            }
        }
        
        return false;
    };


    // landing page controller
    appControllers.controller('homeCtrl',
        function ($scope, $rootScope, dataServices, $filter, $routeParams, loadingServices, $timeout, $location, $http) {
            $scope.selectedNaics = null;
            $scope.selectedSubstance = null;
            $scope.naicsSearchText = '';
            $scope.substanceSearchText = '';
            $scope.fixNaicsLabel = fixNaicsLabel;
            $scope.hasSelectedState = false;
              
            $scope.stateLang = {
                nothingSelected: "Select State..."
            };
            $scope.cityLang = {
                nothingSelected: "Select City..."
            };
            
            $scope.queries = {};
            $scope.states = [
                { name: 'Alabama', abbr: 'AL' },
                { name: 'Alaska', abbr: 'AK' },
                { name: 'Arizona', abbr: 'AZ' },
                { name: 'Arkansas', abbr: 'AR' },
                { name: 'California', abbr: 'CA' },
                { name: 'Colorado', abbr: 'CO' },
                { name: 'Connecticut', abbr: 'CT' },
                { name: 'Delaware', abbr: 'DE' },
                { name: 'Florida', abbr: 'FL' },
                { name: 'Georgia', abbr: 'GA' },
                { name: 'Hawaii', abbr: 'HI' },
                { name: 'Idaho', abbr: 'ID' },
                { name: 'Illinois', abbr: 'IL' },
                { name: 'Indiana', abbr: 'IN' },
                { name: 'Iowa', abbr: 'IA' },
                { name: 'Kansas', abbr: 'KS' },
                { name: 'Kentucky', abbr: 'KY' },
                { name: 'Louisiana', abbr: 'LA' },
                { name: 'Maine', abbr: 'ME' },
                { name: 'Maryland', abbr: 'MD' },
                { name: 'Massachusetts', abbr: 'MA' },
                { name: 'Michigan', abbr: 'MI' },
                { name: 'Minnesota', abbr: 'MN' },
                { name: 'Mississippi', abbr: 'MS' },
                { name: 'Missouri', abbr: 'MO' },
                { name: 'Montana', abbr: 'MT' },
                { name: 'Nebraska', abbr: 'NE' },
                { name: 'Nevada', abbr: 'NV' },
                { name: 'New Hampshire', abbr: 'NH' },
                { name: 'New Jersey', abbr: 'NJ' },
                { name: 'New Mexico', abbr: 'NM' },
                { name: 'New York', abbr: 'NY' },
                { name: 'North Carolina', abbr: 'NC'},
                { name: 'North Dakota', abbr: 'ND' },
                { name: 'Ohio', abbr: 'OH' },
                { name: 'Oklahoma', abbr: 'OK' },
                { name: 'Oregon', abbr: 'OR' },
                { name: 'Pennsylvania', abbr: 'PA' },
                { name: 'Rhode Island', abbr: 'RI' },
                { name: 'South Carolina', abbr: 'SC' },
                { name: 'South Dakota', abbr: 'SD' },
                { name: 'Tennessee', abbr: 'TN' },
                { name: 'Texas', abbr: 'TX' },
                { name: 'Utah', abbr: 'UT' },
                { name: 'Vermont', abbr: 'VT' },
                { name: 'Virginia', abbr: 'VA' },
                { name: 'Washington', abbr: 'WA' },
                { name: 'West Virginia', abbr: 'WV' },
                { name: 'Wisconsin', abbr: 'WI' },
                { name: 'Wyoming', abbr: 'WY' }
            ];
            $scope.countries = [{
                name: 'USA'
            }, {
                name: 'UK'
            }];
            $scope.cities = [];
            $scope.clearInput = function () {
                $scope.queries = {};
                $scope.cities.forEach(function (e) {
                    e.ticked = false;
                });
                $scope.states.forEach(function (e) {
                    e.ticked = false;
                });
                $scope.selectedNaics = null;
                $scope.selectedSubstance = null;
                $scope.naicsSearchText = '';
                $scope.substanceSearchText = '';
                $scope.hasSelectedState = false;
            };
            
            $scope.stateChanged = function() {
                if ($scope.state && $scope.state.length > 0) {
                    $scope.hasSelectedState = true;
                    
                    var abbr = $scope.state[0].abbr.toLowerCase();
                    var url = apiBase + '/api/lookups/cities?state=' + abbr;
                    $http({method: 'GET', url: url}).then(function(response) {
                        console.log(JSON.stringify(response.data, null, 2));
                        $scope.cities = response.data;
                    });
                }
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
                
                if ($scope.hasSelectedState && $scope.state && $scope.state.length > 0) {
                    criteria.state = $scope.state[0].abbr;
                }
                
                if ($scope.city && $scope.city.length > 0) {
                    criteria.city = $scope.city[0].name;
                }
                
                if ($scope.selectedNaics) {
                    criteria.naics = $scope.selectedNaics.code;
                } else if ($scope.naicsSearchText && $scope.naicsSearchText.trim().length > 0) {
                    criteria.naics = $scope.naicsSearchText;
                }
                
                if ($scope.queries.StreetAddress) {
                    criteria.street = $scope.queries.StreetAddress;
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
            $scope.criteria = null;
            $scope.isCaa = isCaa;
            
            $scope.loadDetails = function(documentId) {
                loadingServices.show();
                var url = apiBase + '/api/detail';
                var params = { documentId: documentId, cache: 1 };
                if ($rootScope.criteria) {
                    var locationKeys = ['street', 'city', 'state', 'zip'];
                    for (var i = 0; i < locationKeys.length; i++) {
                        var key = locationKeys[i];
                        if ($rootScope.criteria[key] && $rootScope.criteria[key].trim().length > 0) {
                            params[key == 'state' ? 'stateAbbr' : key] = $rootScope.criteria[key];
                        }
                    }
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
                var url = apiBase + '/api/search';
                $scope.criteria.offset += $scope.criteria.limit;
                $http({method: 'GET', url: url, params: $scope.criteria }).then(
                    function success(response) {
                        var items = response.data.items;
                        if (items && items.length > 0) {
                            for (var i = 0; i < items.length; i++) {
                                $scope.results.push(items[i]);
                            }
                        }
                        
                        loadingServices.hide();
                    },
                    function error() {
                        alert('The request could not be completed successfully. Please try again.');
                        loadingServices.hide();
                    }
                );
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
                        $rootScope.location = $scope.location;
                        
                        if (!$scope.map) {
                            $scope.map = new google.maps.Map(document.getElementById('search-map'), {
                                zoom: 10,
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
                
                if (criteria.street || criteria.city || criteria.state || criteria.zip) {
                    var address = '';
                    
                    if (criteria.street && criteria.street.trim().length > 0) {
                        address += criteria.street;
                    }
                    if (criteria.city && criteria.city.trim().length > 0) {
                        address += address.trim().length > 0 ? ', ' + criteria.city : criteria.city;
                    }
                    if (criteria.state && criteria.state.trim().length > 0) {
                        address += address.trim().length > 0 ? ', ' + criteria.state : criteria.state;
                    }
                    if (criteria.zip && criteria.zip.trim().length > 0) {
                        address += address.trim().length > 0 ? ', ' + criteria.zip : criteria.zip;
                    }
                    
                    address += address.trim().length > 0 ? ', USA' : 'USA';
                    
                    $scope.geocode(address);
                }
                
                $scope.criteria = $rootScope.criteria;
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
            $scope.pageLimit = pageLimit;
            $scope.isCaa = isCaa;
            $scope.markers = [];
            
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
                $window.open('https://www.regulations.gov/comment?D=' + $rootScope.documentId, '_blank');
            };
            
            $scope.loadMoreFacilities = function() {
                loadingServices.show();
                if ($scope.facilities.length > 0) {
                    for (var i = $scope.facilitiesOffset; i < $scope.facilities.length && i < $scope.facilitiesOffset + pageLimit; i++) {
                        $scope.displayedFacilities.push($scope.facilities[i]);
                    }
                    $scope.facilitiesOffset += pageLimit;
                
                    if (!$scope.map && $scope.location) {
                        $scope.map = new google.maps.Map(document.getElementById('details-map'), {
                            zoom: 10,
                            center: $scope.location
                        });
                    }
                    
                    if ($scope.map) {
                        for (var i = 0; i < $scope.displayedFacilities.length; i++) {
                            var facility = $scope.displayedFacilities[i];
                            var facilityLocation = { lat: parseFloat(facility.Latitude83), lng: parseFloat(facility.Longitude83) };
                            $scope.markers.push(new google.maps.Marker({
                                position: facilityLocation,
                                map: $scope.map,
                                title: facility.FacilityName}));
                        }
                    }
                }
                loadingServices.hide();
            };
            
            $scope.loadMoreNaics = function() {
                loadingServices.show();
                
                if ($scope.relatedNaics.length > 0) {
                    for (var i = $scope.naicsOffset; i < $scope.relatedNaics.length && i < $scope.naicsOffset + pageLimit; i++) {
                        $scope.displayedNaics.push($scope.relatedNaics[i]);
                    }
                    $scope.naicsOffset += pageLimit;
                }
                
                loadingServices.hide();
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
                
                $scope.facilitiesOffset = 0;
                $scope.naicsOffset = 0;
                $scope.displayedFacilities = [];
                $scope.displayedNaics = [];
                
                $scope.location = $rootScope.location;
                $scope.loadMoreFacilities();
                $scope.loadMoreNaics();
                
                console.log(JSON.stringify($scope.relatedNaics, null, 2));
                console.log(JSON.stringify($scope.displayedNaics, null, 2));
                
                if ($scope.map) {
                    setTimeout(function() {
                        google.maps.event.trigger($scope.map, 'resize');
                        if ($scope.markers.length > 0) {
                            $scope.map.setCenter($scope.markers[$scope.markers.length - 1].getPosition());
                        }
                    }, 1000);
                }
            }

            loadingServices.init();
            onDetailsLoaded();
        }
    );


})();
