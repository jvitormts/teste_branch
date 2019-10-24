(function () {
    'use strict';
    angular.module('sejaDiretoApp').directive('formInteracoes', function () {
        return {
            'restrict': 'AE',
            'templateUrl': 'view/directives/form-interacoes.tmpl.html',
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
