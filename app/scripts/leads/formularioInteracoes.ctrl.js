(function () {
    'use strict';
    angular.module('sejaDiretoApp').controller('FormularioInteracaoController', Controller);

    function Controller($scope, $timeout, LeadsService, HorariosService, MensagensService, ConfigService, summernoteConfig, $mdDialog) {
		var ctrl = this;
		ctrl.lead = $scope.lead;
		ctrl.profile = ConfigService.profile;
		ctrl.etapas = ConfigService.etapas;
		ctrl.loja = ConfigService.loja;
		ctrl.selecaoAbaInteracao = selecaoAbaInteracao;
		ctrl.limparSelecaoInteracao = limparSelecaoInteracao;
		ctrl.summernoteConfig = summernoteConfig;
		ctrl.novaInteracao = novaInteracao;
		ctrl.listarHoras = listarHoras;
		ctrl.motivos = filterMotivos();
		ctrl.novoComentario = novoComentario;
		ctrl.voltar = voltar;
		ctrl.cancelar = cancelar;
		ctrl.isMobile = isMobile;
		ctrl.listarHorasAlerta = listarHorasAlerta;
		ctrl.limpaSelectHoraAlerta = limpaSelectHoraAlerta;
		//ctrl.ultimaEtapa = ultimaEtapa;

		$timeout(function(){
			$('.summernote').summernote(summernoteConfig);
		},300);

		limparSelecaoInteracao();
		function isMobile() {
			return "ontouchstart" in window;
		}

		ctrl.proximaEtapa = ctrl.etapas.find(function (obj) {
			return ctrl.lead.etapaFunilId.ordem + 1 == obj.ordem;
		});

		// Verifica quantas etapas existem na loja
		// function ultimaEtapa(){
		// var qntdEtapas = ctrl.etapas.length;
		// 	if (ctrl.lead.etapaFunilId.ordem == (qntdEtapas - 1) ) {
		// 		return true;
		// 	} else {
		// 		return false;
		// 	}
		// }
		// //ultimaEtapa();
		//  //console.log(qntdEtapas - 1);
		// console.log(ctrl.lead.etapaFunilId.ordem);



		function listarHoras(data) {
			var maxTime = ctrl.maxTime;
			if (ctrl.interacao.tipo != 'CONTATO') {
				maxTime = moment(2999, 'YYYY');
			}
			$timeout(function () {
				ctrl.listaHoras = HorariosService.listarHoras(data, maxTime);
				ctrl.interacao.dataVencimento = ctrl.interacao.dataVencimento ? ctrl.interacao.dataVencimento : ctrl.listaHoras[0].value;
			});
		}

		function limparSelecaoInteracao() {
			ctrl.requestData = {};
			ctrl.interacao = {};
			$timeout(function () {
				var openIAs = ctrl.lead.interacaoList.filter(function (obj) {
					return !obj.done && (obj.dtype == 'IA' || obj.type == 'interacaoAgendamento') && obj.dtype != 'IAG';
				});
				if (openIAs.length == 0) {
					ctrl.interacoesAceitas = ['IA'];
				} else {
					ctrl.interacoesAceitas = ['ICE', 'ICT', 'ICW', 'IO', 'IV'];
					ctrl.agendamentoAberto = openIAs[0];
				}
				if (ctrl.lead.usuarioId && ctrl.profile.id != ctrl.lead.usuarioId.id) {
					ctrl.interacoesAceitas.push('IAEC', 'IAG');
				}
				delete ctrl.interacaoPreAgendamento;
				delete ctrl.interacaoCancelamento;
				delete ctrl.interacaoAvanco;
				ctrl.habilitarBotaoInteracao = true;
				ctrl.encerrarLeadAposInteracao = false;
				ctrl.avancarEtapaAposInteracao = false;
			});
		}

		function voltar() {
			var old = angular.copy(ctrl.requestData[ctrl.requestData.tipo]);
			var agendamento = angular.copy(ctrl.interacao);
			ctrl.interacao = old;
			delete ctrl.requestData;
			ctrl.requestData = {};
			ctrl.requestData.agendamento = agendamento;
		}


		function cancelar() {
			ctrl.requestData = {};
			ctrl.interacao = {};
			limparSelecaoInteracao();
		}

		function selecaoAbaInteracao(type) {
			if (!ctrl.interacao || !ctrl.interacao.dtype) {
				ctrl.interacao = {};
			}

			if (ctrl.interacoesAceitas && ctrl.interacoesAceitas.indexOf(type) == -1) {

				return false;
			}
			if (!ctrl.lead.midiaId && ctrl.profile.id == ctrl.lead.usuarioId.id) {
				MensagensService.roxa('Preenchimento de dados obrigatório', 'Para registrar uma interação você deve preencher os dados de campanha da Lead.');
				return false;
			}
			
			if (!ctrl.lead.clienteId && ctrl.profile.id == ctrl.lead.usuarioId.id) {
				MensagensService.laranja('Preenchimento de dados obrigatório', 'Para registrar uma interação você deve preencher os dados de contato do cliente da Lead.');

				return false;
			} else if ((type == 2 || type == 3) && !ctrl.lead.clienteId.telefoneList[0].telefone && ctrl.profile.id == ctrl.lead.usuarioId.id) {
				MensagensService.laranja('Preenchimento de dados obrigatório', 'Para registrar um telefonema ou whatsapp você deve preencher ao menos um telefone do cliente.');

				return false;
			}
			if (type == 'ICE') {
				if (!ctrl.lead.clienteId.email) {
					MensagensService.laranja('Preenchimento de dados obrigatório', 'Para enviar um e-mail você deve preencher o email do cliente.');

					return false;
				}
				ctrl.interacao.de = ctrl.loja.emailLead + "@loja.sejadireto.com.br";
				ctrl.interacao.para = ctrl.lead.clienteId.email;
				var emails = ctrl.lead.interacaoList.filter(function (obj) {
					return obj.dtype == 'ICE';
				});

				if (emails.length > 1) {
					ctrl.interacao.assunto = 'Re:' + emails[emails.length - 1].assunto;
				} else {
					if (emails.length == 1 && ctrl.interacao.de == emails[0].de) {
						ctrl.interacao.assunto = 'Re:' + emails[emails.length - 1].assunto;
					} else {
						ctrl.interacao.assunto = '';
					}
				}

				if (ctrl.profile.assinatura)
					ctrl.interacao.descricao = "<br/>" + ctrl.profile.assinatura;
			}

			if (type == 'IA') {

				ctrl.interacao.tipo = ctrl.interacao.tipo ? ctrl.interacao.tipo : 'CONTATO';

				if (ctrl.requestData.agendamento) {
					ctrl.interacao = ctrl.requestData.agendamento;
				}

				if (ctrl.interacao.data) {
					listarHoras(ctrl.interacao.data);
				}

				ctrl.minTime = HorariosService.getProximoHorarioUtil();
				var etapa = ctrl.lead.etapaFunilId;
				if (ctrl.avancarEtapaAposInteracao) {
					etapa = ctrl.etapas.filter(function (obj) {
						return obj.ordem == 1;
					})[0];
				}
				ctrl.maxTime = HorariosService.getTempoMaximoAgendamento(etapa);
				ctrl.listaDatas = HorariosService.listarDatas(ctrl.minTime, ctrl.maxTime);
				ctrl.listaHoras = [{
					value: 0,
					text: 'Selecione a data'
				}];
				ctrl.interacao.hora = 0;
				// $scope.interaction.appointmentType = 'contact';
			} else if (type == 'IAG') {
				ctrl.minTime = HorariosService.getProximoHorarioUtil();
				listarHorasAlerta();
			} else if (ctrl.agendamentoAberto && ctrl.agendamentoAberto.tipo == 'VISITA' && type != 'IV') {
				var vencimento = moment.utc(ctrl.agendamentoAberto.dataVencimento);
				var agora = moment.utc();
				if (vencimento.isSameOrBefore(agora) && ctrl.lead.usuarioId.id == ctrl.profile.id) {
					var confirm = $mdDialog.confirm().title('Visita agendada').textContent('Existe uma visita agendada para a data "' + vencimento.format('L LT') + '".\n Essa visita foi realizada?').ariaLabel('Lucky day').targetEvent(event).ok('NÃO').cancel('SIM');
					$mdDialog.show(confirm).then(function (event) {
						LeadsService.visitaNaoRealizada(ctrl.lead.visualId).then(function (result) {
							ctrl.lead = result.data;
							$scope.init(result.data);
							limparSelecaoInteracao();
						});
					}, function () {
						selecaoAbaInteracao('IV');
					});

					return false;
				}
			}
			ctrl.interacao.dtype = type;
			//$scope.maxTime = new Date($scope.minTime.getTime() + (max_schedule_time * 60000)); //max_schedule_time em minutos * 60000 para transformar em milisegundos
		}

		function filterMotivos() {
			if (ctrl.lead.produtoList.length == 0 && !ctrl.loja.permitirFinalizarSemProduto) {
				return [ctrl.loja.motivoLeadInvalida];
			} else if ((ctrl.lead.produtoList.length > 0 && ctrl.lead.produtoList[0].id != -1) || !ctrl.loja.produtoIndisponivelId || ctrl.loja.permitirFinalizarSemProduto) {
				return ConfigService.motivos.filter(function (motivo) {
					return motivo.active;
				});
			} else {
				return [ctrl.loja.produtoIndisponivelId];
			}
		}

		function novoComentario(interacao) {

			ctrl.habilitarBotaoInteracao = false;
			if (ctrl.lead.situacao == 'PERDIDA' || ctrl.lead.situacao == 'GANHA') {
				var confirm = $mdDialog.confirm().title('Lead Encerrada').textContent('Deseja reativar essa lead?').ariaLabel('Lucky day').targetEvent(event).ok('SIM').cancel('NÃO');
				$mdDialog.show(confirm).then(function (event) {
					LeadsService.novoComentario(ctrl.lead.visualId, interacao, true).then(function (result) {
						ctrl.lead = result.data;
						$scope.init(result.data);
						limparSelecaoInteracao();
					});
				}, function () {
					LeadsService.novoComentario(ctrl.lead.visualId, interacao, false).then(function (result) {
						ctrl.lead = result.data;
						$scope.init(result.data);
						limparSelecaoInteracao();
					});
				});
			} else {
				LeadsService.novoComentario(ctrl.lead.visualId, interacao, false).then(function (result) {
					ctrl.lead = result.data;
					$scope.init(result.data);
					limparSelecaoInteracao();
				});
			}
		}

		function novoAlerta(interacao) {
			interacao.done = false;
			interacao.type = 'interacaoAlertaGestor';
			interacao.vendedorId = ctrl.profile;
			interacao.dataVencimento = moment(ctrl.interacao.dataAlerta.toString(), 'DD/MM/YYYY HH:mm:ss');
			interacao.dataVencimento.set({ 'hour': moment(interacao.horaAlerta).get('hour'), 'minute': moment(interacao.horaAlerta).get('minute') });
			interacao.dataVencimento = moment.utc(interacao.dataVencimento).format();
			var dateObj = moment(interacao.dataVencimento.toString());
			if (dateObj.isSameOrBefore(moment())) {
				MensagensService.vermelha("Data inválida", "A data/hora do alerta não pode estar no passado.");
				var salvaDescricao = interacao.descricao;
				limparSelecaoInteracao();
				selecaoAbaInteracao('IAG');
				ctrl.interacao.descricao = salvaDescricao;
				return;
			}
			LeadsService.novoAlertaGestor(ctrl.lead.visualId, interacao).then(function (result) {
				ctrl.lead = result.data;
				$scope.init(result.data);
				limparSelecaoInteracao();
			});
		}

		function listarHorasAlerta() {
			var beginDay = moment('00:00:00', 'HH:mm:ss');
			beginDay.locale('pt-br');
			if (ctrl.interacao.dataAlerta && moment(ctrl.interacao.dataAlerta, "DD/MM/YYYY").format("DD/MM/YYYY").toString() == moment(moment(), "DD/MM/YYYY").format("DD/MM/YYYY").toString()) {
				beginDay = moment(moment(), "HH:mm:ss");
				beginDay.locale('pt-br');
			}
			var endDay = moment('23:59:00', 'HH:mm:ss');
			endDay.locale('pt-br');
			var dateObj = beginDay;
			dateObj.add(15 - (moment(beginDay).minute() % 15), 'minutes');
			$timeout(function() {
				ctrl.listaHorasAlerta = [];
				while (dateObj.isSameOrBefore(endDay)) {
					var utcdate = moment(dateObj).utc();
					ctrl.listaHorasAlerta.push({
						value: utcdate.format(),
						text: dateObj.format('LT')
					});
					dateObj.add(15, 'minutes');
				}
			})
		}

		function limpaSelectHoraAlerta() {
			angular.element('#selectHoraAlerta').val("");
		}

		function novaInteracao(interacao) {
			if (!interacao.descricao && interacao.dtype != 'IA' && interacao.dtype != 'IAG') {
				MensagensService.laranja("Campo obrigatório", "O preenchimento do campo descrição é obrigatório");
				return;
			}

			if (interacao.dtype == 'IA' && !interacao.dataVencimento) {
				MensagensService.laranja("Horário inválido", "Selecione um horário válido");
				return;
			}

			if (interacao.uploading) {
				MensagensService.laranja("Efetuando upload de anexo", "Aguarde enquanto os anexos são carregados");
				return;
			}

			var tipo = interacao.dtype.toLowerCase();

			interacao.createdAt = moment.utc().format();

			if (interacao.dtype === 'IAEC') {
				novoComentario(interacao);
				return;
			}

			if (interacao.dtype === 'IAG') {
				novoAlerta(interacao);
				return;
			}
			//Registro de interação de leads
			//#1 - Na tela de interação(Registro de Atividades) esse será a primeira condição que o sistema era entrar
			if (!ctrl.requestData.tipo) {
				ctrl.requestData.tipo = tipo;
				if (ctrl.avancarEtapaAposInteracao) {
					ctrl.requestData.avancarEtapa = true;
					//console.log("Etapa 1");
				}
			}

			if (interacao.dtype === 'ICE') {
				interacao.bodyPlain = interacao.descricao;
			}
			if (ctrl.encerrarLeadAposInteracao && (!ctrl.interacaoCancelamento || !ctrl.interacaoCancelamento.motivoCancelamentoId)) {
				MensagensService.vermelha("Selecione o motivo de cancelamento", "Selecione o motivo de cancelamento");
				ctrl.habilitarBotaoInteracao = true;
				return;
			} //#2 - Libera para selecionar a data/horario da prox interação
			if (interacao.dtype != 'IA' && !ctrl.encerrarLeadAposInteracao && ctrl.agendamentoAberto && ((ctrl.agendamentoAberto.tipo == 'VISITA' && tipo == 'iv') || ctrl.agendamentoAberto.tipo == 'CONTATO' || ctrl.agendamentoAberto.tipo == 'POSTPONE')) {
				ctrl.requestData[tipo] = angular.copy(interacao);
				ctrl.interacoesAceitas = ['IA'];
				MensagensService.laranja("Agendamento obrigatório", "Para concluir esta ação você deve agendar a próxima atividade");
				ctrl.interacao = {};
				selecaoAbaInteracao('IA');
				//console.log("Etapa #2");
			} else {
				ctrl.habilitarBotaoInteracao = false;
				if (ctrl.requestData.tipo != 'ia' && !ctrl.requestData[ctrl.requestData.tipo]) {
					ctrl.requestData[ctrl.requestData.tipo] = interacao;
				} else if (ctrl.requestData.tipo) {
					ctrl.requestData.agendamento = interacao;
				}

				if (ctrl.encerrarLeadAposInteracao) {
					ctrl.interacaoCancelamento.descricao = ctrl.interacao.descricao;
					ctrl.interacaoCancelamento.createdAt = moment.utc().format();
					ctrl.interacaoCancelamento.dtype = 'IC';
					ctrl.interacaoCancelamento.type = 'interacaoCancelamento';
					ctrl.agendamentoAberto.done = true;
					ctrl.requestData.cancelamento = angular.copy(ctrl.interacaoCancelamento);
					ctrl.lead.situacao = 'PERDIDA';
					LeadsService.refreshLeads();
				}

				if (ctrl.interacao.dtype == 'IA') {
					interacao.done = false;
					ctrl.interacao.type = 'interacaoAgendamento';
					ctrl.requestData.agendamento = angular.copy(interacao);
					//console.log("Etapa #3 - Interacao Agendamento");
				}
				//Etapa final, finaliza o registro da interação da lead
				LeadsService.addInteracao(ctrl.lead.visualId, ctrl.requestData, ctrl.requestData.tipo).then(function (result) {
					ctrl.lead = result.data;
					$scope.init(result.data);
					limparSelecaoInteracao();
					//console.log("Etapa final - Interação finalizada");
					// setTimeout("Message();", 30000);
        			// function Message() {
           			// alert("Aguarde por gentileza, a página será recarregada");
        			// }
					//Message();
					var currentPageTemplate = $route.current.templateUrl;
					$templateCache.remove(currentPageTemplate);
					$window.location.reload();
					//$state.go($state.current, {}, {reload: true});
				});

			}
		}

	}
})();