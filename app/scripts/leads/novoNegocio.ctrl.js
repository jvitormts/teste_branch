(function () {
  'use strict';
  angular.module('sejaDiretoApp').controller('NovoNegocioController', Controller);

  function Controller(LeadsService, ConfigService, $scope, ModalService, $state, MensagensService, $mdDialog, Equipes, ProdutosService, $localStorage) {
    var ctrl = {};
    ctrl.init = init;
    ctrl.loja = ConfigService.loja;
    ctrl.midias = ConfigService.midias;
    ctrl.canais = ConfigService.canais;
    ctrl.profile = ConfigService.profile;
    ctrl.equipes = Equipes.data;
    ctrl.usuarioID = null;
    ctrl.produtos = ConfigService.produtos ? ConfigService.produtos : [];
    ctrl.salvarNovoNegocio = salvarNovoNegocio;
    ctrl.checkCliente = checkCliente;
    ctrl.validarAcessoFuncao = ConfigService.validarAcessoFuncao;
    ctrl.buscarProdutos = buscarProdutos;
    ctrl.changeProduto = changeProduto;
    ctrl.checking = false;

    $scope.$watch("ctrl.novoNegocio", function (value) {
      $localStorage.novoNegocio = value;
    }, true);

    return ctrl;



    function salvarNovoNegocio() {
      if (!ctrl.novoNegocio.canalId) {
        MensagensService.laranja("Canal não preenchido", "O preenchimento do canal é obrigatório");
        return false;
      }
      if (!ctrl.novoNegocio.midiaId) {
        MensagensService.laranja("Campanha não preenchida", "O preenchimento da campanha é obrigatório");
        return false;
      }

      var cliente = angular.copy(ctrl.novoNegocio.clienteId);
      if (cliente && cliente.telefoneList && !cliente.telefoneList[0].telefone) {
        delete cliente.telefoneList;
      }
      LeadsService.checkCliente(cliente).then(function (result) {
        var objeto = result.data;
        if (objeto.resultado == 1) {
          $mdDialog.show(
            $mdDialog.alert()
            .parent(angular.element(document.querySelector('#popupContainer')))
            .clickOutsideToClose(true)
            .title('Lead reaberta')
            .textContent(objeto.message)
            .ariaLabel('Lead reaberta')
            .ok('Continuar')
          );
          $scope.$close();
        } else if (objeto.resultado == 2) {
          $mdDialog.show(
            $mdDialog.alert()
            .parent(angular.element(document.querySelector('#popupContainer')))
            .clickOutsideToClose(true)
            .title('Cliente já em atendimento')
            .textContent(objeto.message)
            .ariaLabel('Cliente já em atendimento')
            .ok('Continuar')
          );
          $scope.$close();
        } else if (objeto.resultado == 3) {
          $mdDialog.show(
            $mdDialog.alert()
            .parent(angular.element(document.querySelector('#popupContainer')))
            .clickOutsideToClose(true)
            .title('Cliente já atendido')
            .textContent(objeto.message)
            .ariaLabel('Lead reaberta')
            .ok('Continuar')
          );
          $scope.$close();
          LeadsService.refreshLeads();
          ModalService.showLeadModalById(objeto.lead.visualId);

        } else {
          ctrl.novoNegocio.produtoList[0].anoFabricacao = ctrl.novoNegocio.produtoList[0].anoFabricacao;
          ctrl.novoNegocio.produtoList[0].anoModelo = ctrl.novoNegocio.produtoList[0].anoModelo;
          ctrl.novoNegocio.clienteId.emailValidado = 'VALIDO';
          LeadsService.newLead(ctrl.novoNegocio).then(function (result) {
            $scope.$close();
            LeadsService.refreshLeads();
            ModalService.showLeadModalById(result.data.visualId);
            $localStorage.novoNegocio = {};
          }, function () {
            ctrl.disableButton = false;
            MensagensService.laranja("Falha", "Falha ao inserir novo negócio, tente novamente, caso o erro persista entre em contato com o suporte.");
          });
        }
      }, function () {
        ctrl.disableButton = false;
      });


    }

    function changeProduto(produto) {
      if (produto.type == 'imovel' && ctrl.loja.habilitaPreco) {
        ctrl.novoNegocio.valor = produto.valorAluguel;
      }
    }

    function checkCliente() {
      if (ctrl.checking) {
        return;
      }
      ctrl.checking = true;
      var cliente = angular.copy(ctrl.novoNegocio.clienteId);
      if (cliente && cliente.telefoneList && !cliente.telefoneList[0].telefone) {
        delete cliente.telefoneList;
      }
      if ((cliente.email && isEmail(cliente.email)) || cliente.telefoneList)
        LeadsService.checkCliente(cliente).then(function (result) {
          var objeto = result.data;
          if (objeto.resultado == 1) {
            $mdDialog.show(
              $mdDialog.alert()
              .parent(angular.element(document.querySelector('#popupContainer')))
              .clickOutsideToClose(true)
              .title('Lead reaberta')
              .textContent(objeto.message)
              .ariaLabel('Lead reaberta')
              .ok('Continuar')
            );
          } else if (objeto.resultado == 3) {
            /*$mdDialog.show(
              $mdDialog.alert()
                .parent(angular.element(document.querySelector('#popupContainer')))
                .clickOutsideToClose(true)
                .title('Cliente já atendido')
                .textContent(objeto.message)
                .ariaLabel('Cliente já atendido')
                .ok('Continuar')
            );*/
            $scope.$close();
            LeadsService.refreshLeads();
            ModalService.showLeadModalById(objeto.lead.visualId);
          }
          ctrl.checking = false;
        });
    }

    function isEmail(email) {
      var filter = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
      return filter.test(email);
    }

    function init() {
      if ($localStorage.novoNegocio && $localStorage.novoNegocio.clienteId) {
        ctrl.novoNegocio = $localStorage.novoNegocio;
      } else {
        ctrl.novoNegocio = {
          clienteId: {
            telefoneList: [{
              telefone: null
            }]
          },
          produtoList: [{}]
        };
      }
    }

    function buscarProdutos(searchText) {
      if (searchText && searchText.length >= 1) {
        return ProdutosService.getProdutosFiltrados({
          texto: searchText,
          disponivel: true
        }).then(function (result) {
          ctrl.produtos = result.data.lista;
          ctrl.produtos.forEach(function (element) {
            element.texto = ProdutosService.textoProduto(element);
          }, this);
          return ctrl.produtos;
        });
      }
    }

  }
})();
