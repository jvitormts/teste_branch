(function () {
    'use strict';
    angular.module('sejaDiretoApp').service('ModalService', Service);

    function Service($state, Popeye, $rootScope, EquipeService, LeadsService) {
        var service = {};
        var baseUrl = 'view/modal/';
        service.showLeadModal = showLeadModal;
        service.modalNovoNegocio = modalNovoNegocio;
        service.modalCancelarLead = modalCancelarLead;
        service.showLeadModalMesmoController = showLeadModalMesmoController;
        service.modalAvancoEtapa = modalAvancoEtapa;
        service.modalTransferencia = modalTransferencia;
        service.modalReativar = modalReativar;
        service.modalUsuario = modalUsuario;
        service.modalDadosClientePrelead = modalDadosClientePrelead;
        service.modalProdutoVeiculo = modalProdutoVeiculo;
        service.modalProdutoGenerico = modalProdutoGenerico;
        service.modalTransferenciaRede = modalTransferenciaRede;
        service.modalTransferenciaUsuarioRemovido = modalTransferenciaUsuarioRemovido;
        service.modalPerfil = modalPerfil;
        service.showLeadModalById = showLeadModalById;
        service.modalImportArquivo = modalImportArquivo;
        service.modalSucessoAnexo = modalSucessoAnexo;
        service.modalTempoDesagrupado = modalTempoDesagrupado;
        service.modalTransferenciaLeadsEmMassa = modalTransferenciaLeadsEmMassa;
        service.modalImportArquivoXls = modalImportArquivoXls;
        service.showLeadModalByAgendamentoId = showLeadModalByAgendamentoId;
        service.currentScope = {};
        var standardResolve = {
            Profile: function (AuthService) {
                return AuthService.getProfile();
            }
        };

        return service;


        function showLeadModal(lead) {
            service.currentScope = $rootScope.$new();
            service.currentScope.leadSelecionada = lead;
            var modal = Popeye.openModal({
                scope: service.currentScope,
                controller: 'LeadModalController as ctrl',
                templateUrl: baseUrl + 'modal.lead.tmpl.html?version=030720',
                modalClass: 'modal-lead boring',
                resolve: {
                    LeadData: function () {
                        return null;
                    }
                }
            });

            if (service.reload) {
                modal.closed.then(function () {
                    service.reload();
                    delete service.reload;
                });
            }
            return modal;
        }

        function showLeadModalById(leadId) {
			
			if(isMobile()){
				service.currentScope = $rootScope.$new();
				var modal = Popeye.openModal({
					scope: service.currentScope,
					controller: 'LeadModalController as ctrl',
					templateUrl: baseUrl + 'modal.lead.tmpl.html?version=030720',
					modalClass: 'modal-lead boring',
					resolve: {
						LeadData: function (LeadsService) {
							return LeadsService.getLead(leadId);
						}
					}
				});
				if (service.reload) {
					modal.closed.then(function () {
						service.reload();
						delete service.reload;
					});
				}
				return modal;
			}else{
				//window.location = 'lead/'+leadId;
				$state.go("home.lead", {leadId:leadId});
			}
            
		}
		
		function isMobile() {
			return "ontouchstart" in window;
		}
        function showLeadModalByAgendamentoId(agendamentoId) {

            service.currentScope = $rootScope.$new();
            var modal = Popeye.openModal({
                scope: service.currentScope,
                controller: 'LeadModalController as ctrl',
                templateUrl: baseUrl + 'modal.lead.tmpl.html?version=030720',
                modalClass: 'modal-lead boring',
                resolve: {
                    LeadData: function (LeadsService) {
                        return LeadsService.getLeadByAgendamento(agendamentoId);
                    }
                }
            });

            if (service.reload) {
                modal.closed.then(function () {
                    service.reload();
                });
            }
            return modal;
        }
        function showLeadModalMesmoController() {
            var modal = Popeye.openModal({
                scope: service.currentScope,
                templateUrl: baseUrl + 'modal.lead.tmpl.html?version=030720',
                modalClass: 'modal-lead boring'
            });

            return modal;
        }

        function modalNovoNegocio(scope) {
            $rootScope.blockSpin = true;
            var modal = Popeye.openModal({
                controller: 'NovoNegocioController as ctrl',
                templateUrl: baseUrl + 'modal.novoNegocio.tmpl.html?version=030720',
                modalClass: 'modal-negocio boring',
                resolve: {
                    Equipes: function (EquipeService) {
                        return EquipeService.getEquipes();
                    }
                }
            });

            return modal;
        }


        function modalSucessoAnexo() {
            return Popeye.openModal({
                scope: service.currentScope,
                templateUrl: baseUrl + 'modal.sucesso.anexo.tmpl.html?version=030720',
                modalClass: 'modal-usuario'
            });
        }

        function modalCancelarLead() {
            return Popeye.openModal({
                scope: service.currentScope,
                templateUrl: baseUrl + 'modal.cancelar.tmpl.html?version=030720',
                modalClass: 'modal-negocio boring'
            });
        }

        function modalUsuario(usuario, callback) {
            var resolve = angular.copy(standardResolve);
            resolve.usuario = function () {
                return usuario;
            }
            resolve.equipes = EquipeService.getEquipes;

            var modal = Popeye.openModal({
                controller: 'UsuarioController as ctrl',
                templateUrl: baseUrl + 'modal.usuario.tmpl.html?version=030720',
                modalClass: 'modal-usuario boring',
                resolve: resolve
            });
            return modal;
        }

        function modalAvancoEtapa(escopo) {
            var options = {
                templateUrl: baseUrl + 'modal.avanco.tmpl.html?version=030720',
                modalClass: 'modal-negocio',
                scope: escopo ? escopo : service.currentScope
            };

            var modal = Popeye.openModal(options);

            if (service.reload) {
                modal.closed.then(function () {
                    service.reload();
                    delete service.reload;
                });
            }
            return modal;
        }

        function modalTransferencia() {
            var modal = Popeye.openModal({
                scope: service.currentScope,
                templateUrl: baseUrl + 'modal.transferencia.tmpl.html?version=030720',
                modalClass: 'modal-negociot boring'
            });


            if (service.reload) {
                modal.closed.then(function () {
                    service.reload();
                    delete service.reload;
                });
            }
            return modal;
        }

        function modalTransferenciaRede() {
            return Popeye.openModal({
                scope: service.currentScope,
                templateUrl: baseUrl + 'modal.transferencia.rede.tmpl.html?version=030720',
                modalClass: 'modal-negocio boring'
            });
        }

        function modalTransferenciaUsuarioRemovido(escopo) {
            return Popeye.openModal({
                templateUrl: baseUrl + 'modal.transferencia.usuarioRemovido.tmpl.html',
                modalClass: 'modal-negocio boring',
                scope: escopo
            });
        }

        function modalTransferenciaLeadsEmMassa(escopo) {
            return Popeye.openModal({
                templateUrl: baseUrl + 'modal.transferencia.multiplas.tmpl.html',
                modalClass: 'modal-negocio boring',
                scope: escopo
            });
        }

        function modalReativar() {
            return Popeye.openModal({
                scope: service.currentScope,
                templateUrl: baseUrl + 'modal.reativar.tmpl.html?version=030720',
                modalClass: 'modal-negocio'
            });
        }

        function modalDadosClientePrelead(escopo) {
            return Popeye.openModal({
                scope: escopo,
                templateUrl: baseUrl + 'modal.dadosCliente.prelead.tmpl.html?version=030720',
                modalClass: 'modal-negocio'
            });
        }


        function modalProdutoVeiculo(escopo) {
            return Popeye.openModal({
                scope: escopo,
                templateUrl: baseUrl + 'modal.produto.veiculo.tmpl.html?version=030720',
                modalClass: 'modal-negocio'
            });
        }

        function modalProdutoGenerico(escopo) {
            return Popeye.openModal({
                scope: escopo,
                templateUrl: baseUrl + 'modal.produto.generico.tmpl.html?version=030720',
                modalClass: 'modal-negocio'
            });
        }

        function modalPerfil(escopo) {
            return Popeye.openModal({
                scope: escopo,
                templateUrl: baseUrl + 'modal.perfil.tmpl.html?version=030720',
                modalClass: 'modal-usuario'
            });
        }

        function modalImportArquivo(escopo) {
            return Popeye.openModal({
                scope: escopo,
                templateUrl: baseUrl + 'modal.import.arquivo.tmpl.html?version=030720',
                modalClass: 'modal-usuario'
            });
        }
        function modalImportArquivoXls(escopo) {
            return Popeye.openModal({
                scope: escopo,
                templateUrl: baseUrl + 'modal.import.arquivoxls.tmpl.html?version=030720',
                modalClass: 'modal-usuario'
            });
        }


        function modalTempoDesagrupado(escopo) {
            return Popeye.openModal({
                scope: escopo,
                templateUrl: baseUrl + 'modal.tempo.desagrupado.tmpl.html?version=030720',
                modalClass: 'modal-usuario'
            });
        }
    }
})();