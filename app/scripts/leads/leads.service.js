(function() {
    'use strict';
    angular.module('sejaDiretoApp').factory('LeadsService', Service);

    function Service($http, $cookies, $timeout,$q, ConfigService, $location) {
        var service = {};

        service.getLeads = getLeads;
        service.getLead = getLead;
        service.newLead = newLead;
        service.editProduto = editProduto;
        service.editTags = editTags;
        service.editCanal = editCanal;
        service.editMidia = editMidia;
        service.editCliente = editCliente;
        service.addInteracao = addInteracao;
        service.avancoEtapa = avancoEtapa;
        service.cancelarLead = cancelarLead;
        service.encerramentoSucesso = encerramentoSucesso;
        service.avancarEtapaPara = avancarEtapaPara;
        service.marcarVisto = marcarVisto;
        service.reativarLead = reativarLead;
        service.transferirLead = transferirLead;
        service.transferirMultiplasLeads = transferirMultiplasLeads;
        service.excluirLead = excluirLead;
        service.novoComentario = novoComentario;
        service.checkCliente = checkCliente;
        service.fillLeads = fillLeads;
        service.refreshLeads = refreshLeads;
        service.getEmail = getEmail;
        service.fecharAgendamento = fecharAgendamento;
		service.cloneLead = cloneLead;
		service.editValor = editValor;
        service.userLeads = [];
		service.loadCount=0;
        service.checkBlackList = checkBlackList;
        service.novoAlertaGestor = novoAlertaGestor;
		service.visitaNaoRealizada = visitaNaoRealizada;
		service.getLeadByAgendamento = getLeadByAgendamento;
		service.encaminharLead = encaminharLead;
		service.editCamposPersonalizados =editCamposPersonalizados;
		service.inserirNota=inserirNota;
		service.downloadFile = downloadFile;
		service.deleteInteracao = deleteInteracao;
		return service;
		
        function getEmail(id){
            var req = {
                method: 'GET',
                url: 'lead/email/'+id,
                headers: {
                    'Content-Type': 'application/json'
                }
            }
            return $http(req);
        }

        function getLeads() {
            var req = {
                method: 'GET',
                url: 'negocios',
                headers: {
                    'Content-Type': 'application/json'
                },
            }
            return $http(req);
        }

        function getLead(leadId) {
            var req = {
                method: 'GET',
                url: 'lead/' + leadId,
                headers: {
                    'Content-Type': 'application/json'
                },
            }
            return $http(req);
        }

        function encaminharLead(leadId, data) {
            var req = {
                method: 'POST',
				url: 'lead/encaminhar/' + leadId,
				data:data,
                headers: {
                    'Content-Type': 'application/json'
                },
            }
            return $http(req);
        }
        function getLeadByAgendamento(agendamentoId) {
            var req = {
                method: 'GET',
                url: 'lead/by_agendamento/' + agendamentoId,
                headers: {
                    'Content-Type': 'application/json'
                },
            }
            return $http(req);
        }
        function newLead(postData) {
            var req = {
                method: 'post',
                url: 'lead',
                headers: {
                    'Content-Type': 'application/json'
                },
                data: postData
            }
            return $http(req);
        }

        function novoAlertaGestor(leadId, interacao) {
            var req = {
                method: 'post',
                url: 'lead/' + leadId + '/add/iag',
                headers: {
                    'Content-Type': 'application/json'
                },
                data: interacao
            }
            return $http(req);
        }

        function editProduto(leadId, produto) {
            var req = {
                method: 'put',
                url: 'lead/' + leadId + '/produto',
                headers: {
                    'Content-Type': 'application/json'
                },
                data: produto
            }
            return $http(req);
        }
        
        function editTags(leadId, tags) {
            var req = {
                method: 'put',
                url: 'lead/' + leadId + '/tags',
                headers: {
                    'Content-Type': 'application/json'
                },
                data: tags
            }
            return $http(req);
        }
        function fecharAgendamento(leadId,agendamentoId, interacao ) {
            var req = {
                method: 'put',
                url: 'lead/fecharAgendamento/'+leadId+'/'+agendamentoId,
                headers: {
                    'Content-Type': 'application/json'
                },
                data: interacao
            }
            return $http(req);
        }

        function editCliente(leadId, cliente) {
            var req = {
                method: 'put',
                url: 'lead/' + leadId + '/cliente',
                headers: {
                    'Content-Type': 'application/json'
                },
                data: cliente
            }
            return $http(req);
        }

        function editValor(leadId, valor) {
            var req = {
                method: 'put',
                url: 'lead/' + leadId + '/valor',
                headers: {
                    'Content-Type': 'application/json'
                },
                data: {value:valor}
            }
            return $http(req);
        }

        function editCanal(leadId, canal) {
            var req = {
                method: 'put',
                url: 'lead/' + leadId + '/canal',
                headers: {
                    'Content-Type': 'application/json'
                },
                data: canal
            }
            return $http(req);
        }

        function editMidia(leadId, midia) {
            var req = {
                method: 'put',
                url: 'lead/' + leadId + '/midia',
                headers: {
                    'Content-Type': 'application/json'
                },
                data: midia
            }
            return $http(req);
        }

        function novoComentario(leadId, interacao, reativar) {
            var req = {
                method: 'PUT',
                url: 'lead/' + leadId + '/' + reativar + '/comment',
                headers: {
                    'Content-Type': 'application/json'
                },
                data: interacao
            }
            return $http(req);
        }


        function addInteracao(leadId, interacao, tipoInteracao) {
            interacao.bodyPlain = interacao.descricao;
            var req = {
                method: 'post',
                url: 'lead/' + leadId + '/addInteracao/' + tipoInteracao,
                headers: {
                    'Content-Type': "application/json; charset=utf-8"
                },
                data: interacao
            }
            return $http(req);
        }

        function cancelarLead(leadId, interacao) {
            var url = 'lead/' + leadId + '/lose'
            if (interacao.indisponiveis && interacao.indisponiveis.length > 0) {
                url = 'lead/' + leadId + '/lose/indisponivel'
            }

            var req = {
                method: 'post',
                url: url,
                headers: {
                    'Content-Type': 'application/json'
                },
                data: interacao
            }
            return $http(req);
        }

        function visitaNaoRealizada(leadId) {

            var req = {
                method: 'post',
                url: 'lead/' + leadId + '/visitaNaoRealizada',
                headers: {
                    'Content-Type': 'application/json'
                }
            }
            return $http(req);
        }

        function avancoEtapa(leadId) {
            var req = {
                method: 'post',
                url: 'lead/' + leadId + '/avanco_auto',
                headers: {
                    'Content-Type': 'application/json'
                }
            }
            return $http(req);
        }

        function avancarEtapaPara(leadId, interacaoAvanco) {
            var req = {
                method: 'post',
                url: 'lead/' + leadId + '/proxima',
                headers: {
                    'Content-Type': 'application/json'
                },
                data: interacaoAvanco
            }
            return $http(req);
        }

        function transferirLead(leadId, interacaoTransferencia) {
            var req = {
                method: 'PUT',
                url: 'lead/' + leadId + '/transfer',
                headers: {
                    'Content-Type': 'application/json'
                },
                data: interacaoTransferencia
            }
            return $http(req);
        }

        function transferirMultiplasLeads(transferenciaMultiplas) {
            var req = {
                method: 'PUT',
                url: 'lead/transferMultiple',
                headers: {
                    'Content-Type': 'application/json'
                },
                data: transferenciaMultiplas
            }
            return $http(req);
        }


        function reativarLead(leadId, interacaoReativacao) {
            var req = {
                method: 'PUT',
                url: 'lead/' + leadId + '/reativar',
                headers: {
                    'Content-Type': 'application/json'
                },
                data: interacaoReativacao
            }
            return $http(req);
        }

        function encerramentoSucesso(leadId, interacao) {
            var req = {
                method: 'post',
                url: 'lead/' + leadId + '/win',
                headers: {
                    'Content-Type': 'application/json'
                },
                data: interacao
            }
            return $http(req);
        }

        function marcarVisto(leadId) {
            var req = {
                method: 'PUT',
                url: 'lead/' + leadId + '/visto',
                headers: {
                    'Content-Type': 'application/json'
                }
            }
            return $http(req);
        }

        function checkCliente(cliente) {
            var req = {
                method: 'POST',
                url: 'lead/check-cliente',
                headers: {
                    'Content-Type': 'application/json'
                },
                data: cliente
            }
            return $http(req);
        }

        function excluirLead(leadId) {
            var req = {
                method: 'DELETE',
                url: 'lead/' + leadId,
                headers: {
                    'Content-Type': 'application/json'
                }
            }
            return $http(req);
        }

        function cloneLead(lead) {$
            var req = {
                method: 'PUT',
                url: 'lead/clone',
                headers: {
                    'Content-Type': 'application/json'
                },
                data:lead
            }
            return $http(req);
        }
        

        function fillLeads() {
            var deferred = $q.defer();
            if((ConfigService.profile && !ConfigService.validarAcessoTela("home.leads",ConfigService.profile))|| !$cookies.get("session") ){
                deferred.resolve([]);
                service.userLeads = [];
                return deferred.promise;
            }
            var req = {
                method: 'GET',
                url: 'negocios',
                headers: {
                    'Content-Type': 'application/json'
                },
			}
			$http(req).then(function(result) {
				service.userLeads=result.data;
				
				deferred.resolve(service.userLeads);
				
			},function(){
				deferred.resolve([]);
			});
            $timeout(function() {
              // fillLeads();
            }, 15000);
            return deferred.promise;
		}
		
        function refreshLeads() {
            
            var req = {
                method: 'GET',
                url: 'negocios',
                headers: {
                    'Content-Type': 'application/json'
                },
			}
			$http(req).then(function(result) {
				service.userLeads=result.data;
				
			});
        }

        function checkBlackList(email){

			var protocol = $location.protocol();
            var porta = protocol == 'http' ? "8282" : '8181';
            var req = {
				ignoreWS:true,
                method: 'POST',
                url: protocol+'://api.sejadireto.com.br:'+porta+'/rota',
                headers: {
                    'Content-Type': 'application/json'
                },
                data: {
                    remetente: email
                }
            }
            return $http(req);
        }
		
        function editCamposPersonalizados(leadId, campos) {
            
            var req = {
                method: 'put',
                url: 'lead/campos/'+leadId,
                headers: {
                    'Content-Type': 'application/json'
				},
				data: campos
			}
			return $http(req);
		}
		
        function inserirNota(leadId, nota) {
            
            var req = {
                method: 'POST',
                url: 'lead/nota/'+leadId,
                headers: {
                    'Content-Type': 'application/json'
				},
				data: nota
			}
			return $http(req);
		}
		
		function downloadFile(url){
			var req = {
                method: 'GET',
                url: url,
                headers: {
                    'Content-Type': 'application/json'
                },
                responseType:"blob"
            }
            return $http(req);
		
		}

		function deleteInteracao(leadId, interacaoId){

			var req = {
                method: 'DELETE',
                url: 'lead/interacao/'+leadId+'/'+interacaoId,
                headers: {
                    'Content-Type': 'application/json'
                }
            }
            return $http(req);

		}
    }
})();