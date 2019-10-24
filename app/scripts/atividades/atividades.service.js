(function() {
    'use strict';

    angular
        .module('sejaDiretoApp')
        .factory('AtividadesService', Service);

    function Service($http) {
        var service = {};

        service.get = get;

        return service;

        function get() {

            var req = {
                method: 'GET',
                url: 'atividades',
                headers: {
                    'Content-Type': 'application/json'
                }
            }

            return $http(req);
        }


    }
})();