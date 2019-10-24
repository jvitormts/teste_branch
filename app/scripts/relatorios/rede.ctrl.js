(function() {
    'use strict';
    angular.module('sejaDiretoApp').controller('RedeController', Controller);

    function Controller(ConfigService, RedeService, Equipes, MensagensService, $filter) {
        var ctrl = {};
        ctrl.init = init;
        ctrl.midias = ConfigService.midias;
        ctrl.etapas = ConfigService.etapas;
        ctrl.motivos = ConfigService.motivos;
        ctrl.lojas = ConfigService.rede;

        ctrl.filtros = [{}];
        ctrl.buscarAtendimento = buscarAtendimento;
        ctrl.buscarTempoAtendimento = buscarTempoAtendimento;
        ctrl.buscarMotivoCancelamento = buscarMotivoCancelamento;
        ctrl.getTextoFiltro = getTextoFiltro;
        ctrl.buscarTaxaConversao = buscarTaxaConversao;
        ctrl.buscarTaxaConversaoExcel = buscarTaxaConversaoExcel;
        ctrl.buscarAtendimentoExcel = buscarAtendimentoExcel;
        ctrl.buscarMotivoCancelamentoExcel = buscarMotivoCancelamentoExcel;
        init();
        return ctrl;

        function init() {
            ctrl.equipes = [];
            Equipes.data.forEach(function(equipe){
                if(!ctrl.equipes.includes(equipe.nome)){
                    ctrl.equipes.push(equipe.nome);
                }
            });
            ctrl.canais = [];
            ConfigService.canais.forEach(function(canal){
                if(!ctrl.canais.includes(canal.name)){
                    ctrl.canais.push(canal.name);
                }
            });
        }

        function buscarAtendimento(filtros) {
            if(!filtros){
                filtros={};
            }
            if(!filtros.lojas || filtros.lojas.length==0){
                filtros.lojas = angular.copy(ctrl.unidades);
            }
            RedeService.getDadosAtendimento({
                lojas: filtros.lojas,
                equipeNomes: filtros.equipeNomes,
                filtros: {}
            }).then(function(result) {
                if (result.data.length > 0) {
                    ctrl.charts = [];
                    result.data.forEach(function(item) {
						item.equipes.forEach(function(equipe){
							ctrl.charts.push(processarDadosAtendimento(item.relatorio, equipe, item.loja.nome+ " (Equipe "+equipe.nome+")"));
						});
                    });
                } else {
                    MensagensService.laranja("Dados não encontrados", "Nenhum dado encontrado para os filtros selecionados");
                }
            });
        }

        function buscarMotivoCancelamento(filtros) {
            if(!filtros.lojas || filtros.lojas.length==0){
                filtros.lojas = angular.copy(ctrl.unidades);
            }
            filtros.dataInicio = moment(filtros.inicio, "DD/MM/YYYY").hours(0).minutes(0).utc().format();
            filtros.dataFim = moment(filtros.fim, "DD/MM/YYYY").hours(23).minutes(59).utc().format();
            var data = {
                filtros: filtros,
                lojas: filtros.lojas
            };
            RedeService.getDadosMotivosCancelamento(data).then(function(result) {

                if (result.data.length > 0) {
                    ctrl.charts = [];
                    result.data.forEach(function(item) {
                        ctrl.charts.push(processarDadosMotivos(item.relatorios, item.loja.nome));
                    });
                } else {
                    MensagensService.laranja("Dados não encontrados", "Nenhum dado encontrado para os filtros selecionados");
                }
            });
        }

        function buscarTaxaConversao(filtros) {
            if(!filtros.lojas || filtros.lojas.length==0){
                filtros.lojas = angular.copy(ctrl.unidades);
            }
            filtros.dataInicio = moment(filtros.inicio, "DD/MM/YYYY").hours(0).minutes(0).utc().format();
            filtros.dataFim = moment(filtros.fim, "DD/MM/YYYY").hours(23).minutes(59).utc().format();
            var data = {
                filtros: filtros,
                lojas: filtros.lojas
            };
            RedeService.getDadosTaxaConversao(data).then(function(result) {
                if (result.data.length > 0) {
                    ctrl.charts = [];
                    result.data.forEach(function(item) {
                        ctrl.charts.push(processarDadosTaxaConversao(item.relatorios, filtros.tipoRelatorio, item.loja.nome));
                    });
                } else {
                    MensagensService.laranja("Dados não encontrados", "Nenhum dado encontrado para os filtros selecionados");
                }
            });
        }



        function buscarTempoAtendimento(filtros) {
            if(!filtros.lojas || filtros.lojas.length==0){
                filtros.lojas = angular.copy(ctrl.unidades);
            }
            filtros.dataInicio = moment(filtros.inicio, "DD/MM/YYYY").hours(0).minutes(0).utc().format();
            filtros.dataFim = moment(filtros.fim, "DD/MM/YYYY").hours(23).minutes(59).utc().format();
            var data = {
                filtros: filtros,
                lojas: filtros.lojas
            };
            RedeService.getDadosTempoPrimeiroAtendimento(data).then(function(result) {
                if (result.data.length > 0) {
                    ctrl.charts = [];
                    result.data.forEach(function(item) {
                        if(item.relatorios.length>0){
                            ctrl.charts.push(processarDadosTempoAtendimento(item.relatorios, filtros.tipoRelatorio, item.loja.nome));
                        }else{
                             MensagensService.laranja("Dados não encontrados", "Nenhum dado encontrado para os filtros selecionados na loja "+item.loja.nomeExibicao);
                        }
                    });
                } 
            });
        }

        function buscarTaxaConversaoExcel(filtros) {
            filtros.dataInicio = moment(filtros.inicio, "DD/MM/YYYY").hours(0).minutes(0).utc().format();
            filtros.dataFim = moment(filtros.fim, "DD/MM/YYYY").hours(23).minutes(59).utc().format();
            RedeService.getDadosTaxaConversaoExcel(filtros).then(function(result) {
                saveAs(result.data, 'relatorioTaxaConversao.xlsx');
            });
        }

        function buscarMotivoCancelamentoExcel(filtros) {
            filtros.dataInicio = moment(filtros.inicio, "DD/MM/YYYY").hours(0).minutes(0).utc().format();
            filtros.dataFim = moment(filtros.fim, "DD/MM/YYYY").hours(23).minutes(59).utc().format();
            RedeService.getDadosMotivosCancelamentoExcel(filtros).then(function(result) {
                saveAs(result.data, 'relatorioMotivoCancelamento.xlsx');
            });
        }

        function buscarAtendimentoExcel(filtros) {
            RedeService.getDadosAtendimentoExcel(filtros).then(function(result) {
                saveAs(result.data, 'relatorioAtendimento.xlsx');
            });
        }

        function processarDadosAtendimento(dados, equipe, nomeLoja) {
            ctrl.relatorio = 'atendimento';
            var chart = {
                loja: nomeLoja,
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
                var linhasUsuario = dados.filter(function(obj) {
                    return obj.idUsuario == usuario.id;
                });
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
            });
            console.log(chart);
            return chart;
        }

        function processarDadosMotivos(dados, nomeLoja) {
            ctrl.relatorio = 'motivos';
            var chart = {
                loja: nomeLoja,
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
            dados.forEach(function(dado) {
                chart.labels.push(dado.tituloMotivoCancelamento);
                chart.data.push(dado.quantidade);
                chart.table.push({
                    value: dado.quantidade,
                    label: dado.tituloMotivoCancelamento
                });
                chart.totalCount += dado.quantidade;
            })
            return chart;
        }

        function processarDadosTaxaConversao(dados, tipoRelatorio, nomeLoja) {
            ctrl.relatorio = 'taxaConversao';

            var chart = {
                loja: nomeLoja,
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
                    yAxes: [{
                        ticks: {
                            min: 0
                        }
                    }]
				},
				scales: {
					xAxes: [{
						ticks: {
							callback: function(value) {
								try{
									var splited = value.split(' ');
									return '#'+splited[0];
								}catch(e){
									return '';
								}
							},
						}
					}],
					yAxes: [{}]
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
            dados.total.forEach(function(total) {
				report[total.id] = report[total.id] ? report[total.id] : {id : total.id, nome: total.titulo};
				report[total.id].total = total.quantidade; 
			});
            dados.vendidas.forEach(function(convertidas) {
				report[convertidas.id] = report[convertidas.id] ? report[convertidas.id] : {id : convertidas.id, nome: convertidas.titulo};
				report[convertidas.id].convertidas = convertidas.quantidade; 
			});
			var count=0;
            angular.forEach(report ,function(linha) {
				count++;
				chart.labels.push(count+" "+linha.nome);
				var lTotal = linha.total ? linha.total : 0;
				var lConvertidas = linha.convertidas ? linha.convertidas : 0;
				total.push(lTotal);
                convertidas.push(lConvertidas);
                chart.total += lTotal;
                chart.totalConvertido += lConvertidas;
                tabela.push({
					id: linha.id,
					count: count,
                    label: linha.nome,
                    convertida: lConvertidas,
                    total: lTotal,
                    txConversao:lTotal > 0 ?  (lConvertidas / lTotal) * 100 : 100
                });
            });
            chart.sumTaxa = (chart.totalConvertido / chart.total) * 100;
            chart.data = [total, convertidas];
            chart.tabela = tabela;
            return chart;
        }

        function processarDadosTempoAtendimento(dados, tipoRelatorio, nomeLoja) {
            ctrl.relatorio = 'tempoAtendimento';
            var chart = {
                loja: nomeLoja,
                series: ['Média de tempo geral'],
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
			
            var campo = "usuarioNome";
            if (tipoRelatorio == 'midia') {
                campo = "midia";
            }
            chart.options = {
                legend: {
                    display: true
                },
                scales: {
                    yAxes: [{
                        ticks: {
                            min: 0
                        }
                    }]
                }
            };
            var somaTempo = 0, quantidade = 0;
            dados.forEach(function(dado) {
                chart.labels.push(dado[campo]);
                if(!dado.tempo)
                    dado.tempo=0;
                
                total.push((dado.tempo / 60).toFixed(2));
                chart.total += dado.tempo;
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
            return chart;
        }

        function getTextoFiltro(ids, filtro, campo) {
            var selecionados = [];
            if (!ids || ids.length == 0) {
                selecionados = ctrl[filtro];
            } else {
                selecionados = ctrl[filtro].filter(function(obj) {
                    return ids.indexOf(obj.id) >= 0;
                });
            }
            return selecionados.map(function(elem) {
                return elem[campo];
            }).join(", ") + '.';
        }
    }
})();