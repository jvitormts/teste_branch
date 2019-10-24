(function() {
    'use strict';
    angular.module('sejaDiretoApp').controller('AtividadesController', Controller);

    function Controller(Atividades, ModalService, $state, $timeout) {
        var ctrl = {};
        ctrl.init = init;
        ctrl.atividades = Atividades.data;
        
        ctrl.openModal = ModalService.showLeadModalById;

        $timeout(function() {
            $(".ps-container").perfectScrollbar('update');
        });
        return ctrl;

        function init() {
            $timeout($state.reload, 60000);
        }
    }
})();