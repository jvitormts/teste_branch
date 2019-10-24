(function () {
    'use strict';
    angular.module('sejaDiretoApp').controller('ImoveisController', Controller);

    function Controller(ConfigService, ProdutosService, $scope) {
        var ctrl = {};
        ctrl.profile = ConfigService.profile;
        ctrl.init = init;
        ctrl.buscarImoveis = buscarImoveis;
        ctrl.init();

        return ctrl;

        function init() {
            ctrl.filtros = {
                page: 0,
                order: "i.codImovel asc"
            };
            ctrl.paginas = 1;

            $scope.$watch("ctrl.filtros", function () {
                buscarImoveis(ctrl.filtros);
            }, true);
        }

        function buscarImoveis(filtros) {
            filtros.texto = ctrl.filtroTexto ? ctrl.filtroTexto : null;
            filtros.codImovel = ctrl.filtroCod ? ctrl.filtroCod : null;
            ProdutosService.getImoveis(filtros).then(function (result) {
                ctrl.lista = result.data.lista;
                ctrl.total = result.data.total;
                ctrl.paginas = result.data.pages;
            });

            $(".scroller-garbage").scrollTop(0);
        }

        function trocarSituacao(produto) {
            produto.disponivel = !produto.disponivel;
            salvarProduto(produto);
        }

    }

    angular.module('sejaDiretoApp').filter('zpad', function () {
        return function (input, n) {
            if (input === undefined)
                input = ""
            if (input.length >= n)
                return input
            var zeros = "0".repeat(n);
            return (zeros + input).slice(-1 * n)
        };
    });
})();