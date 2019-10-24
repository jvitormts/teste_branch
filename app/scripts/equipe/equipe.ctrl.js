(function () {
    'use strict';
    angular.module('sejaDiretoApp').controller('EquipeController', Controller);

    function Controller($localStorage, ConfigService, Usuarios, Equipes, EquipeService, ModalService, $timeout, $scope, $state, $cookies,$window, $stateParams, MensagensService, UsuarioService, $mdDialog, LeadsService, $filter) {
        var ctrl = {};
        ctrl.menu = ConfigService.menu;
        ctrl.profile = ConfigService.profile;
        ctrl.usuariosDesativados = Usuarios.data.filter(function (data) {
            return !data.usuarioId;
        });
        ctrl.equipes = Equipes.data;
       
        ctrl.init = init;
        ctrl.fila = fila;
        ctrl.etapas = ConfigService.etapas;
        ctrl.validarAcessoFuncao = ConfigService.validarAcessoFuncao;
        ctrl.validarAcessoTela = ConfigService.validarAcessoTela;
        ctrl.validarFullAccess = ConfigService.validarFullAccess;
        ctrl.exibirFunilUsuario = exibirFunilUsuario;
        ctrl.exibirAtividadesUsuario = exibirAtividadesUsuario;
        ctrl.modalUsuario = modalUsuario;
        ctrl.validarStatus = validarStatus;
        ctrl.editarEquipe = editarEquipe;
        ctrl.salvarEquipe = salvarEquipe;
        ctrl.selecionaAba = selecionaAba;
        ctrl.deleteUsuario = deleteUsuario;
        ctrl.transferirLeadsUsuarioRemovido = transferirLeadsUsuarioRemovido;
		ctrl.transferirLeadsEmMassa = transferirLeadsEmMassa;
		ctrl.abrirModalTransferenciaLeadsEmMassa=abrirModalTransferenciaLeadsEmMassa;
		ctrl.getSelected = getSelected;
		ctrl.limparSelecao = limparSelecao;
		ctrl.loginAs=loginAs;
        ctrl.vendedores = Usuarios.data.filter(function (data) {
            return data.perfilId && ctrl.validarAcessoTela('home.leads', data) && !data.equipe;
		});
        ctrl.addEtapa = addEtapa;

        return ctrl;
		
		function addEtapa(){
			if(ctrl.equipe){
				var novaEtapa = {
					ordem : ctrl.equipe.etapas ? ctrl.equipe.etapas.length:0,
					nome: "Nova Etapa",
					avisoTarefaVencimento: 30,
					tempoMaximoAgendamento: 120
				}
				ctrl.etapa = novaEtapa;
				if(ctrl.equipe.etapas){
					ctrl.equipe.etapas.push(novaEtapa);
				}else{
					ctrl.equipe.etapas = [novaEtapa];
				}
			}
		}

		function limparSelecao(){
			if(ctrl.leadsUsuario){
				ctrl.leadsUsuario.forEach(function(lead){
					lead.selected=false;
				});
			}
			ctrl.equipe.etapas.forEach(function(etapa){
				etapa.selected=false;
			});
		}

        function init() {
            if ($stateParams.usuario.id > 0) {
                selecionaAba($stateParams.usuario.equipeId.id);
                exibirFunilUsuario($stateParams.usuario);
            } else if($localStorage.telaEquipe){
                exibirFunilUsuario($localStorage.telaEquipe.usuario);
                selecionaAba(ctrl.equipes[0].id);
			} else {
                selecionaAba(ctrl.equipes[0].id);
            }
			loadEquipe();
			
			ctrl.sortableOptions = {
				stop: stopSort
			};
			
		}

		function stopSort(e,ui){
			ctrl.etapa = ui.item.scope().etapa;
			ctrl.equipe.etapas.forEach(function(etapa,ordem){
				etapa.ordem = ordem;
			});
		}
        function selecionaAba(id) {
			delete ctrl.etapa;
            if (id == 'new') {
                ctrl.abaSelecionada = id;
                ctrl.equipe = {};
                ctrl.usuarioSelecionado = {};
                ctrl.exibeFunil = false;
                ctrl.exibeAtividades = false;
                ctrl.edit = true;
                $(".scroller-equipe").scrollTop(0);
            } else {
                ctrl.equipe = ctrl.equipes.filter(function (obj) {
                    return obj.id == id || (id==0 && obj.equipePadrao);
                })[0];

                ctrl.abaSelecionada = ctrl.equipe.id;

                ctrl.usuarioSelecionado = {};
                ctrl.exibeFunil = false;
                ctrl.exibeAtividades = false;
                ctrl.edit = false;
                $(".scroller-equipe").scrollTop(0);
            }
            ctrl.habilitarTransferencia? ctrl.habilitarTransferencia = !ctrl.habilitarTransferencia : '';
        }
        function loadEquipe() {
            if ($state.current.name == 'home.equipe') {
                EquipeService.getAllUsers().then(function (result) {
                    ctrl.usuariosSemEquipe = result.data.filter(function (data) {
                        return !data.equipe;
                    });
                    ctrl.vendedores = result.data.filter(function (data) {
                        return data.perfilId &&  ctrl.validarAcessoTela('home.leads', data) && !data.equipe;
                    });
                    EquipeService.getEquipes().then(function (result) {
                        ctrl.equipes = result.data;
                        ctrl.equipes.forEach(function (equipe) {
                            equipe.usuariosList.forEach(function (usuario) {
                                usuario.online = validarStatus(usuario);
                            })
                        });
                        ctrl.equipe = ctrl.equipes.filter(function (obj) {
                            return obj.id == ctrl.equipe.id;
                        })[0];
                    });
                });

            }

        }

        function modalUsuario(usuario) {
			if(usuario){
				var user = Usuarios.data.find(function(obj){
					return obj.id == usuario.id;
				});
			}
            var modal = ModalService.modalUsuario(user);
            modal.closed.then(function () {
                $timeout(function () {
                    $state.reload();
                }, 1500);
            });
        }

        function exibirFunilUsuario(usuario) {

            ModalService.reload = function () {
                ctrl.exibirFunilUsuario(usuario);
            };
			ctrl.usuarioSelecionado = usuario;
			
			$localStorage.telaEquipe ={
				usuario: ctrl.usuarioSelecionado,
				equipe : ctrl.equipe
			};
            EquipeService.getLeads(usuario.id).then(function (result) {
                ctrl.leadsUsuario = result.data;
                ctrl.exibeFunil = true;
                ctrl.exibeAtividades = false;
                $timeout(function () {
                    $(".scroller-equipe").scrollTop($(".scroller-equipe").prop("scrollHeight"));
                    $(".ps-container").perfectScrollbar('update');
                    $(".ps-container").perfectScrollbar('update');
                }, 1000);
            });
        }

        function exibirAtividadesUsuario(usuario) {
            ctrl.usuarioSelecionado = usuario;
            EquipeService.getAtividades(usuario.id).then(function (result) {
                ctrl.atividadesUsuario = result.data;
                ctrl.exibeFunil = false;
                ctrl.exibeAtividades = true;
                $timeout(function () {
                    $(".scroller-equipe").scrollTop($(".scroller-equipe").prop("scrollHeight"));
                    $(".ps-container").perfectScrollbar('update');
                }, 1000);
            });
        }

        function fila(usuario) {
            EquipeService.fila(usuario.id).then(function (result) {
                if (result.data == "false") {
                    usuario.disponibilidade = true;
                    MensagensService.vermelha('Fila', 'É necessário que haja ao menos um usário disponível na fila da equipe.');
                }
            });
            return true;
        }

        function validarStatus(usuario) {
            var lastOnline = moment.utc(usuario.lastOnline);
            var agora = moment.utc();
            agora.subtract(3, 'minutes');
            if (lastOnline.isAfter(agora)) {
                return true;
            } else {
                return false;
            }
        }

        function editarEquipe(equipe) {
            selecionaAba('new');
			ctrl.equipe = angular.copy(equipe);
			ctrl.equipe.etapas=$filter("orderBy")(ctrl.equipe.etapas, 'ordem');
        }

        function salvarEquipe() {
            if (ctrl.equipe.email) {
                var validaEmail = ctrl.equipes.find(function (obj) {
                    return obj.email == ctrl.equipe.email && obj.id != ctrl.equipe.id;
                });
                if (validaEmail) {
                    MensagensService.vermelha('Email', 'Esse email já esta sendo utilizado para a equipe ' + validaEmail.nome);
                    return false;
                }
            }
            if (ctrl.equipe.id) {
                EquipeService.editarEquipe(ctrl.equipe).then(function () {
                    loadEquipe();
                    selecionaAba(ctrl.equipe.id);
                });
            } else {
                EquipeService.novaEquipe(ctrl.equipe).then(function () {
                    loadEquipe();
                    selecionaAba(0);
                });
            }

        }

        function deleteUsuario(usuario) {
            var fila = ctrl.equipe.usuariosList.filter(function(item){
                return usuario.id != item.id && item.disponibilidade;
            });
            if(fila.length == 0){
                MensagensService.vermelha('Fila', 'É necessário que haja ao menos um usário disponível na fila da equipe.');
                return;
            }
            if (confirm("Deseja remover o usuário?")) {
                EquipeService.getLeads(usuario.id).then(function (result) {
                    var funilVazio = result.data.length < 1 ? true : false;
                    if (!funilVazio) {
                        $mdDialog.show($mdDialog.alert().parent(angular.element(document.querySelector('#popupContainer'))).clickOutsideToClose(true).title('Escolha para onde deseja transferir as leads ABERTAS deste usuário').ariaLabel('Transferir Leads Usuário Deletado').ok('Continuar')).then(function () {
                            abrirModalTransferenciaUsuarioRemovido();
                        });
                    } else {
                        UsuarioService.deleteUsuario(ctrl.usuario.id);
                    }
                });
                return true;
            }
            ctrl.init();
            return false;
        }

        function abrirModalTransferenciaUsuarioRemovido() {
            EquipeService.getEquipes().then(function (result) {
                ctrl.transferencia = {};
                ctrl.equipesUsuarioRemovido = result.data.filter(function (obj) {
                    return obj.usuariosList.length > 0;
                });
                ctrl.equipesUsuarioRemovido[0].usuariosList = ctrl.equipesUsuarioRemovido[0].usuariosList.filter(function (el) {
                    return el.id != ctrl.usuario.id;
                });
                ctrl.modalTransferencia = ModalService.modalTransferenciaUsuarioRemovido($scope);
            });
        }

        function transferirLeadsUsuarioRemovido() {
            if (ctrl.usuario.disponibilidade) {
                ctrl.mostrarTexto = true;
                EquipeService.fila(ctrl.usuario.id).then(function (result) {
                    if (result.data == "false") {
                        ctrl.usuario.disponibilidade = true;
                        MensagensService.vermelha('Fila', 'É necessário que ao menos um esteja usuário disponível na fila da equipe após a operação.');
                    } else {
                        EquipeService.getLeads(ctrl.usuario.id).then(function (result) {
                            ctrl.transferencia.leads = result.data;
                            LeadsService.transferirMultiplasLeads(ctrl.transferencia).then(function (result) {
                                init(result.data);
                                ctrl.modalTransferencia.close();
                                UsuarioService.deleteUsuario(ctrl.usuario.id);
                                ctrl.mostrarTexto = false;
                                MensagensService.verde('Sucesso.', 'Leads transferidas com sucesso');
                            }, function(){ctrl.mostrarTexto = false;});
                        }, function(){ctrl.mostrarTexto = false;});
                    }
                }, function(){ctrl.mostrarTexto = false;});
            } else {
                ctrl.mostrarTexto = true;
                EquipeService.getLeads(ctrl.usuario.id).then(function (result) {
                    ctrl.transferencia.leads = result.data;
                    LeadsService.transferir*MultiplasLeads(ctrl.transferencia).then(function (result) {
                        init(result.data);
                        ctrl.modalTransferencia.close();
                        UsuarioService.deleteUsuario(ctrl.usuario.id);
                        ctrl.mostrarTexto = false;
                        MensagensService.verde('Sucesso.', 'Leads transferidas com sucesso');
                    }, function(){ctrl.mostrarTexto = false;})
                }, function(){ctrl.mostrarTexto = false;});
            }
        }

        function abrirModalTransferenciaLeadsEmMassa() {
            EquipeService.getEquipes().then(function (result) {
                ctrl.transferencia = {};
                ctrl.equipesLeadsEmMassa = result.data.filter(function (obj) {
                    return obj.usuariosList.length > 0;
                });
                ctrl.equipesLeadsEmMassa[0].usuariosList = ctrl.equipesLeadsEmMassa[0].usuariosList.filter(function (el) {
                    return el.id != ctrl.usuarioSelecionado.id;
                });
                ctrl.modalTransferencia = ModalService.modalTransferenciaLeadsEmMassa($scope);
            });
		}
		
		function getSelected(){
			if(ctrl.leadsUsuario){
				return ctrl.leadsUsuario.filter(function(obj){
					return obj.selected;
				});
			}
		}

        function transferirLeadsEmMassa() {
            ctrl.transferencia.leads=getSelected();
            LeadsService.transferirMultiplasLeads(ctrl.transferencia).then(function (result) {
				ctrl.habilitarTransferencia = false;
				exibirFunilUsuario(ctrl.usuarioSelecionado);
                MensagensService.verde('Sucesso.', 'Leads transferidas com sucesso');
                //UsuarioService.deleteUsuario(ctrl.usuario.id);
            });
			ctrl.modalTransferencia.close()
		}
		

		
		function loginAs(usuario){
			if(confirm("Deseja a acessar o SD como o usuário "+usuario.nome+" ? (Para voltar ao modo de administrador você deverá fazer login novamente)"))
			EquipeService.loginAs(usuario.id).then(function(result){
				var today = new Date();
				var expiresValue = new Date(today.getTime() + (8 * 60 * 60 * 1000));
				$cookies.put('session', result.data.token, {
					'expires': expiresValue
				});
				$window.sessionStorage.session = result.data.token;
				ConfigService.loaded=false;
				$timeout(function(){
					window.location = "/leads";
				});
			});
		}


    }
})();