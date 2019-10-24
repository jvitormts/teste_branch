(function () {
  'use strict';
  angular.module('sejaDiretoApp').controller('TagsController', Controller);

  function Controller(ConfigService, ListaLeadsService, $scope, ModalService, LeadsService) {
    var ctrl = {};
    ctrl.init = init;
    ctrl.loja = ConfigService.loja;
    ctrl.getTags = ConfigService.getTags;
    ctrl.openModal = leadModal;

    return ctrl;

    function init() {
      ctrl.filtros = {
        page: 0,
        tags: [],
        order: 'createdAt DESC'
      };
      $scope.$watch("ctrl.filtros", function (novo, velho) {
        if (novo.page == velho.page && velho.page != 0) {
          ctrl.filtros.page = 0;
          return;
        }
        listar();
	  }, true);
	 

    }

    function leadModal(leadId) {
      ctrl.modal = ModalService.showLeadModalById(leadId);

      //gambiarrissima, não achei outro jeito.
      LeadsService.funcaoRefresh = listar;
    }

    function listar() {
      var filtros = {};
      if (ctrl.filtros.tags.length > 0 || ctrl.filtros.leadId ) {
        ListaLeadsService.get(angular.extend(filtros, ctrl.filtros)).then(function (result) {
          if (result.data) {
            ctrl.lista = result.data.listaNova;
            ctrl.registros = result.data.registros;
            if (result.data.pages >= 0)
              ctrl.paginas = result.data.pages;
          }
        });
      }
    }
  }
})();
