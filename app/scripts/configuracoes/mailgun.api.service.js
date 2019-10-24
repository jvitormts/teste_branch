(function() {
    'use strict';

    angular
        .module('sejaDiretoApp')
        .factory('MailgunApiService', Service);

    function Service($http, $sce) {
        var service = {};
        var publicKey='pubkey-81f2140e87e586ac0bce7064ab5cceee';
        service.validateEmail = validateEmail;

        return service;

        function validateEmail(email){
            return $http.jsonp($sce.trustAsResourceUrl('https://api.mailgun.net/v3/address/validate?address='+email+'&api_key='+publicKey));
        }
    }
})();