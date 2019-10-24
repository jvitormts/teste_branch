(function () {
    'use strict';
    angular.module('sejaDiretoApp').controller('ClientesController', Controller);

    function Controller(ConfigService, ProdutosService, ListaLeadsService, $timeout, ModalService, Equipes, LeadsService, $filter, $scope, $localStorage, $q, $rootScope, MensagensService, BloqueadorService) {
        var ctrl = {};
        ctrl.init = init;
        ctrl.loja = ConfigService.loja;
        ctrl.campos = ctrl.loja.campos;
        ctrl.rede = ConfigService.rede;
        ctrl.getTags = ConfigService.getTags;
        ctrl.canais = ConfigService.canais;
        ctrl.profile = ConfigService.profile;
        ctrl.buscarProdutos = buscarProdutos;
        ctrl.motivos = ConfigService.motivos;
        ctrl.equipes = Equipes.data;
        ctrl.openModal = leadModal;
        ctrl.validarAcessoTela = ConfigService.validarAcessoTela;
        ctrl.filtros = {order: 'createdAt DESC'};
        ctrl.exportarExcel = exportarExcel;
        ctrl.periodoInicial = 'today';
        ctrl.listar = listar;
        ctrl.getTags = ConfigService.getTags;
        ctrl.validarAcessoFuncao = ConfigService.validarAcessoFuncao;
        ctrl.order = order;
        ctrl.textoCampo = textoCampo;
        ctrl.filterMotivos = filterMotivos;

        ctrl.getEtapas = getEtapas;
        ctrl.getUsuarios = getUsuarios;
        ctrl.textoEquipes = textoEquipes;

        return ctrl;


        function filterMotivos(texto) {
            var deferred = $q.defer();
            var motivos = {data: $filter('filter')(ctrl.motivos, {name: texto})};

            deferred.resolve(motivos);

            return deferred.promise;
        }

        function textoCampo(coluna, lead) {
            if (lead.camposPersonalizados) {
                angular.extend(lead, JSON.parse(lead.camposPersonalizados));
                delete lead.camposPersonalizados;
            }
            switch (coluna.campo) {
                case "situacao":
                    return "";
                case "data":
                    return moment(lead[ctrl.filtros.campoData]).locale('pt-br').format('DD/MM/YYYY HH:mm:ss');
                case "valor":
                    return "R$ " + $filter('number')(lead.valor, 2);
                case "produto":
                    return lead.veiculo || lead.imovel || lead.produtoGenerico;
                case "nomeCliente":
                    return (lead.nomeCliente ? lead.nomeCliente : 'Não Preenchido') + (lead.codigoOportunidadeSiebel ? ' - ' + lead.codigoOportunidadeSiebel : '');
                default:
                    return lead[coluna.campo];
            }
        }

        function order(campo) {
            if (campo.indexOf('field#') > -1) {
                return;
            }
            if (campo != 'data') {
                ctrl.filtros.order = ctrl.filtros.order == campo + ' ASC' ? campo + ' DESC' : campo + ' ASC';
            } else {
                ctrl.filtros.order = ctrl.filtros.order == ctrl.filtros.campoData + ' ASC' ? ctrl.filtros.campoData + ' DESC' : ctrl.filtros.campoData + ' ASC';
            }
            listar();
        }

        function init() {
            ctrl.min_date = moment.utc(ctrl.loja.createdAt).locale('pt-br');


            ListaLeadsService.getMinMaxValor().then(function (result) {
                if (result.data) {
                    var valores = result.data.split("##");
                    ctrl.sliderOptions = {
                        floor: parseInt(valores[0]),
                        ceil: parseInt(valores[1]),
                    };

                    if (!ctrl.filtros.valorMinimo) {
                        ctrl.filtros.valorMinimo = ctrl.sliderOptions.floor;
                    }
                    if (!ctrl.filtros.valorMaximo) {
                        ctrl.filtros.valorMaximo = ctrl.sliderOptions.ceil;
                    }
                    $rootScope.$broadcast('rzSliderForceRender');
                }
            });

            ConfigService.getMidiasListasRelatorios().then(function (result) {
                ctrl.midias = result.data;
            });

            $timeout(function () {
                $('div.drop-hover').hover(function () {
                    $(this).parent().find('.dropdown-menu').stop(true, true).delay(200).fadeIn(500);
                }, function () {
                    $(this).parent().find('.dropdown-menu').stop(true, true).delay(200).fadeOut(500);
                });
            });

            ctrl.showTooltip = true;

            $timeout(function () {
                ctrl.showTooltip = false;
            }, 5000);

            if ($localStorage.colunasClientes && $localStorage.colunasClientes.length > 0) {
                ctrl.colunas = $localStorage.colunasClientes;
            } else {
                ctrl.colunas = getColunas();
            }
            if ($localStorage.filtrosCliente) {
                ctrl.filtros = $localStorage.filtrosCliente;

                $rootScope.$broadcast('rzSliderForceRender');
                if (ctrl.filtros.equipes && ctrl.filtros.equipes.length > 0) {
                    ctrl.equipes.forEach(function (equipe) {
                        ctrl.filtros.equipes.forEach(function (equipeFiltro) {
                            if (equipeFiltro.id == equipe.id) {
                                equipe.selected = true;
                            }
                        });
                    });
                }

                listar(0);

            }

            if (!ctrl.filtros.order) {
                ctrl.filtros.order = ctrl.filtros.campoData + ' DESC';
            }

            $scope.$watch("ctrl.colunas", function (value) {
                $localStorage.colunasClientes = value;
                ctrl.filtros.colunas = $filter('filter')(value, {selected: true});
            }, true);

            $scope.$watch("ctrl.equipes", function () {
                ctrl.etapas = getEtapas();
                ctrl.usuarios = getUsuarios();
            }, true);
        }

        function getColunas() {

            var colunas = [
                {
                    campo: 'data',
                    titulo: 'Data',
                    fixo: true,
                    selected: true
                },
                {
                    campo: 'nomeCliente',
                    titulo: 'Nome do Cliente',
                    fixo: true,
                    selected: true
                },
                {
                    campo: 'situacao',
                    titulo: 'Situacao',
                    fixo: false,
                    icons: {
                        'GANHA': 'fa-trophy',
                        'PERDIDA': 'fa-thumbs-down',
                        'ENCAMINHADA': 'fa-share-square-o fa-rotate-180',
                        'ABERTA': 'fa-filter',
                        'ADIADA': 'fa-calendar'
                    }
                },
                {
                    campo: 'telefone',
                    titulo: 'Telefone(s)',
                    fixo: false,
                    selected: true
                },
                {
                    campo: 'contatos',
                    titulo: 'Interações',
                    fixo: false,
                    selected: true
                },
                {
                    campo: 'motivo',
                    titulo: 'Motivo Cancelamento',
                    fixo: false
                },
                {
                    campo: 'etapa',
                    titulo: 'Etapa do Funil',
                    fixo: false
                },
                {
                    campo: 'midia',
                    titulo: 'Campanha',
                    fixo: false,
                    selected: true
                },
                {
                    campo: 'canal',
                    titulo: 'Canal',
                    fixo: false,
                    selected: true
                },
                {
                    campo: 'email',
                    titulo: 'E-mail',
                    fixo: false,
                    selected: true
                },
                {
                    campo: 'produto',
                    titulo: 'Produto',
                    fixo: false
                },
                {
                    campo: 'valor',
                    titulo: 'Valor',
                    fixo: false,
                    moeda: true
                },
                {
                    campo: 'visualId',
                    titulo: 'Id. Lead',
                    fixo: false
                },
                {
                    campo: 'tags',
                    titulo: 'Etiquetas',
                    fixo: false
                },
                {
                    campo: 'usuario',
                    titulo: 'Responsável',
                    fixo: false
                },
                {
                    campo: 'cpfCnpj',
                    titulo: 'CPF/CNPJ',
                    fixo: false
                },
                {
                    campo: 'empresa',
                    titulo: 'Empresa',
                    fixo: false
                }
            ];

            if (ctrl.campos && ctrl.campos.length > 0) {
                ctrl.campos.forEach(function (item) {
                    colunas.push({
                        campo: "field#" + item.id,
                        titulo: item.nome,
                        fixo: false
                    })
                });
            }

            return colunas;

        }

        function leadModal(leadId) {
            ctrl.modal = ModalService.showLeadModalById(leadId);
        }

        function listar(pagina) {
            $localStorage.filtrosCliente = ctrl.filtros;
            var filtros = {};
            if (pagina !== undefined) {
                filtros.page = ctrl.filtros.page = pagina;
            }
            ctrl.filtros.equipes = ctrl.equipes.filter(function (item) {
                return item.selected;
            });
            var campoData = ctrl.filtros.campoData;

            filtros[campoData + 'Inicio'] = moment(ctrl.filtros.inicio, "DD/MM/YYYY").hours(0).minutes(0).utc().format();
            filtros[campoData + 'Fim'] = moment(ctrl.filtros.fim, "DD/MM/YYYY").hours(23).minutes(59).utc().format();

            $('body').css('cursor', 'wait');
            $('a').css('cursor', 'wait');

            delete filtros.valorMaximo;
            delete filtros.valorMinimo;
            filtros = angular.extend(filtros, ctrl.filtros);
            if (ctrl.sliderOptions) {
                if (filtros.valorMaximo == ctrl.sliderOptions.ceil) {
                    delete filtros.valorMaximo;
                }
                if (filtros.valorMinimo == ctrl.sliderOptions.floor) {
                    delete filtros.valorMinimo;
                }
            } else {
                delete filtros.valorMaximo;
                delete filtros.valorMinimo;
            }
            if (filtros.motivos && filtros.motivos.length > 0) {
                filtros.motivoIds = filtros.motivos.map(function (item) {
                    return item.id;
                });
            }
            if (filtros.equipes && filtros.equipes.length > 0) {
                filtros.equipeIds = [];

                filtros.equipes.forEach(function (item) {
                    if (item.selected)
                        filtros.equipeIds.push(item.id);
                });
            }
            BloqueadorService.bloquear();
            ListaLeadsService.get(filtros).then(function (result) {
                if (result.data) {
                    ctrl.lista = result.data.listaNova;
                    ctrl.registros = result.data.registros;
                    if (result.data.pages >= 0) {
                        ctrl.paginas = result.data.pages;
                    }
                    if (ctrl.registros == 0) {
                        MensagensService.laranja('Dados não encontrados', 'Nenhum dado encontrado para os filtros selecionados');
                    }
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

        function exportarExcel() {
            var filtros = {
                createdAtInicio: moment(ctrl.filtros.inicio, "DD/MM/YYYY").hours(0).minutes(0).utc().format(),
                createdAtFim: moment(ctrl.filtros.fim, "DD/MM/YYYY").hours(23).minutes(59).utc().format()
            };
            if (ctrl.filtroTexto) {
                filtros.busca = ctrl.filtroTexto;
                filtros.page = null;
            }
            ListaLeadsService.getExcel(angular.extend(filtros, ctrl.filtros), 'clientes').then(function (result) {
                saveAs(result.data, 'relatorioClientes' + moment().locale('pt-br').format("LL") + '.xlsx');
            });
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


        function getUsuarios() {

            var usuarios = [];

            var selecionados = $filter('filter')(ctrl.equipes, {selected: true});
            selecionados = selecionados.length == 0 ? ctrl.equipes : selecionados;
            selecionados.forEach(function (item) {
                usuarios = usuarios.concat(item.usuariosList);
            });
            return usuarios;
        }


        function getEtapas() {
            var nomesEtapas = [];
            var todasEtapas = [];
            var selecionados = $filter('filter')(ctrl.equipes, {selected: true});
            selecionados = selecionados.length == 0 ? ctrl.equipes : selecionados;
            selecionados.forEach(function (item) {
                item.etapas.forEach(function (etapa) {
                    if (nomesEtapas.indexOf(etapa.nome) == -1) {
                        todasEtapas.push(etapa);
                        nomesEtapas.push(etapa.nome);
                    }
                });
            });
            return todasEtapas;
        }

        function textoEquipes() {
            var selecionados = $filter('filter')(ctrl.equipes, {selected: true});
            if (selecionados.length == 0 || selecionados.length == ctrl.equipes.length) {
                return "Todas";
            } else if (selecionados.length == 1) {
                return selecionados[0].nome;
            } else if (selecionados.length > 1) {
                return "1 ou + selecionadas";
            }
        }
    }

})();