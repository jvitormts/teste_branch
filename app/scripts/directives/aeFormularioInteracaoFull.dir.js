(function () {
    'use strict';
    angular.module('sejaDiretoApp').directive('formInteracoesFull', function () {
        return {
            'restrict': 'AE',
            'templateUrl': 'view/directives/form-interacoes.full.tmpl.html',
            'scope': {
                lead: '=',
                init: '=',
                mobile: '=',
                formOpen: '='
            },
            'controller': 'FormularioInteracaoController as ctrl'
        }
    });
})();
