(function() {
    'use strict';
    angular.module('sejaDiretoApp').controller('IdLeadsController', Controller);

    function Controller(ConfigService, AnexosService, PreLeadsService, Equipes, PreLeads, $mdDialog, ModalService, LeadsService, $scope, MensagensService, $document) {
        var ctrl = {};
        ctrl.init = init;
		ctrl.midias = ConfigService.midias;
		ctrl.getAnexo = AnexosService.getAnexo;
        ctrl.loja = ConfigService.loja;
        ctrl.etapas = ConfigService.etapas;
        ctrl.preLeads = PreLeads.data;
        ctrl.equipes = Equipes.data;
        ctrl.openMail = openMail;
        ctrl.confimarEnviar = confimarEnviar;
        ctrl.modalCliente = modalCliente;
        ctrl.salvarCliente = salvarCliente;
        ctrl.selecionarTodos = selecionarTodos;
        ctrl.modalImport=modalImport;
        ctrl.importArquivo = importArquivo;
        return ctrl;

        function init() {}

        function modalCliente(preLead) {
            ctrl.preLeadSelecionada = preLead;
            ModalService.modalDadosClientePrelead($scope);
        }

        function openMail(mail) {
            if(!mail.message){
                mail.message = '';
            }
            

            mail.message = (!/<[a-z][\s\S]*>/i.test(mail.message)) ? (mail.message + '').replace(/(\r\n|\n\r|\r|\n)/g, '<br/>' + '$1') : mail.message;
            

            mail.show = !mail.show;
            if (!mail.lida) {
                mail.lida = true;
                PreLeadsService.marcarLida(mail.id);
            }
        }


        function selecionarTodos(value) {
            ctrl.preLeads.forEach(function(obj) {
                obj.selected = value;
            });
        }
        function salvarCliente(dados) {
            var cliente = angular.copy(dados);
            dados = null;
            if (cliente && cliente.telefoneList && !cliente.telefoneList[0].telefone) {
                delete cliente.telefoneList;
            }
            LeadsService.checkCliente(cliente).then(function(result) {
                var objeto = result.data;
                if (objeto.resultado == 1) {
                    $mdDialog.show($mdDialog.alert().parent(angular.element(document.querySelector('#popupContainer'))).clickOutsideToClose(true).title('Lead reaberta').textContent(objeto.message).ariaLabel('Lead reaberta').ok('Continuar'));
                    PreLeadsService.enviarEmailParaLead(objeto.lead.visualId,ctrl.preLeadSelecionada).then(function(response){
                        reload();
                    });
                    $scope.$close();
                } else if (objeto.resultado == 2) {
                    MensagensService.azul("Cliente já em atendimento", objeto.message);
                    PreLeadsService.enviarEmailParaLead(objeto.lead.visualId,ctrl.preLeadSelecionada).then(function(response){
                        reload();
                    });
                    $scope.$close();
                } else {
                    ctrl.submitDesabilitado = false;
                    ctrl.preLeadSelecionada.cliente = cliente;
                    $scope.$close();
                }
            });
        }

        function enviarPreLeadsParaFila(equipe) {
            ctrl.checkAll = false;
            var data = {
                "type": "preLeadDTOComposite",
                "array": []
            };
            var selecionadas = ctrl.preLeads.filter(function(obj) {
                return obj.selected;
            });
            ctrl.preLeads = ctrl.preLeads.filter(function(obj) {
                return !obj.selected;
            });
            
            var dto = {};
            selecionadas.forEach(function(obj) {
                dto = {
                    "type": "preLeadDTO",
                    "prelead": { id : obj.id },
                    "midia": obj.midia ? obj.midia : null,
                    "cliente": obj.cliente ? obj.cliente : null
                };
                data.array.push(dto);
            });
            reload(data);
            PreLeadsService.enviarParaFila(data,equipe);
        }

        function deletarPreLeads() {
            ctrl.checkAll = false;
            var data = {
                "type": "preLeadDTOComposite",
                "array": []
            };
            var selecionadas = ctrl.preLeads.filter(function(obj) {
                return obj.selected;
            });

            ctrl.preLeads = ctrl.preLeads.filter(function(obj) {
                return !obj.selected;
            });

            var dto = {};
            selecionadas.forEach(function(obj) {
                dto = {
                    "type": "preLeadDTO",
                    "prelead": {id:obj.id}
                };
                data.array.push(dto);
            });
            reload(data);
            PreLeadsService.deletarPreLeads(data);
        }

        function reload(dados) {
            PreLeadsService.getPreLeads(dados).then(function(result) {
                ctrl.preLeads = result.data;
            });
        }

        function confimarEnviar(fila, equipe) {
            if (fila) {
                var confirm = $mdDialog.confirm().title('E-mail selecionados').textContent('Deseja enviar o(s) e-mails selecionado(s) para fila de vendedores da equipe '+equipe.nome+'?').ariaLabel('Enviar para fila').ok('SIM').cancel('NÃO');
                $mdDialog.show(confirm).then(function(event) {
                    enviarPreLeadsParaFila(equipe);
                });
            } else {
                var confirm = $mdDialog.confirm().title('E-mail selecionados').textContent('Deseja excluir o(s) e-mails selecionado(s)?').ariaLabel('Excluir').ok('SIM').cancel('NÃO');
                $mdDialog.show(confirm).then(function(event) {
                    deletarPreLeads();
                });
            }
        }
        function modalImport(tipo){
			var etapa = ctrl.etapas.find(function(item){
				return item.ordem === 0;
			});
            ctrl.import={
				type: tipo,
				etapa: etapa
			};
			if(tipo=='xls'){
				ModalService.modalImportArquivoXls($scope);
			}else{
				ModalService.modalImportArquivo($scope);
			}
		}
		

        function importArquivo(){

            ctrl.import.blockbutton=true;

			$document.find("body").css("cursor","wait");
			if(ctrl.import.type == 'facebook' ){
				PreLeadsService.importFacebook(ctrl.import.file, ctrl.import.equipe).then(function(result){
					$scope.$close();
					$document.find("body").css("cursor","default");
					$mdDialog.show($mdDialog.alert().parent(angular.element(document.querySelector('#popupContainer'))).clickOutsideToClose(true).title('Importação finalizada').textContent("Importação de leads do Facebook concluída").ariaLabel('Lead reaberta').ok('Continuar'));
				},function(result){

                    MensagensService.vermelho("Erro ao enviar o arquivo", "Erro ao enviar o arquivo");
					ctrl.import.blockbutton=false;
					$document.find("body").css("cursor","default");
				});
			}else if(ctrl.import.type == 'xls'){
				AnexosService.upload(ctrl.import.file).then(function(result){
					ctrl.import.anexo = result.data;
					delete ctrl.import.file;
					console.log(ctrl.import);
					PreLeadsService.importXls(ctrl.import).then(function(result){
						$scope.$close();
						$document.find("body").css("cursor","default");
						$mdDialog.show($mdDialog.alert().parent(angular.element(document.querySelector('#popupContainer'))).clickOutsideToClose(true).title('Importação finalizada').textContent("Importação de leads por Excel concluída:"+result.data).ariaLabel('Lead reaberta').ok('Continuar'));
					},function(result){
						MensagensService.vermelha("Erro ao enviar o arquivo", result.data);
						ctrl.import.blockbutton=false;
						$document.find("body").css("cursor","default");
					});
				},function(result){
					MensagensService.vermelha("Erro ao enviar o arquivo", result.data);
					ctrl.import.blockbutton=false;
					$document.find("body").css("cursor","default");
				});
			}
        }
    }
})();