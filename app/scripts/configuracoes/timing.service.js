(function() {
    'use strict';
    angular.module('sejaDiretoApp').factory('TimingService', Service);

    function Service() {
        var service = {};
        service.lastRequest = {};
        return service;
    }
})();