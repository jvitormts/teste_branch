(function() {
    'use strict';
    angular.module('sejaDiretoApp').directive('aeAtividadesVendedor', function() {
        return {
            'restrict': 'AE',
            'templateUrl': 'view/atividades/atividades.html?v=2',
            'scope': {
                'usuario': '=',
                'atividades': '='
            },
            bindToController: true,
            controllerAs: 'ctrl',
            'controller': function(ModalService) {
                this.openModal = ModalService.showLeadModalById;
            }
        }
    });
})();