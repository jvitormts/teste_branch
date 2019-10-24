(function() {
    'use strict';
    angular.module('sejaDiretoApp').provider('myCSRF', [function() {
        var headerName = 'session';
        var cookieName = 'session';
        this.setHeaderName = function(n) {
            headerName = n;
        }
        this.setCookieName = function(n) {
            cookieName = n;
        }
        this.$get = ['$window', function($window) {
            return {
                'request': function(config) {
                    if($window.sessionStorage.session){
                        config.headers[headerName] = $window.sessionStorage.session;
                    }
                    return config;
                }
            }
        }];
    }]).config(function($httpProvider) {
        $httpProvider.interceptors.push('myCSRF');
    });
})();