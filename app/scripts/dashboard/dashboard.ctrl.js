(function () {
	'use strict';
	angular.module('sejaDiretoApp').controller('DashboardController', Controller);

	function Controller($http, $scope, $filter, $timeout, ConfigService, Equipes, DashboardService, $state, $cookies) {
		var ctrl = this;

		ctrl.equipes = Equipes.data;
		ctrl.etapas = ConfigService.etapas;
		ctrl.canais = ConfigService.canais;
		ctrl.profile = ConfigService.profile;
		ctrl.dadoEtapa = dadoEtapa;
		ctrl.calculaCor = calculaCor;
		ctrl.goTo = goTo;
		ctrl.textoCanal = textoCanal;


		$timeout(function () {
			ctrl.filtros = $cookies.getObject("dashboad");
			if (!ctrl.filtros) {
				ctrl.filtros = { equipeId: ctrl.equipes[0].id };
				if (ctrl.profile.equipeId) {
					ctrl.filtros.equipeId = ctrl.profile.equipeId.id;
				}
			}
			$scope.$watch("ctrl.filtros", function (novo, velho) {
				atualizarDashboard();
			}, true);

			$scope.$watch("ctrl.canais", function (novo, velho) {
				var canaisSelecionados = $filter('filter')(ctrl.canais, {selected : true});
				if(canaisSelecionados.length==0){
					canaisSelecionados = ctrl.canais;
				}

				ctrl.filtros.canalIds = canaisSelecionados.map(function(obj){
					return obj.id;
				});
			}, true);


            $timeout(function() {
                $(".ps-container").perfectScrollbar('update');
            },1000);
		});

		return ctrl;


		function goTo(url, params) {
			$state.go(url, params);
		}

		function textoCanal(){
			var selecionados = $filter('filter')(ctrl.canais, {selected : true});
			if(selecionados.length == 0 || selecionados.length == ctrl.canais.length){
				return "Todos";
			}else if(selecionados.length == 1){
				return selecionados[0].name;
			}else if(selecionados.length>1){
				return "1 ou + selecionados";
			}
		}

		function atualizarDashboard() {
			
			$cookies.putObject("dashboad", ctrl.filtros);
			var filtros = {
				inicio: moment(ctrl.filtros.vInicio, "DD/MM/YYYY").hours(0).minutes(0).utc().format(),
				fim: moment(ctrl.filtros.vFim, "DD/MM/YYYY").hours(23).minutes(59).utc().format()
			};
			if(!filtros.canalIds){
				var canaisSelecionados = $filter('filter')(ctrl.canais, {selected : true});
				if(canaisSelecionados.length==0){
					canaisSelecionados = ctrl.canais;
				}
				filtros.canalIds =  canaisSelecionados.map(function(obj){
					return obj.id;
				});
			}
			DashboardService.getFunil(angular.extend(filtros, ctrl.filtros)).then(function (result) {
				ctrl.funil = result.data;
				processarGraficoConversao();
			});
			DashboardService.getGrade(angular.extend(filtros, ctrl.filtros)).then(function (result) {
				processaDadosGrade(result.data);
			});
			DashboardService.getTempo(angular.extend(filtros, ctrl.filtros)).then(function (result) {
				ctrl.tempo = result.data / 60;
			}, function () {
				ctrl.tempo = 0;
			});

			DashboardService.getMotivos(angular.extend(filtros, ctrl.filtros)).then(function (result) {
				processarDadosMotivos(result.data);
			});
		}

		function processaDadosGrade(dadosGrade) {
			ctrl.grade = dadosGrade.usuarios;


			ctrl.grade.forEach(function (usuario) {

				var atrasadas = dadosGrade.agendamentosAtrasados.find(function (obj) {
					return obj.idUsuario == usuario.id;
				});

				var vendidas = dadosGrade.vendidas.find(function (obj) {
					return obj.usuarioId == usuario.id;
				});

				var encerradas = dadosGrade.encerradas.find(function (obj) {
					return obj.usuarioId == usuario.id;
				});


				var emAtendimento = dadosGrade.emAtendimento.find(function (obj) {
					return obj.usuarioId == usuario.id;
				});

				var atendidas = dadosGrade.atendidas.find(function (obj) {
					return obj.usuarioId == usuario.id;
				});

				usuario.atrasadas = atrasadas ? atrasadas.atrasadas : 0;

				usuario.paraHoje = atrasadas ? atrasadas.paraHoje : 0;

				usuario.vendidas = vendidas ? vendidas.leads : 0;

				usuario.contatos = encerradas ? encerradas.contatosFeitos : 0;

				usuario.emAtendimento = emAtendimento ? emAtendimento.leads : 0;

				usuario.atendidas = atendidas ? atendidas.leads : 0;

				usuario.taxa = (usuario.vendidas / usuario.atendidas) * 100;
			});

			var soma = ctrl.grade.reduce(function (a, b) {
				return {
					atrasadas: a.atrasadas + b.atrasadas,
					paraHoje: a.paraHoje + b.paraHoje,
					vendidas: a.vendidas + b.vendidas,
					contatos: a.contatos + b.contatos,
					emAtendimento: a.emAtendimento + b.emAtendimento,
					atendidas: a.atendidas + b.atendidas
				};
			});

			var media = {
				atrasadas: soma.atrasadas / ctrl.grade.length,
				paraHoje: soma.paraHoje / ctrl.grade.length,
				vendidas: soma.vendidas / ctrl.grade.length,
				contatos: soma.contatos / ctrl.grade.length,
				emAtendimento: soma.emAtendimento / ctrl.grade.length,
				atendidas: soma.atendidas / ctrl.grade.length
			};

			media.taxa = (media.vendidas / media.atendidas) * 100;
			ctrl.mediaGrade = media;
		}


		function dadoEtapa(etapa, dado) {
			if (!ctrl.funil) {
				return 0;
			}
			var obj = {};
			if (dado == 'leads') {
				obj = ctrl.funil.leadsPorEtapa.find(function (item) {
					return item.idEtapa == etapa.id;
				});
				return obj ? obj.quantidade : 0;
			}
			if (dado == 'movimentacao') {
				obj = ctrl.funil.totalMovimentacoes.find(function (item) {
					return item.paraOrdem == etapa.ordem;
				});
				return obj ? obj : { quantidade: 0 };
			}
		}


		function processarDadosMotivos(dados) {
			var chart = {
				data: [],
				colors: [],
				labels: []
			};
			chart.options = {
				responsive: false,
				legend: {
					display: true,
					position: 'right',
					padding: 20
				}
			};

			dados = $filter('orderBy')(dados, "quantidade", true);
			var outros = 0;
			dados.forEach(function (dado, key) {

				if (key <= 4) {
					chart.labels.push(dado.tituloMotivoCancelamento);
					chart.data.push(dado.quantidade);
				} else {
					outros += dado.quantidade;
				}

			});
			if (outros > 0) {
				chart.labels.push("Demais motivos");
				chart.data.push(outros);
			}
			chart.colors = calculaCoresMotivos(chart.data.length);
			ctrl.motivos = chart;
		}

		function processarGraficoConversao() {
			var chart = {

				data: [ctrl.funil.totalVendida, ctrl.funil.totalEntrada - ctrl.funil.totalVendida],
				colors: [
					"#FACC00",
					"#E5E5E5"
				],
				labels: ['Leads convertidas', 'Leads não convertidas'],
				legend: {
					display: false,
					position: 'right',
					padding: 20
				}
			}
			var taxa = ((ctrl.funil.totalVendida / ctrl.funil.totalEntrada) * 100).toFixed(1);
			var stringTaxa = isNaN(taxa) || !isFinite(taxa) ? " - " : taxa.toString().replace(".", ",") + '%';
			chart.options = {
				cutoutPercentage: 60,
				responsive: true,
				tooltips: {
					yAlign: 'bottom'
				},
				elements: {
					center: {
						text: stringTaxa,
						fontStyle: 'Roboto', // Default is Arial
						color: '#A0A0A0',
						sidePadding: 20 // Defualt is 20 (as a percentage)
					}
				}
			}
			ctrl.conversao = chart;
		}

		function calculaCoresMotivos(numCores) {//gera o degradé do gráfico
			var cores = [];
			var iterator = numCores - 1;
			var corFinal = "#D63333";
			var corInicial = "#E5E5E5";
			for (; iterator > 0; iterator--) {
				cores.push(calculaCor(numCores, iterator, corInicial, corFinal));
			}
			if (numCores > 0) {
				if (numCores == 1) {
					cores.push(rgbToHex(parseInt(corFinal.substr(1, 2), 16), parseInt(corFinal.substr(3, 2), 16), parseInt(corFinal.substr(5, 2), 16)));
				} else{
					cores.push(rgbToHex(parseInt(corInicial.substr(1, 2), 16), parseInt(corInicial.substr(3, 2), 16), parseInt(corInicial.substr(5, 2), 16)));
				}
			}
			return cores;
		}

		function rgbToHex(r, g, b) {
			return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
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
	}
})();