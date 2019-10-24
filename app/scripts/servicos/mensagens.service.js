(function() {
    'use strict';
    angular.module('sejaDiretoApp').service('MensagensService', Service);

    function Service(toastr) {
        var service = {};
        var baseUrl = 'view/modal/';
        service.roxa = roxa;
        service.laranja = laranja;
        service.verde = verde;
        service.vermelha = vermelha;
        service.azul = azul;
        return service;

        function roxa(titulo, mensagem) {
            toastr.warning("<p align='justify'>" + mensagem + "</p>", titulo, {
                closeButton: true,
                timeOut: 4000,
                extendedTimeOut: 0,
                allowHtml: true,
                preventDuplicates: true,
                iconClass: 'toast-warning toast-lead'
            });
        }

        function laranja(titulo, mensagem) {
            toastr.warning("<p align='justify'>" + mensagem + "</p>", titulo, {
                closeButton: true,
                timeOut: 4000,
                extendedTimeOut: 0,
                allowHtml: true,
                preventDuplicates: true
            });
        }


        function vermelha(titulo, mensagem) {
            toastr.error("<p align='justify'>" + mensagem + "</p>", titulo, {
                closeButton: true,
                timeOut: 4000,
                extendedTimeOut: 2000,
                allowHtml: true,
                preventDuplicates: true
            });
        }

        function verde(titulo, mensagem) {
            toastr.success("<p align='justify'>" + mensagem + "</p>", titulo, {
                closeButton: true,
                timeOut: 4000,
                extendedTimeOut: 0,
                allowHtml: true,
                preventDuplicates: true
            });
        }


        function azul(titulo, mensagem) {
            toastr.warning("<p align='justify'>" + mensagem + "</p>", titulo, {
                closeButton: true,
                timeOut: 4000,
                extendedTimeOut: 0,
                allowHtml: true,
                preventDuplicates: true,
                iconClass: 'toast-warning toast-blue'
            });
        }
    }
})();