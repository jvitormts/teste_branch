(function () {
	'use strict';
	angular.module('sejaDiretoApp').directive('timeline', function () {
		return {
			'restrict': 'AE',
			'templateUrl': 'view/directives/timeline.tmpl.html',
			'scope': {
				lead: '='
			},
			'controller': function ($scope, AnexosService, LeadsService, ConfigService, $timeout, $sce) {
				var ctrl = this;
				ctrl.getAnexo = AnexosService.getAnexo;
				ctrl.verMais = verMais;
				ctrl.validarFullAccess =  ConfigService.validarFullAccess;
				ctrl.profile = ConfigService.profile;
				ctrl.icones = {
					'ICE': 'fa-envelope',
					'ICT': 'fa-phone',
					'ICW': 'fa-whatsapp',
					'IV': 'fa-map-marker',
					'IO': 'fa-ellipsis-h',
					'IA': 'fa-calendar',
					'IAG': 'fa-hourglass-half',
					'IR': 'fa-retweet',
					'IT': 'fa-exchange',
					'ITE': 'fa-share-square-o fa-rotate-180',
					'IAEC': 'fa-comment',
					'IS': 'fa-trophy',
					'IAE': 'fa-arrow-right',
					'IC': 'fa-times-circle'
				};

				$scope.$watch("lead", function () {
					verificarStatusInteracoes($scope.lead.interacaoList);

					$timeout(function () {
						$(".ps-container").perfectScrollbar('update');
					},400);
				}, true);

				function verificarStatusInteracoes(interacoes) {
					var agora = moment.utc();
					interacoes.forEach(function (interacao) {
						interacao.texto = "";
						switch (interacao.type) {
							case "interacaoAvancoEtapa":
								interacao.dtype = "IAE";
								if (!interacao.de || !interacao.para) {
									interacao.assunto = "Mudança de Etapa";
								} else {
									interacao.assunto = "Mudança de Etapa de " + interacao.de.nome + " para " + interacao.para.nome;
									delete interacao.descricao;
								}
								break;
							case "interacaoContatoEmail":
								interacao.dtype = "ICE";
								processEmail(interacao);
								break;
							case "interacaoAgendamento":
								interacao.dtype = "IA";
								switch (interacao.tipo) {
									case "CONTATO":
										interacao.assunto = "Contato agendado";
										break;
									case "VISITA":
										interacao.assunto = "Visita agendada";
										break;
									case "POSTPONE":
										interacao.assunto = "Atendimento Adiado";
										break;
								}
								break;
							case "interacaoAlertaGestor":
								interacao.dtype = "IAG";
								console.log(interacao);
								break;
							case "interacaoCancelamento":
								interacao.dtype = "IC";
								interacao.assunto = interacao.motivoCancelamentoId.name;
								break;
							case "interacaoOutros":
								interacao.dtype = "IO";
								break;
							case "interacaoReativacao":
								interacao.dtype = "IR";
								interacao.assunto = interacao.usuarioId != null && interacao.usuarioId.nome != null ? interacao.usuarioId.nome : 'Seja Direto';
								interacao.descricao = interacao.descricao ? interacao.descricao : "Reabertura de lead";
								break;
							case "interacaoAgenteExterno":
								interacao.assunto = interacao.usuarioId != null && interacao.usuarioId.nome != null ? interacao.usuarioId.nome : 'Seja Direto';
								interacao.dtype = "IAEC";
								break;
							case "interacaoTransferencia":
								interacao.dtype = "IT";
								interacao.assunto = "Lead Transferida de " + interacao.de.nome + " para " + interacao.para.nome;
								break;
							case "interacaoSucesso":
								interacao.dtype = "IS";
								break;
							case "interacaoContatoVisita":
								interacao.dtype = "IV";
								break;
							case "interacaoTransferenciaExterna":
								interacao.dtype = "ITE";
								break;
							case "interacaoContatoTelefone":
								interacao.dtype = "ICT";
								if(interacao.idLigacao){
									interacao.linkLigacao="quicksip://quicksipbh/api/v1/sejadireto/recording?call_uuid="+interacao.idLigacao;
								}
								break;
							case "interacaoContatoWhatsapp":
								interacao.dtype = "ICW";
								break;
						}

						if (!interacao.texto && interacao.dtype != 'ICE' && interacao.descricao) {
							interacao.texto = interacao.descricao;
						}
						if (!interacao.texto && interacao.bodyPlain) {
							interacao.texto = interacao.bodyPlain;
						}
						if (interacao.texto) {
							interacao.texto = interacao.texto.substring(0, 250);
						}
						interacao.mostrarVerMais = false;
						if (interacao.texto.length == 250) {
							interacao.texto += "...";
							interacao.mostrarVerMais = true;
						}
						$scope.trustAsHtml = function (string) {
							return $sce.trustAsHtml(string);
						};
						
						if(interacao.dtype!='ICE' && interacao.descricao && interacao.descricao.indexOf('<img') > -1){
							interacao.texto="Essa interação contem imagens: ";
							interacao.mostrarVerMais=true;
						}

						interacao.mostrarVerMais = interacao.dtype == 'ICE' ? true : interacao.mostrarVerMais;

						if (interacao.dtype == "IA" && !interacao.done) {
							var vencimento = moment.utc(interacao.dataVencimento);
							if (vencimento.isBefore(agora)) {
								statusInteracao(interacao, 1, vencimento);
							} else {
								statusInteracao(interacao, 2, vencimento);
							}
						} else if (interacao.dtype != "IA") {
							var data = moment.utc(interacao.createdAt);
							var agendamento = interacoes.filter(function (obj) {
								return obj.dtype == 'IA' && obj.interacaoId && obj.interacaoId.id == interacao.id;
							});
							if (agendamento.length > 0) {
								var vencimento = moment.utc(agendamento[0].dataVencimento);
								if ((agendamento[0].tipo == 'VISITA' && data.isSameOrBefore(vencimento, 'day')) || data.isBefore(vencimento)) {
									statusInteracao(interacao, 3, vencimento);
								} else {
									statusInteracao(interacao, 4, vencimento);
								}
							}
						}
					});
				}


				function statusInteracao(interacao, status, vencimento) {
					switch (status) {
						case 1:
							interacao.icone = "fa fa-clock-o undone-late";
							interacao.tooltip = "Atividade atrasada.";
							interacao.cor = 'vermelha';
							break;
						case 2:
							interacao.icone = "fa fa-clock-o undone-on-time";
							interacao.tooltip = "Atividade ainda no prazo.";
							interacao.cor = 'azul';
							break;
						case 3:
							interacao.icone = "fa fa-check-circle-o done-on-time";
							interacao.tooltip = "Atividade concluida dentro do prazo.";
							interacao.cor = 'verde';
							break;
						case 4:
							interacao.icone = "fa fa-check-circle-o done-late";
							interacao.cor = 'amarela';
							interacao.tooltip = "Atividade concluida fora do prazo. (Vencimento: " + vencimento.local().format('DD/MM/YYYY HH:mm:ss') + ")";
							break;
					}
				}



				function processEmail(interacao) {
					if (!interacao.bodyPlain || interacao.bodyPlain.trim() == 'n/a' || interacao.bodyPlain.trim() == '') {
						LeadsService.getEmail(interacao.id).then(function (result) {
							interacao.descricao = result.data;

							if (interacao.descricao) {
								interacao.descricao = interacao.descricao.replace(/\\r\\n/g, '');
								interacao.descricao = interacao.descricao.replace(/\\t/g, '');
								interacao.descricao = interacao.descricao.replace(/\\n/g, '');
							}
							//interacao.bodyPlain = interacao.descricao.replace(/<(?:.|\n)*?>/gm, '');
							var element = $("<div>").html(result.data);
							element.find('style').remove();
							interacao.bodyPlain = element.text();
						});
					} else {
						interacao.bodyPlain = interacao.bodyPlain.replace(/\\r\\n/g, '');
						interacao.bodyPlain = interacao.bodyPlain.replace(/\\t/g, '');
						interacao.bodyPlain = interacao.bodyPlain.replace(/\\n/g, '');
						interacao.bodyPlain = interacao.bodyPlain.replace(/<(?:.|\n)*?>/gm, '');

					}
				}


				function verMais(interacao) {
					interacao.open = interacao.open ? false : true;
					ctrl.showEmail = false;
					if (interacao.dtype == 'ICE') {
						ctrl.showEmail = interacao.open;
						ctrl.emailSelecionado = interacao;
						if (!interacao.descricao) {
							LeadsService.getEmail(interacao.id).then(function (result) {
								interacao.descricao = result.data;
								if (interacao.descricao) {
									interacao.descricao = interacao.descricao.replace(/\\r\\n/g, '');
									interacao.descricao = interacao.descricao.replace(/\\t/g, '');
									interacao.descricao = interacao.descricao.replace(/\\n/g, '');
								} else {
									interacao.descricao = nl2br(interacao.bodyPlain);
								}
							});
						}
					}

					$timeout(function () {
						$(".ps-container").perfectScrollbar('update');
					},400);
					
				}

				function nl2br(text) {
					return (!/<[a-z][\s\S]*>/i.test(text)) ? (text + '').replace(/(\r\n|\n\r|\r|\n)/g, '<br/>' + '$1') : text;
				}

				ctrl.responder = function () {
					verMais(ctrl.emailSelecionado);
					$timeout(function () {
						$("a#linkICE").click();
					})
				}

				ctrl.downloadLigacao = function(ict){
					LeadsService.downloadFile(ict.linkLigacao).then(function(result){
						saveAs(result.data, 'audio-' + ict.idLigacao + '.mp3');
					});
				}

				ctrl.deleteInteracao = function(interacao){
					if(confirm("Confirma exclusão?")){
						LeadsService.deleteInteracao($scope.lead.visualId, interacao.id).then(function(result){
							$scope.lead = result.data;
						});
					}
				}

			},
			controllerAs: 'timeline'
		}
	});
})();
