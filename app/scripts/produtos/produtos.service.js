(function() {
    'use strict';
    angular.module('sejaDiretoApp').factory('ProdutosService', Service);

    function Service($http) {
        var service = {};
        service.getProdutos = getProdutos;
        service.getProduto = getProduto;
        service.createProduto = createProduto;
        service.editProduto = editProduto;''
        service.getImoveis = getProdutosFiltrados;
        service.getProdutosFiltrados = getProdutosFiltrados;
        service.removeProduto = removeProduto;
        service.textoProduto = textoProduto;
        return service;

        function getProdutos() {
            
            var req = {
                method: 'GET',
                url: 'produto/getAll',
                headers: {
                    'Content-Type': 'application/json'
                },
            }
            return $http(req);
        }
        function getProduto(id) {
            
            var req = {
                method: 'GET',
                url: 'produto/'+id,
                headers: {
                    'Content-Type': 'application/json'
                },
            }
            return $http(req);
        }
        function getProdutosFiltrados(filtros) {
            if(!filtros){
                filtros = {page:1}
            }
            var req = {
                method: 'POST',
                url: 'produto/getProdutos',
                headers: {
                    'Content-Type': 'application/json'
                },
                data:filtros
            }
            return $http(req);
        }
        function createProduto(produto) {
            var req = {
                method: 'POST',
                url: 'produto',
                headers: {
                    'Content-Type': 'application/json'
                },
                data:produto
            }
            return $http(req);
        }

        function editProduto(produto) {
            var req = {
                method: 'PUT',
                url: 'produto/'+produto.id,
                headers: {
                    'Content-Type': 'application/json'
                },
                data:produto
            }
            return $http(req);
        }
        function removeProduto(id) {
            var req = {
                method: 'DELETE',
                url: 'produto/'+id,
                headers: {
                    'Content-Type': 'application/json'
                }
            }
            return $http(req);
        }
        function textoProduto(produto){
            if(!produto){
                return "";
            }
            if(produto.type == 'veiculo'){
                return produto.fabricante + ' ' + produto.modelo + validaCampo( produto.placa ) ;
            }else if (produto.type == 'imovel'){
                if(produto.titulo){
                    return produto.codImovel + " " + produto.tipo + " " + produto.titulo;
                }
                return produto.codImovel + " " + produto.tipo + " " + produto.quartos + " quartos / "+ produto.bairro; 
            }else if (produto.type == 'produtoGenerico'){
                return produto.descricao +  validaCampo(produto.modelo) + validaCampo(produto.tipo) + validaCampo(produto.unidade); 
            }
        }
        
        function validaCampo(texto){
            if(texto){
                return " - "+texto;
            }else{
                return "";
            }
        }
    }
})();