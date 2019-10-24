(function() {
    'use strict';

    angular
        .module('sejaDiretoApp')
        .factory('AnexosService', Service);

    function Service($http) {
        var service = {};
        service.upload = upload;
        service.remove = remove;
        service.getAnexo = getAnexo;
        return service;

        function upload(arquivo){
            var req = {
                method: 'POST',
                url: 'anexo',
                headers: {
                    'Content-Type': 'application/octet-stream',
                    'filename':arquivo.name

                },
                data: arquivo
            }
            return $http(req);
        }


        function remove(id){
            var req = {
                method: 'DELETE',
                url: 'anexo/'+id
            }
            return $http(req);
        }


        function getAnexo(id){
            
            window.open("http://ws.sejadireto.com.br/anexo/"+id);
        }
    }
})();