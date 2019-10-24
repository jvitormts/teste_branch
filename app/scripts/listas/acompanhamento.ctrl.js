(function () {
    'use strict';
    angular.module('sejaDiretoApp').controller('AcompanhamentoController', Controller);

    function Controller(Equipes, AcompanhamentoService, ModalService, ProdutosService, $localStorage, $timeout, ConfigService, MensagensService, BloqueadorService) {
        var ctrl = {};
        ctrl.init = init;
        ctrl.equipes = Equipes.data;
        ctrl.openModal = ModalService.showLeadModalById;
        ctrl.filtros = {};
        ctrl.periodoInicial = 'today';
        ctrl.order = '-contato.createdAt';
        ctrl.textoProduto = ProdutosService.textoProduto;
        ctrl.listar = listar;
        ctrl.loja = ConfigService.loja;
        return ctrl;

        function init() {

            ctrl.filtros = {dtypes: ['', 'ICT', 'ICW', 'IV', 'IO', 'ICE']};
            var todosVendedores = [];
            ctrl.equipes.forEach(function (equipe) {
                todosVendedores = todosVendedores.concat(equipe.usuariosList);
            });
            var equipeTodas = {
                id: 0,
                nome: "Todas",
                usuariosList: todosVendedores
            };
            ctrl.equipes.push(equipeTodas);

            ctrl.filtros.equipe = equipeTodas;

            ctrl.min_date = moment.utc(ctrl.loja.createdAt).locale('pt-br');
            ctrl.lista = [];


            var tenMinutesAgo = new Date().getTime() - 600000;
            if ($localStorage.filtrosAcompanhamento) {
                ctrl.filtros = $localStorage.filtrosAcompanhamento;
            }
            if ($localStorage.ultimaBuscaAcompanhamento && $localStorage.ultimaBuscaAcompanhamento.timestamp >= tenMinutesAgo) {
                ctrl.lista = $localStorage.ultimaBuscaAcompanhamento.data;
                ctrl.registros = $localStorage.ultimaBuscaAcompanhamento.registros;
                ctrl.paginas = $localStorage.ultimaBuscaAcompanhamento.pages;
            } else {
                listar();
            }
            ctrl.showTooltip = true;

            $timeout(function () {
                ctrl.showTooltip = false;
            }, 5000);


            $timeout(function () {
                $('div.drop-hover').hover(function () {
                    $(this).parent().find('.dropdown-menu').stop(true, true).delay(200).fadeIn(500);
                }, function () {
                    $(this).parent().find('.dropdown-menu').stop(true, true).delay(200).fadeOut(500);
                });
            });
        }

        function listar() {

            $('body').css('cursor', 'wait');
            $('a').css('cursor', 'wait');

            var datas = {
                dataInicio: moment(ctrl.filtros.inicio, "DD/MM/YYYY").hours(0).minutes(0).utc().format(),
                dataFim: moment(ctrl.filtros.fim, "DD/MM/YYYY").hours(23).minutes(59).utc().format()
            };
            $localStorage.filtrosAcompanhamento = ctrl.filtros;
            BloqueadorService.bloquear();
            AcompanhamentoService.getAcompanhamento(angular.extend(datas, ctrl.filtros)).then(function (result) {
                if (result.data) {
                    ctrl.lista = result.data.lista;
                    ctrl.registros = result.data.registros;
                    if (result.data.pages) {
                        ctrl.paginas = result.data.pages;
                    }
                    if (ctrl.registros == 0) {
                        MensagensService.laranja('Dados não encontrados', 'Nenhum dado encontrado para os filtros selecionados');
                    }

                    $localStorage.ultimaBuscaAcompanhamento = {
                        data: result.data.lista,
                        registros: result.data.registros,
                        timestamp: new Date().getTime(),
                        pages: result.data.pages
                    };
                    $(".scroller-acompanhamento").scrollTop(0);
                    $(".ps-container").perfectScrollbar('update');
                } else {
                    MensagensService.laranja('Dados não encontrados', 'Nenhum dado encontrado para os filtros selecionados');
                }
            }).catch(function () {
                MensagensService.vermelha('Erro na pesquisa', 'Houve um erro ao executar a pesquisa.');
            }).finally(function () {
                BloqueadorService.desbloquear();
                $('body').css('cursor', 'default');
                $('a').css('cursor', 'pointer');
            });
        }
    }
})();