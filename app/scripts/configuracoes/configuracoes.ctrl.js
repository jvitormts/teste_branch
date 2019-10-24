(function () {
  'use strict';
  angular.module('sejaDiretoApp').controller('ConfiguracoesController', Controller);

  function Controller(ConfigService, $state, $scope, $mdDialog, ModalService, MensagensService, $timeout) {
    var ctrl = {};
    ctrl.loja = angular.copy(ConfigService.loja);
    ctrl.horario = angular.copy(ConfigService.horario);
    ctrl.motivos = angular.copy(ConfigService.motivos);
    ctrl.etapas = angular.copy(ConfigService.etapas);
    ctrl.midias = angular.copy(ConfigService.midias);
    ctrl.perfis = angular.copy(ConfigService.perfis);
    ctrl.rede = ConfigService.rede;
    ctrl.resetData = resetData;
    ctrl.textoDiaSemana = textoDiaSemana;
    ctrl.salvarLoja = salvarLoja;
    ctrl.salvarHorarios = salvarHorarios;
    ctrl.init = init;
    ctrl.selecionaEtapa = selecionaEtapa;
    ctrl.salvarEtapa = salvarEtapa;
    ctrl.novoMotivo = novoMotivo;
    ctrl.salvarMotivo = salvarMotivo;
    ctrl.novaMidia = novaMidia;
    ctrl.salvarMidia = salvarMidia;
    ctrl.removerMotivo = removerMotivo;
    ctrl.removerMidia = removerMidia;
    ctrl.modalPerfil = modalPerfil;
    ctrl.salvarPerfil = salvarPerfil;
	ctrl.removerPerfil = removerPerfil;
	ctrl.removeCampo = removeCampo;
	ctrl.addCampo = addCampo;
    return ctrl;
	function removeCampo(index){
		if(ctrl.loja.campos[index].id >0){
			ctrl.loja.campos[index].ativo = false;
		}else{
			ctrl.loja.campos.splice(index,1);
		}
	}
	function addCampo(tabela){
		if(ctrl.loja.campos){
			ctrl.loja.campos.push({ativo:true, tabela:tabela});
		}else{
			ctrl.loja.campos = [{ativo:true, tabela:tabela}];
		}
	}
    function init() {
		ctrl.tiposCampo = [
			{
				descricao: 'Tipo de Campo'
			},
			{
				descricao: 'Genérico',
				valor: 'TEXTO'
			},
			{
				descricao: 'Sim/Não',
				valor: 'BOOLEAN'
			},
			{
				descricao: 'Seleção',
				valor: 'SELECT'
			},
			{
				descricao: 'Data',
				valor: 'DATA'
			}
		];
		ctrl.horario.forEach(function (horario) {
			horario.inicio = moment.utc(horario.inicio).format('HH:mm');
			horario.fim = moment.utc(horario.fim).format('HH:mm');

			switch (horario.dia) {
			case 'DOMINGO':
				horario.ordem = 0;
				break;
			case 'SEGUNDA':
				horario.ordem = 1;
				break;
			case 'TERCA':
				horario.ordem = 2;
				break;
			case 'QUARTA':
				horario.ordem = 3;
				break;
			case 'QUINTA':
				horario.ordem = 4;
				break;
			case 'SEXTA':
				horario.ordem = 5;
				break;
			default:
				horario.ordem = 6;
			}
		});
      var etapa = ctrl.etapas.filter(function (obj) {
        return obj.ordem == 0;
      })[0];
      selecionaEtapa(etapa);
    }

    function resetData(campo) {

      ctrl[campo] = [];
      ctrl[campo] = angular.copy(ConfigService[campo]);

      if (campo == 'horario') {
        ctrl.horario.forEach(function (horario) {
          horario.inicio = moment.utc(horario.inicio).format('HH:mm');
          horario.fim = moment.utc(horario.fim).format('HH:mm');
        });
      } else if (campo == 'etapas') {
        var etapa = ctrl.etapas.filter(function (obj) {
          return obj.id == ctrl.etapaSelecionada.id;
        })[0];
        selecionaEtapa(etapa);
      }
    }

    function salvarLoja() {
      ConfigService.editConfig({
        loja: ctrl.loja
      }, 'loja').then(function (result) {
        reload('loja');
      });
    }

    function salvarEtapa() {
      ConfigService.editEtapa(ctrl.etapaSelecionada).then(function (result) {
        reload('etapas');
      });
    }

    function selecionaEtapa(etapa) {
      $timeout(function () {
        ctrl.etapaSelecionada = angular.copy(etapa);
      });
    }

    function reload(campo) {
      ConfigService.fillConfigAndParameters().then(function (data) {
        //ConfigService = data;
        resetData(campo);
      });
    }

    function salvarHorarios() {
      var horarios = angular.copy(ctrl.horario);
      horarios.forEach(function (horario) {
        horario.inicio = moment.utc(horario.inicio, 'HH:mm').format();
        horario.fim = moment.utc(horario.fim, 'HH:mm').format();
      });

      ConfigService.editConfig({
        horario: horarios
      }, 'horario').then(function () {
        reload('horario');
      });
    }

    function textoDiaSemana(dia) {
      switch (dia) {
        case 'DOMINGO':
          return 'Domingo';
        case 'SEGUNDA':
          return 'Segunda-feira';
        case 'TERCA':
          return 'Terça-feira';
        case 'QUARTA':
          return 'Quarta-feira';
        case 'QUINTA':
          return 'Quinta-feira';
        case 'SEXTA':
          return 'Sexta-feira';
        default:
          return 'Sábado';
      }
    }

    function novoMotivo() {
      // Appending dialog to document.body to cover sidenav in docs app
      var confirm = $mdDialog.prompt().title('Novo Motivo de Encerramento').textContent('Digite a descrição do motivo de encerramento').placeholder('Motivo de encerramento').ariaLabel('Motivo de encerramento').required('true').ok('Salvar').cancel('Cancelar');
      $mdDialog.show(confirm).then(function (result) {
        ConfigService.newMotivo({
          name: result
        }).then(function () {
          reload('motivos');
        });
      }, function () {});
    }

    function salvarMotivo(motivo) {
      motivo.edit = false;
      ConfigService.editMotivo(motivo).then(function () {
        reload('motivos');
      });
    }

    function removerMotivo(motivo) {
      // Appending dialog to document.body to cover sidenav in docs app
      var confirm = $mdDialog.confirm().title('Remover Motivo de Encerramento').textContent('Deseja realmente excluir o motivo de encerramento?').ok('NÃO').cancel('CONFIRMAR EXCLUSÃO');
      $mdDialog.show(confirm).then(function (result) {
        // nao faz nada
      }, function () {
        ConfigService.removerMotivo(motivo.id).then(function () {
          reload('motivos');
        });
      });
    }

    function salvarMidia(midia) {
      midia.edit = false;
      ConfigService.editMidia(midia).then(function () {
        reload('midias');
      });
    }

    function removerMidia(midia) {
      // Appending dialog to document.body to cover sidenav in docs app
      var confirm = $mdDialog.confirm().title('Remover Campanha').textContent('Deseja realmente excluir a campanha?').ok('NÃO').cancel('CONFIRMAR EXCLUSÃO');
      $mdDialog.show(confirm).then(function (result) {
        // nao faz nada
      }, function () {
        ConfigService.removerMidia(midia.id).then(function () {
          reload('midias');
        });
      });
    }

    function novaMidia() {
      // Appending dialog to document.body to cover sidenav in docs app
      var confirm = $mdDialog.prompt().title('Nova Campanha').textContent('Digite o nome da nova campanha').placeholder('Campanha').ariaLabel('Campanha').required('true').ok('Salvar').cancel('Cancelar');
      $mdDialog.show(confirm).then(function (result) {
        ConfigService.newMidia({
          nome: result
        }).then(function () {
          reload('midias');
        });
      }, function () {});
    }

    function modalPerfil(perfil) {
      ctrl.menu = ConfigService.menu.filter(function (tela) {
        if (tela.permissao != 1024) {
          return tela;
        }
      }).map(function (obj) {
        obj.selecionado = perfil.segurancaTela & obj.permissao ? true : false;
        return obj;
      });
      ctrl.funcoes = ConfigService.getPermissoesFuncoes().map(function (obj) {
        obj.selecionado = perfil.segurancaFuncao & obj.permissao ? true : false;
        return obj;
      });
      ctrl.perfil = perfil;
      ModalService.modalPerfil($scope);
    }

    function removerPerfil(perfil) {
      // Appending dialog to document.body to cover sidenav in docs app
      var confirm = $mdDialog.confirm().title('Remover Perfil').textContent('Deseja realmente excluir o Perfil? (O perfil não poderá ser excluido se algum usuário estiver associado)').ok('NÃO').cancel('CONFIRMAR EXCLUSÃO');
      $mdDialog.show(confirm).then(function (result) {
        // nao faz nada
      }, function () {
        ConfigService.removerPerfil(perfil.id).then(function () {
          reload('motivos');
        }, function () {
          MensagensService.vermelha('Exclusão de perfil', 'Não foi possível excluir o perfil');
        });
      });
    }

    function salvarPerfil() {
      var menu = ctrl.menu.map(function (obj) {
        return obj.selecionado ? obj.permissao : 0;
      }).reduce(function (a, b) {
        return a + b;
      });
      var funcoes = 1 + ctrl.funcoes.map(function (obj) {
        return obj.selecionado ? obj.permissao : 0;
      }).reduce(function (a, b) {
        return a + b;
      }); // mapea os selecionados e ja soma os valores de permissao.
      if (!menu) {
        MensagensService.laranja('Selecione as permissões', 'Favor selecionar as permissões de acesso do perfil');
        return false;
      }
      if (menu & 16) {
        menu = menu | 1024;
      }
      ctrl.perfil.segurancaTela = menu;
      ctrl.perfil.segurancaFuncao = funcoes;
      if (ctrl.perfil.id > 0) {
        ConfigService.editPerfil(ctrl.perfil).then(function () {
          reload('perfis');
        });
      } else {
        ConfigService.newPerfil(ctrl.perfil).then(function () {
          reload('perfis');
        });
      }
      return true;
    }
  }
})();
