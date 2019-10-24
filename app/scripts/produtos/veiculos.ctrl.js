(function() {
    'use strict';
    angular.module('sejaDiretoApp').controller('VeiculosController', Controller);

    function Controller(ConfigService, ProdutosService, Produtos, MensagensService, ModalService, $scope, $state, $mdDialog, $window) {
        var ctrl = {};
        ctrl.profile = ConfigService.profile;
        ctrl.produtos = Produtos.data;
        ctrl.init = init;
        ctrl.modalProduto = modalProduto;
        ctrl.salvarProduto = salvarProduto;
        ctrl.trocarSituacao = trocarSituacao;
        ctrl.removerProduto = removerProduto;
        ctrl.modalProduto = modalProduto;
        return ctrl;

        function init() {}

        function modalProduto(produto) {
            produto = angular.copy(produto);

            ctrl.produto = produto;
            ctrl.produto.type = "veiculo";
            ModalService.modalProdutoVeiculo($scope);
        }

        function salvarProduto(produto) {
            if (produto.id) {
                ProdutosService.editProduto(produto).then(function() {
                    $state.reload();
                    $scope.$close();
                });
            } else {
                ProdutosService.createProduto(produto).then(function(result) {
                    if(result.data ==2){
                        $mdDialog.show($mdDialog.alert().parent(angular.element(document.querySelector('#popupContainer'))).clickOutsideToClose(true).title("Veículo ja cadastrado").textContent("O veículo já estava cadastrado no sistema. Seus dados foram atualizados.").ariaLabel("Veículo ja cadastrado").ok('Continuar'));
                    } else{
                        $mdDialog.show(
                            $mdDialog.alert()
                              .parent(angular.element(document.querySelector('#popupContainer')))
                              .clickOutsideToClose(true)
                              .title('Produto cadastrado com sucesso!')
                              //.textContent('Produto cadastrado com sucesso!')
                              .ariaLabel('Produto cadastrado com sucesso!')
                              .ok('Ok')
                          );
                    }
                    $state.reload();
                    try{
                        $scope.$close();   
                    }catch(exception){
                        
                    }
                });
            }
        }

        function removerProduto(produto) {
            var parentEl = angular.element(document.html);
            $window.scrollTo(0, 0);
            var confirm = $mdDialog.confirm().parent(parentEl).title('Exclusão de Produto')
            .textContent('Deseja excluir o produto? (Essa operação não poderá ser desfeita)')
            .ariaLabel('Lucky day').ok('SIM').cancel('NÃO');
            $mdDialog.show(confirm).then(function() {
                ProdutosService.removeProduto(produto.id).then(function() {
                    $state.reload();
                },function(){
                MensagensService.vermelha("Exclusão de produto", "O produto não pôde ser excluido, verifique se o mesmo não está vinculado à uma lead.");
            });
            }, function() {

            });
        }

        function trocarSituacao(produto) {
            produto.situacao = produto.situacao == 'EM_ESTOQUE' ? 'VENDIDO' : 'EM_ESTOQUE';
            salvarProduto(produto);
        }
    }
})();