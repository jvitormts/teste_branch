(function () {
  'use strict';
  angular.module('sejaDiretoApp').controller('EncerradasController', Controller);

  function Controller(ConfigService, Equipes, ListaLeadsService, $scope, ModalService, $timeout, LeadsService, $stateParams, EquipeService, $q, $filter) {
    var ctrl = {};
    ctrl.init = init;
    ctrl.rede = ConfigService.rede;
    ctrl.canais = ConfigService.canais;
    ctrl.profile = ConfigService.profile;
    ctrl.motivos = ConfigService.motivos;
    ctrl.validarAcessoTela = ConfigService.validarAcessoTela;
    ctrl.equipes = Equipes.data;
    ctrl.openModal = leadModal;
    ctrl.listar = listar;
    ctrl.exportarExcel = exportarExcel;
	ctrl.periodoInicial = 'today';
	ctrl.filterMotivos=filterMotivos;
    ctrl.validarAcessoFuncao = ConfigService.validarAcessoFuncao;

    return ctrl;

    function init() {
      $timeout(function () {
        var filtros = {};
        if ($stateParams.filtros.dateRange) {
		  filtros = angular.copy($stateParams.filtros);
		  var motivo = ctrl.motivos.find(function(item){
			  return item.id == filtros.motivo;
		  });
		  filtros.motivos = [motivo];
		  delete $stateParams.filtros;
        }

        filtros.order = 'closedAt DESC';

        var todosVendedores = [];

        EquipeService.getAllUsers().then(function (users) {
          todosVendedores = users.data;
          var equipeTodas = {
            id: 0,
            nome: "Todas",
            usuariosList: todosVendedores
          };
          ctrl.equipes.push(equipeTodas);

          filtros.equipe = equipeTodas;
        });

        ConfigService.getMidiasListasRelatorios().then(function (result) {
          ctrl.midias = result.data;
        });

        ctrl.filtros = filtros;
      });

      $timeout(function () {
        $scope.$watch("ctrl.filtros", function (novo, velho) {

          if (!velho) {
            return;
          }
          if (novo.page == velho.page && velho.page != 0) {
            ctrl.filtros.page = 0;
            return;
          }

          listar();
        }, true);
      }, 1500);
    }

    function leadModal(lead) {
      ctrl.modal = ModalService.showLeadModalById(lead.visualId);

      //gambiarrissima, não achei outro jeito.
      LeadsService.funcaoRefresh = listar;
    }

    function listar(page) {
      if (ctrl.filtros.inicio && ctrl.filtros.fim && moment(ctrl.filtros.inicio, "DD/MM/YYYY").isSameOrBefore(moment(ctrl.filtros.fim, "DD/MM/YYYY"))) {
        
		if (ctrl.filtros.motivos && ctrl.filtros.motivos.length > 0 && ctrl.filtros.situacaoLead != 'PERDIDA') {
			ctrl.filtros.situacaoLead = 'PERDIDA';
			return;
		}
        var filtros = {
          closedAtInicio: moment(ctrl.filtros.inicio, "DD/MM/YYYY").hours(0).minutes(0).utc().format(),
          closedAtFim: moment(ctrl.filtros.fim, "DD/MM/YYYY").hours(23).minutes(59).utc().format()
		};

		if(ctrl.filtros.motivos){
			filtros.motivoIds = ctrl.filtros.motivos.map(function(item){
				return item.id;
			});
		}

        if (ctrl.filtroTexto) {
          filtros.busca = ctrl.filtroTexto;
          filtros.page = 0;
        }

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

	function filterMotivos(texto){
		var deferred = $q.defer();
		console.log(ctrl.motivos);
		var motivos = { data : $filter('filter')(ctrl.motivos,{name:texto}) } ;

		console.log( motivos );
		deferred.resolve(motivos);

		return deferred.promise;
	}
    function exportarExcel() {
      var filtros = angular.copy(ctrl.filtros);
      delete filtros.page;
      if (filtros.inicio && filtros.fim) {
        filtros.closedAtInicio = moment(filtros.inicio, "DD/MM/YYYY").hours(0).minutes(0).utc().format();
        filtros.closedAtFim = moment(filtros.fim, "DD/MM/YYYY").hours(23).minutes(59).utc().format();
        if (ctrl.filtroTipo) {
          filtros.tipoProduto = ctrl.filtroTipo;
        }
        filtros.filtroTexto = ctrl.filtroTexto;
        ListaLeadsService.getExcel(filtros, 'encerradas').then(function (result) {
          saveAs(result.data, 'relatorioEncerradas' + moment().locale('pt-br').format("LL") + '.xlsx');
        });
      }
    }

  }
})();
