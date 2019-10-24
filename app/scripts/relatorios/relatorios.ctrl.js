(function () {
    'use strict';
    angular.module('sejaDiretoApp').controller('RelatoriosController', Controller);

    function Controller(ConfigService, Equipes, RelatoriosService, MensagensService, $scope, $filter, $stateParams, $timeout, $state, ModalService) {
        var ctrl = {};
        //ctrl.getMidiasListasRelatorios = ConfigService.getMidiasListasRelatorios;
        ctrl.etapas = ConfigService.etapas;
        ctrl.canais = ConfigService.canais;
        ctrl.motivos = ConfigService.motivos;
        ctrl.equipes = Equipes.data;
		ctrl.profile = ConfigService.profile;
		ctrl.loja = ConfigService.loja;

        ctrl.filtros = [{}];
        ctrl.buscarAtendimento = buscarAtendimento;
        ctrl.buscarMotivoCancelamento = buscarMotivoCancelamento;
        ctrl.buscarTempoPrimeiroAtendimento = buscarTempoPrimeiroAtendimento;
        ctrl.getTextoFiltro = getTextoFiltro;
        ctrl.buscarTaxaConversao = buscarTaxaConversao;
        ctrl.buscarTaxaConversaoExcel = buscarTaxaConversaoExcel;
        ctrl.buscarAtendimentoExcel = buscarAtendimentoExcel;
        ctrl.buscarMotivoCancelamentoExcel = buscarMotivoCancelamentoExcel;
        ctrl.validarAcessoFuncao = ConfigService.validarAcessoFuncao;
        ctrl.listaUsuarios = listaUsuarios;
        ctrl.goToMotivo = goToMotivo;
        ctrl.modalTempos = modalTempos;
        ctrl.openLead = openLead;
        ctrl.selecaoEquipe = selecaoEquipe;
        ctrl.desselecionaEquipes = desselecionaEquipes;
        init();
        return ctrl;

        function init() {
            var todosVendedores = [];
            ctrl.equipes.forEach(function (equipe) {
                todosVendedores = todosVendedores.concat(equipe.usuariosList);
            });
            var equipeTodas = {
                id: 0,
                nome: "Todas",
                usuariosList: todosVendedores
            };
            ctrl.aba = 0;
            ctrl.usuarios = [todosVendedores, todosVendedores, todosVendedores, todosVendedores];
            ctrl.filtros = [{ equipes: angular.copy(ctrl.equipes) }, { equipes: angular.copy(ctrl.equipes) }, { equipes: angular.copy(ctrl.equipes) }, { equipes: angular.copy(ctrl.equipes) }];

            ConfigService.getMidiasListasRelatorios().then(function (result) {
                ctrl.midias = result.data;
            });

            //parametros vindos do dashboard
            if ($stateParams.relatorio) {
                var filtroIndex = 0;
                switch ($stateParams.relatorio) {
                    case 'conversao':
                        ctrl.aba = 0;
                        filtroIndex = 0;
                        ctrl.filtros[0].tipoRelatorio = 'usuario';
                        break;
                    case 'tempo':
                        ctrl.aba = 1;
                        filtroIndex = 3;
                        ctrl.filtros[3].tipoRelatorio = 'usuario';
                        break;
                    case 'motivos':
                        ctrl.aba = 2;
                        filtroIndex = 1;
                        break;
                    case 'atendimento':
                        ctrl.aba = 3;
                        filtroIndex = 2;
                        break;
                }
                $timeout(function () {
                    var params = $stateParams.filtros;
                    var equipe = ctrl.equipes.find(function (equipe) {
                        return equipe.id == params.equipeId;
                    })
                    ctrl.filtros[filtroIndex].equipes = [equipe];
                    ctrl.filtros[filtroIndex].dateRange = params.dateRange;
                    if (params.canalId) {
                        ctrl.filtros[filtroIndex].canalIds = [params.canalId];
                    }
                    ctrl.filtros[filtroIndex].dateRange = params.dateRange;

                    ctrl.filtros[filtroIndex].inicio = params.vInicio;
                    ctrl.filtros[filtroIndex].fim = params.vFim;
                    switch ($stateParams.relatorio) {
                        case 'conversao':
                            buscarTaxaConversao(ctrl.filtros[filtroIndex]);
                            break;
                        case 'tempo':
                            buscarTempoPrimeiroAtendimento(ctrl.filtros[filtroIndex]);
                            break;
                        case 'motivos':
                            buscarMotivoCancelamento(ctrl.filtros[filtroIndex]);
                            break;
                        case 'atendimento':
                            buscarAtendimento(ctrl.filtros[filtroIndex]);
                            break;
                    }
                });
            } else {
                ctrl.filtros[0].tipoRelatorio = 'midia';
                ctrl.filtros[3].tipoRelatorio = 'midia';
            }
        }

        function buscarAtendimento(filtros) {
            RelatoriosService.getDadosAtendimento(filtros).then(function (result) {
                if (result.data.relatorio.length > 0) {
					ctrl.charts = [];
					result.data.equipes.forEach(function(equipe){
						ctrl.charts.push(processarDadosAtendimento(result.data.relatorio, equipe));
					})
                } else {
                    MensagensService.laranja("Dados não encontrados", "Nenhum dado encontrado para os filtros selecionados");
                }
            });
        }

        function buscarMotivoCancelamento(filtros) {
            filtros.dataInicio = moment(filtros.inicio, "DD/MM/YYYY").hours(0).minutes(0).utc().format();
            filtros.dataFim = moment(filtros.fim, "DD/MM/YYYY").hours(23).minutes(59).utc().format();
            filtros.equipeNomes = filtros.equipes.map(function (equipe) {
                return equipe.nome;
            });
            RelatoriosService.getDadosMotivosCancelamento(filtros).then(function (result) {
                if (result.data.length > 0) {
                    processarDadosMotivos(result.data);
                } else {
                    MensagensService.laranja("Dados não encontrados", "Nenhum dado encontrado para os filtros selecionados");
                }
            });
        }

        function buscarTaxaConversao(filtros) {
            filtros.dataInicio = moment(filtros.inicio, "DD/MM/YYYY").hours(0).minutes(0).utc().format();
            filtros.dataFim = moment(filtros.fim, "DD/MM/YYYY").hours(23).minutes(59).utc().format();
            if (filtros.equipes.length == 0) {
                return MensagensService.vermelha("Equipes", "Selecione as equipes");
            }
            filtros.equipeNomes = filtros.equipes.map(function (equipe) {
                return equipe.nome;
            });
            RelatoriosService.getDadosTaxaConversao(filtros).then(function (result) {
                if (result.data.total.length > 0) {
                    processarDadosTaxaConversao(result.data, filtros.tipoRelatorio);
                } else {
                    MensagensService.laranja("Dados não encontrados", "Nenhum dado encontrado para os filtros selecionados");
                }
            });
        }

        function buscarTempoPrimeiroAtendimento(filtros) {
            filtros.dataInicio = moment(filtros.inicio, "DD/MM/YYYY").hours(0).minutes(0).utc().format();
            filtros.dataFim = moment(filtros.fim, "DD/MM/YYYY").hours(23).minutes(59).utc().format();

            filtros.equipeNomes = filtros.equipes.map(function (equipe) {
                return equipe.nome;
            });
            RelatoriosService.getDadosTempoPrimeiroAtendimento(filtros).then(function (result) {
                if (result.data.length > 0) {
                    processarDadosTempoAtendimento(result.data, filtros);
                } else {
                    MensagensService.laranja("Dados não encontrados", "Nenhum dado encontrado para os filtros selecionados");
                }
            });
        }

        function buscarTaxaConversaoExcel(filtros) {
            filtros.dataInicio = moment(filtros.inicio, "DD/MM/YYYY").hours(0).minutes(0).utc().format();
            filtros.dataFim = moment(filtros.fim, "DD/MM/YYYY").hours(23).minutes(59).utc().format();
            RelatoriosService.getDadosTaxaConversaoExcel(filtros).then(function (result) {
                saveAs(result.data, 'relatorioTaxaConversao.xlsx');
            });
        }

        function buscarMotivoCancelamentoExcel(filtros) {
            filtros.dataInicio = moment(filtros.inicio, "DD/MM/YYYY").hours(0).minutes(0).utc().format();
            filtros.dataFim = moment(filtros.fim, "DD/MM/YYYY").hours(23).minutes(59).utc().format();
            RelatoriosService.getDadosMotivosCancelamentoExcel(filtros).then(function (result) {
                saveAs(result.data, 'relatorioMotivoCancelamento.xlsx');
            });
        }

        function buscarAtendimentoExcel(filtros) {
            RelatoriosService.getDadosAtendimentoExcel(filtros).then(function (result) {
                saveAs(result.data, 'relatorioAtendimento.xlsx');
            });
        }

        function processarDadosAtendimento(dados, equipe) {
            ctrl.relatorio = 'atendimento';
            var chart = {
                loja: equipe.nome,
                series: ['No Prazo', 'Atrasadas', 'Adiadas'],
                data: [],
                labels: []
            };
            chart.colors = [{
                backgroundColor: '#95CEFF',
                borderColor: '#95CEFF',
                hoverBackgroundColor: '#95CEFF',
                hoverBorderColor: '#95CEFF'
            }, {
                backgroundColor: '#FF0909',
                borderColor: '#FF0909',
                hoverBackgroundColor: '#FF0909',
                hoverBorderColor: '#FF0909'
            }, {
                backgroundColor: '#CCC',
                borderColor: '#CCC',
                hoverBackgroundColor: '#CCC',
                hoverBorderColor: '#CCC'
            }];
            chart.options = {
                legend: {
                    display: true
                },
                scales: {
                    xAxes: [{
                        stacked: true
                    }],
                    yAxes: [{
                        stacked: true,
                        ticks: {
                            max: 40
                        }
                    }]
                },
                tooltips: {
                    mode: 'x-axis'
                },
                hover: {
                    mode: 'dataset'
                }
            };
            chart.options.scales.yAxes[0].ticks.max = 0;
            chart.labels = [];

            equipe.etapas = $filter("orderBy")(equipe.etapas,"ordem");
            equipe.etapas.forEach(function(etapa) {
                chart.labels.push(etapa.nome);
            });
            equipe.usuariosList.forEach(function(usuario) {
				console.log(usuario);
				if(usuario.situacao){
					var linhasUsuario = dados.filter(function(obj) {
						return obj.idUsuario == usuario.id;
					});
					if(linhasUsuario.length>0){
						var linha = {
							data: [
								[],
								[],
								[]
							],
							total: {
								noPrazo: 0,
								atrasadas: 0,
								adiadas: 0
							},
							maxValue: 0
						};
						linha.name = usuario.nome;
						equipe.etapas.forEach(function(etapa) {
							var dado = linhasUsuario.find(function(obj){
								return etapa.id == obj.idEtapa;
							});
							if(!dado){
								dado ={
									noPrazo:0,
									atrasadas:0,
									adiadas:0
								};
							}
							linha.data[0].push(dado.noPrazo);
							linha.data[1].push(dado.atrasadas);
							linha.data[2].push(dado.adiadas);
							linha.total.noPrazo += dado.noPrazo;
							linha.total.atrasadas += dado.atrasadas;
							linha.total.adiadas += dado.adiadas;
							if (dado.noPrazo + dado.atrasadas + dado.adiadas + 10 > chart.options.scales.yAxes[0].ticks.max) {
								chart.options.scales.yAxes[0].ticks.max = dado.noPrazo + dado.atrasadas + dado.adiadas + 10;
							}
						});
						//if (linha.total.noPrazo + linha.total.atrasadas > 0) {
							chart.data.push(linha);
						//}
					}
				}
			});
            return chart;
        }

        function processarDadosMotivos(dados) {
            ctrl.relatorio = 'motivos';
            var chart = {
                data: [],
                labels: [],
                table: [],
                totalCount: 0
            };
            chart.options = {
                legend: {
                    display: true
                }
            };


            dados = $filter('orderBy')(dados, "quantidade", true);
            dados.forEach(function (dado) {
                chart.labels.push(dado.tituloMotivoCancelamento);
                chart.data.push(dado.quantidade);
                chart.table.push({
                    id: dado.motivoCancelamentoId,
                    value: dado.quantidade,
                    label: dado.tituloMotivoCancelamento
                });
                chart.totalCount += dado.quantidade;
            });
            chart.colors = calculaCoresMotivos(chart.data.length);
            ctrl.chart = chart;
        }

        function processarDadosTaxaConversao(dados, tipoRelatorio) {
            ctrl.relatorio = 'taxaConversao';
            var chart = {
                series: ['Total', 'Convertido'],
                data: [],
                labels: [],
                total: 0,
                totalConvertido: 0
            };
            var total = [];
            var convertidas = [];
            var tabela = [];
            var total = [];
            switch (tipoRelatorio) {
                case 'midia':
                    chart.chartMainColumn = "Campanha";
                    break;
                case 'canal':
                    chart.chartMainColumn = "Canal";
                    break;
                case 'usuario':
                    chart.chartMainColumn = "Vendedor";
                    break;
            }
            chart.colors = ['#95CEFF', '#434348'];
            chart.colors = [{
                backgroundColor: '#95CEFF',
                borderColor: '#95CEFF',
                hoverBackgroundColor: '#95CEFF',
                hoverBorderColor: '#95CEFF'
            }, {
                backgroundColor: '#434348',
                borderColor: '#434348',
                hoverBackgroundColor: '#434348',
                hoverBorderColor: '#434348'
            }];
            chart.options = {
                legend: {
                    display: true
                },
                scales: {
                    xAxes: [{
                        ticks: {
							callback: function(value) {
								if(value){
									try{
										var splited = value.split(' ');
										return '#'+splited[0];
									}catch(e){
										console.log(value)
									}
								}
							},
						}
                    }],
                    yAxes: []
				},
				tooltips: {
					enabled: true,
					mode: 'label',
					callbacks: {
						title: function(tooltipItems, data) {
							var idx = tooltipItems[0].index;
							return data.labels[idx];//do something with title
						},
						label: function(tooltipItems, data) {
							var idx = tooltipItems.datasetIndex;
							return data.datasets[idx].label  + ': '+tooltipItems.yLabel;
						}
					}
				}
            };
            var report = {};
            dados.total.forEach(function (total) {
                report[total.id] = report[total.id] ? report[total.id] : { id: total.id, nome: total.titulo };
                report[total.id].total = total.quantidade;
            });
            dados.vendidas.forEach(function (convertidas) {
                report[convertidas.id] = report[convertidas.id] ? report[convertidas.id] : { id: convertidas.id, nome: convertidas.titulo };
                report[convertidas.id].convertidas = convertidas.quantidade;
			});
			var count=0;
            angular.forEach(report, function (linha) {
				count++;
                chart.labels.push(count+' '+linha.nome);
                var lTotal = linha.total ? linha.total : 0;
                var lConvertidas = linha.convertidas ? linha.convertidas : 0;
                total.push(lTotal);
                convertidas.push(lConvertidas);
                chart.total += lTotal;
                chart.totalConvertido += lConvertidas;
                tabela.push({
                    id: linha.id,
					label: linha.nome,
					count: count,
                    convertida: lConvertidas,
                    total: lTotal,
                    txConversao: lTotal > 0 ? (lConvertidas / lTotal) * 100 : 100
                });
            });
            chart.sumTaxa = (chart.totalConvertido / chart.total) * 100;
            chart.data = [total, convertidas];
            chart.tabela = tabela;
            ctrl.chart = chart;
        }


        function processarDadosTempoAtendimento(dados, filtros) {

            ctrl.relatorio = 'tempoAtendimento';
            var chart = {
                series: ['Média de tempo geral'],
                data: [],
                labels: [],
                total: 0,
                totalConvertido: 0
            };
            var total = [];
            var convertidas = [];
            var tabela = [];
            switch (filtros.tipoRelatorio) {
                case 'midia':
                    chart.chartMainColumn = "Campanha";
                    break;
                case 'usuario':
                    chart.chartMainColumn = "Vendedor";
                    break;
            }
            chart.colors = ['#95CEFF', '#434348'];
            chart.colors = [{
                backgroundColor: '#95CEFF',
                borderColor: '#95CEFF',
                hoverBackgroundColor: '#95CEFF',
                hoverBorderColor: '#95CEFF'
            }, {
                backgroundColor: '#434348',
                borderColor: '#434348',
                hoverBackgroundColor: '#434348',
                hoverBorderColor: '#434348'
            }];
            chart.options = {
                legend: {
                    display: true
                },
                scales: {
                    yAxes: [{
                        ticks: {
                            min: 0
                        }
                    }],
                    xAxes: [{
                        ticks: {
                            autoSkip: false
                        }
                    }]
                }
            };
            var campo = "usuarioNome";
            if (filtros.tipoRelatorio == 'midia') {
                campo = "midia";
            }
            var somaTempo = 0, quantidade = 0;
            dados.forEach(function (dado) {
                chart.labels.push(dado[campo]);
                if (!dado.tempo)
                    dado.tempo = 0;
                total.push((dado.tempo / 60).toFixed(2));
                somaTempo += dado.somaTempo;
                quantidade += dado.quantidade;
                tabela.push({
                    id: campo == 'midia' ? dado.midiaId : dado.usuarioId,
                    label: dado[campo],
                    total: parseFloat((dado.tempo / 60).toFixed(2))
                });
            });
            chart.total = ((somaTempo / quantidade) / 60).toFixed(1);
            chart.data = [total];
            chart.tabela = tabela;
            chart.filtrosUsados = angular.copy(filtros);
            ctrl.chart = chart;
        }

        function getTextoFiltro(ids, filtro, campo, indexFiltro) {
            var selecionados = [];
            var list = ctrl[filtro];
            if (filtro == 'usuarios') {
                list = ctrl[filtro][indexFiltro];
            }
            if (!ids || ids.length == 0) {
                selecionados = list;
            } else {
                selecionados = list.filter(function (obj) {
                    return ids.indexOf(obj.id) >= 0;
                });
            }

            return selecionados.map(function (elem) {
                return elem[campo];
            }).join(", ") + '.';
        }

        function listaUsuarios(index, equipe) {
            if (equipe) {
                equipe.selected = !equipe.selected;
            }
            selecaoEquipe(index);
            var todosVendedores = [];
            ctrl.filtros[index].equipes.forEach(function (equipe) {
                todosVendedores = todosVendedores.concat(equipe.usuariosList);
            });
            ctrl.usuarios[index] = todosVendedores;
        }



        function goToMotivo(motivo) {
            var parametros = angular.copy(ctrl.filtros[1]);
            delete parametros.equipes;
            parametros.motivo = motivo;
            parametros.situacaoLead = 'PERDIDA'
            goTo("home.encerradas", { filtros: parametros });
        }


        function goTo(url, params) {
            $state.go(url, params);
        }



        function calculaCor(numCores, index, corInicial, corFinal) {//calcula o degradé de cada parte
            index++;
            var cor;
            if (index == numCores) {
                cor = rgbToHex(parseInt(corFinal.substr(1, 2), 16), parseInt(corFinal.substr(3, 2), 16), parseInt(corFinal.substr(5, 2), 16));//Cor final do degradé
            }
            else if (index == 0) {
                cor = rgbToHex(parseInt(corInicial.substr(1, 2), 16), parseInt(corInicial.substr(3, 2), 16), parseInt(corInicial.substr(5, 2), 16));//Cor inicial do degradé
            }
            else {
                var n = numCores - 1;
                var r = (parseInt((parseInt(corInicial.substr(1, 2), 16) - parseInt(corFinal.substr(1, 2), 16)).toString(16), 16) / n) * (numCores - index) + parseInt(corFinal.substr(1, 2), 16);
                var g = (parseInt((parseInt(corInicial.substr(3, 2), 16) - parseInt(corFinal.substr(3, 2), 16)).toString(16), 16) / n) * (numCores - index) + parseInt(corFinal.substr(3, 2), 16);
                var b = (parseInt((parseInt(corInicial.substr(5, 2), 16) - parseInt(corFinal.substr(5, 2), 16)).toString(16), 16) / n) * (numCores - index) + parseInt(corFinal.substr(5, 2), 16);
                cor = rgbToHex(parseInt(r.toString(16), 16), parseInt(g.toString(16), 16), parseInt(b.toString(16), 16));
            }
            return cor;
        }



        function calculaCoresMotivos(numCores) {//gera o degradé do gráfico
            var cores = [];
            var iterator = numCores - 1;
            var corFinal = "#D63333";
            var corInicial = "#E5E5E5";
            for (; iterator > 0; iterator -= 1) {
                cores.push(calculaCor(numCores, iterator, corInicial, corFinal));
            }
            if (numCores > 0) {
                if (numCores == 1) {
                    cores.push(rgbToHex(parseInt(corFinal.substr(1, 2), 16), parseInt(corFinal.substr(3, 2), 16), parseInt(corFinal.substr(5, 2), 16)));
                } else {
                    cores.push(rgbToHex(parseInt(corInicial.substr(1, 2), 16), parseInt(corInicial.substr(3, 2), 16), parseInt(corInicial.substr(5, 2), 16)));
                }
            }
            return cores;
        }

        function rgbToHex(r, g, b) {
            return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
        }


        function modalTempos(filtros, row) {
            ctrl.modal = {};
            if (filtros.tipoRelatorio == "midia") {
                filtros.midiaIds = [row.id];
                ctrl.modal.titulo = "Campanha: " + row.label;
            } else {
                filtros.usuarioIds = [row.id];
                ctrl.modal.titulo = "Usuário: " + row.label;
            }
            ctrl.modal.tempoMedio = row.total;
            filtros.desagrupar = true;

            RelatoriosService.getDadosTempoPrimeiroAtendimento(filtros).then(function (result) {

                if (result.data.length > 0) {
                    var tabela = [];
                    result.data.forEach(function (dado) {
                        tabela.push({
                            id: dado.visualId,
                            titulo: dado.titulo,
                            tempo: parseFloat((dado.tempo / 60).toFixed(2))
                        });
                    });
                    ctrl.modal.tabela = tabela;
                    ModalService.modalTempoDesagrupado($scope);

                    //processarDadosTempoAtendimento(result.data, filtros);
                } else {
                    // MensagensService.laranja("Dados não encontrados", "Nenhum dado encontrado para os filtros selecionados");
                }
            });
        }

        function selecaoEquipe(index) {
            var selecionadas = $filter('filter')(ctrl.equipes, { selected: true });
            ctrl.filtros[index].equipes = selecionadas;
            if (selecionadas.length == 0 || selecionadas.length == ctrl.equipes.length) {
                ctrl.filtros[index].equipes = ctrl.equipes;
                ctrl.equipeSelecionada[index] = "Todas";
            } else if (selecionadas.length == 1) {
                ctrl.equipeSelecionada[index] = selecionadas[0].nome;
            } else if (selecionadas.length > 1) {
                ctrl.equipeSelecionada[index] = "1 ou + selecionadas";
            }
        }

        function desselecionaEquipes(index) {
            ctrl.equipes.forEach(function (equipe) {
                equipe.selected = false;
            });
            listaUsuarios(index);
		}
		function openLead(leadId){
			window.open('/lead/'+leadId, "LEAD "+leadId)
		}
    }
})();