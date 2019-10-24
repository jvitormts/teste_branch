(function() {
    'use strict';
    angular.module('sejaDiretoApp').controller('ProdutosController', Controller);

    function Controller(ConfigService, ProdutosService, $scope, ModalService, $mdDialog) {
        var ctrl = {};
        ctrl.profile = ConfigService.profile;
        ctrl.init = init;
        ctrl.buscarProdutos = buscarProdutos;
        ctrl.modalProduto = modalProduto;
        ctrl.salvarProduto = salvarProduto;
        ctrl.trocarSituacao=trocarSituacao;
        ctrl.init();

        return ctrl;

        function salvarProduto(produto) {
            if (produto.id) {
                ProdutosService.editProduto(produto).then(function() {
                    buscarProdutos(ctrl.filtros)
                    $scope.$close();
                });
            } else {
                produto.disponivel=true;
                ProdutosService.createProduto(produto).then(function() {
                    $mdDialog.show(
                        $mdDialog.alert()
                          .parent(angular.element(document.querySelector('#popupContainer')))
                          .clickOutsideToClose(true)
                          .title('Produto cadastrado com sucesso!')
                          //.textContent('Produto cadastrado com sucesso!')
                          .ariaLabel('Produto cadastrado com sucesso!')
                          .ok('Ok')
                      );
                    buscarProdutos(ctrl.filtros);
                    try{
                        $scope.$close();   
                    }catch(exception){
                        
                    }
                });
            }
        }

        function init() {
            ctrl.filtros = {
                page: 0,
                order: "p.descricao asc",
                disponivel: true
            };
            ctrl.paginas = 1;

            $scope.$watch("ctrl.filtros", function () {
                buscarProdutos(ctrl.filtros);
            }, true);
        }

        function modalProduto(produto) {
            produto = angular.copy(produto);

            ctrl.produto = produto;
            ctrl.produto.type = "produtoGenerico";
            ModalService.modalProdutoGenerico($scope);
        }


        function buscarProdutos(filtros) {
            filtros.texto = ctrl.filtroTexto ? ctrl.filtroTexto : null;
            filtros.codImovel = ctrl.filtroCod ? ctrl.filtroCod : null;
            ProdutosService.getProdutosFiltrados(filtros).then(function (result) {
                ctrl.lista = result.data.lista;
                ctrl.total = result.data.total;
                ctrl.paginas = result.data.pages;
            });

            $(".scroller-garbage").scrollTop(0);
        }

        function trocarSituacao(produto) {
            var p = angular.copy(produto);
            p.disponivel = !p.disponivel;
            salvarProduto(p);
        }

    }
})();