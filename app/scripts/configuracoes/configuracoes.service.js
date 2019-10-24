(function () {
    'use strict';
    angular.module('sejaDiretoApp').factory('ConfigService', Service);

    function Service($http, $cookies, AuthService, $q, $state, RedeService, $location) {
        var service = {};
        service.etapas = [];
        service.fillConfigAndParameters = fillConfigAndParameters;
        service.getConfig = getConfig;
        service.editConfig = editConfig;
        service.editHorarios = editHorarios;
        service.getMenu = getMenu;
        service.validarAcessoFuncao = validarAcessoFuncao;
        service.validarEstado = validarEstado;
        service.editEtapa = editEtapa;
        service.clear = clear;
        service.newMotivo = newMotivo;
        service.editMotivo = editMotivo;
        service.editMidia = editMidia;
        service.newMidia = newMidia;
        service.getMidiasListasRelatorios = getMidiasListasRelatorios;
        service.removerMotivo = removerMotivo;
        service.removerMidia = removerMidia;
        service.getPermissoesFuncoes = getPermissoesFuncoesArray;
        service.validarAcessoTela = validarAcessoTela;
        service.editPerfil = editPerfil;
        service.newPerfil = newPerfil;
		service.removerPerfil = removerPerfil;
		service.timeAngular = saveTime;
		service.getTags = getTags;
		service.getTagsString = getTagsString;
		service.validarFullAccess = validarFullAccess;
		service.getEquipesRede = getEquipesRede;
		return service;
		

        function getMenu() {
            return $http.get('scripts/directives/menu.json');
        }

        function getEquipesRede() {
            var req = {
                method: 'GET',
                url: 'config/equipesRede'
            }
            return $http(req);
        }

        function getConfig() {
            var req = {
                method: 'GET',
                url: 'config'
            }
            var data = $http(req);
            return data;
        }

        function editConfig(data, type) {
            var req = {
                method: 'PUT',
                url: 'config/' + type,
                data: data
            }
            return $http(req);
        }


        function newMotivo(data) {
            var req = {
                method: 'POST',
                url: 'config/motivo_cancelamento',
                data: data
            }
            return $http(req);
        }

        function editMotivo(data) {
            var req = {
                method: 'PUT',
                url: 'config/motivo_cancelamento',
                data: data
            }
            return $http(req);
        }

        function removerMotivo(id) {
            var req = {
                method: 'DELETE',
                url: 'config/motivo_cancelamento/' + id
            }
            return $http(req);
        }

        function removerPerfil(id) {
            var req = {
                method: 'DELETE',
                url: 'config/perfil/' + id
            }
            return $http(req);
        }
        function newMidia(data) {
            var req = {
                method: 'POST',
                url: 'config/midias',
                data: data
            }
            return $http(req);
        }

        function getMidiasListasRelatorios() {
            var req = {
                method: 'GET',
                url: 'config/midiasListasRelatorios'
            }
            var data = $http(req);
            return data;
        }

        function getTags(query) {
            var req = {
                method: 'GET',
                url: 'config/tags/'+query
            }
            var data = $http(req);
            return data;
        }
        function getTagsString(query) {
            var req = {
                method: 'GET',
                url: 'config/tagsString/'+query
            }
            var data = $http(req);
            return data;
        }


        function editMidia(data) {
            var req = {
                method: 'PUT',
                url: 'config/midias',
                data: data
            }
            return $http(req);
        }

        function removerMidia(id) {
            var req = {
                method: 'DELETE',
                url: 'config/midias/' + id
            }
            return $http(req);
        }

        function editEtapa(data) {
            var req = {
                method: 'PUT',
                url: 'config/etapas',
                data: data
            }
            return $http(req);
        }

        function editHorarios(data, type) {
            var req = {
                method: 'PUT',
                url: 'config/horarios',
                data: data
            }
            return $http(req);
        }

        function fillConfigAndParameters() {
			console.log("loading");
            var req = {
                method: 'GET',
                url: 'config'
            }
            var deferred = $q.defer();
            AuthService.getProfile().then(function (profileResult) {
				service.profile = profileResult.data;
				
				
                getMenu().then(function (menuResult) {
                    service.menu = menuResult.data;
                    $http(req).then(function (result) {
                        angular.extend(service, result.data);

                        service.menu.forEach(function(item){
                            if(item.condition){
                                item.href=item.href[service.loja.negocio];
                                item.iconClass=item.iconClass[service.loja.negocio];
                                delete item.condition;
                            }
                        })
						service.loaded = true;
						deferred.resolve(service);
                    });
                });
            }, function (result) {
                if (result.status == 401) {
                    $state.go("logout");
                }
            });
            return deferred.promise;
        }

        function validarAcessoFuncao(funcao, profile) {

            var funcoes = getPermissoesFuncoes();

            return (profile.situacao && profile.perfilId && funcoes[funcao].permissao & profile.perfilId.segurancaFuncao) || profile.perfilId.segurancaFuncao == 16384;
        }

        function validarFullAccess(profile) {

            return profile.perfilId && profile.perfilId.segurancaFuncao == 16384;
        }
        function validarAcessoTela(tela, profile) {
            var seguranca = service.menu.filter(function (obj) {
                return tela == obj.href;
            })[0];
            return (profile.situacao && profile.perfilId && seguranca.permissao & profile.perfilId.segurancaTela) || profile.perfilId.segurancaTela == 16384;
        }

        function getPermissoesFuncoes() {

            var funcoes = {
                TRANSFERIR_LEAD: {
                    permissao: 2,
                    descricao: "Transferir lead entre vendedores"
                },
                EXCLUIR_LEAD: {
                    permissao: 4,
                    descricao: "Excluir lead"
                },
                ADICIONAR_EDITAR_USUARIO: {
                    permissao: 8,
                    descricao: "Adicionar e editar usuários"
                },
                EXCLUIR_USUARIO: {
                    permissao: 16,
                    descricao: "Excluir usuário"
                },
                EDITAR_CANAL: {
                    permissao: 32,
                    descricao: "Editar Canal da Lead"
                },
                TROCAR_LOJA: {
                    permissao: 64,
                    descricao: "Acesso à funções de rede"
                },
                TRANSFERIR_LEAD_REDE: {
                    permissao: 128,
                    descricao: "Encaminhar lead para outra loja"
                },
                REGISTRAR_LEAD_USUARIO: {
                    permissao: 256,
                    descricao: "Registrar Novo Negócio para outro usuário"
                },
                EXPORTAR_EXCEL: {
                    permissao: 512,
                    descricao: "Baixar planilha Excel"
				}
			};
            return funcoes;
        }


        function getPermissoesFuncoesArray() {

            var funcoes = [{
                permissao: 2,
                descricao: "Transferir lead entre vendedores"
            }, {
                permissao: 4,
                descricao: "Excluir lead"
            }, {
                permissao: 8,
                descricao: "Adicionar e editar usuários"
            }, {
                permissao: 16,
                descricao: "Excluir usuário"
            }, {
                permissao: 32,
                descricao: "Editar Canal da Lead"
            }, {
                permissao: 64,
                descricao: "Acesso à funções de rede"
            }, {
                permissao: 128,
                descricao: "Encaminhar lead para outra loja"
            },
            {
                permissao: 256,
                descricao: "Registrar Novo Negócio para outro usuário"
            },
            {
                permissao: 512,
                descricao: "Baixar planilha Excel"
			}];
			if(!service.loja.habilitaEncaminhamento){
				funcoes.splice(6,1);
				
			}
            return funcoes;
        }

        function clear() {
            delete service.loja;
            delete service.profile;
            service.loadedquery = false;
        }

        function validarEstado(toState) {
			if(toState.name=='home.lead'){
                return {
                    valido: true
                };
			}
            if (!service.loaded) {
                return;
			}
			if(service.profile.perfilId.segurancaTela == 16384 && (toState.name == "login" || toState.name == "home")){
                return {
                    valido: false,
                    proximo: service.profile.perfilId.defaultHome ? service.profile.perfilId.defaultHome : 'home.equipe'
                };
			}else if(service.profile.perfilId.segurancaTela == 16384){
				return {
                    valido: true
                };
			}
            if (toState.authenticate && !service.profile) {
                return {
                    valido: false,
					proximo: 'login'
				};
            } else if ((toState.name == "login" || toState.name == "home") && service.profile) {
                return {
                    valido: false,
                    proximo: service.profile.perfilId.defaultHome
                };
            } else if (toState.authenticate) {
                var ordem = 0;
                var menuItem = {};
                do {
                    if (ordem == 0) {
                        menuItem = service.menu.filter(function (obj) {
                            return toState.name == obj.href;
                        })[0];
                    } else {
                        menuItem = service.menu.filter(function (obj) {
                            return obj.ordem == ordem;
                        })[0];
                        if (!menuItem) {
                            ordem = 0;
                            menuItem = service.menu.filter(function (obj) {
                                return obj.ordem == ordem;
                            })[0];
                        }
                    }
                    ordem = menuItem.ordem + 1;
                } while (!(menuItem.permissao & service.profile.perfilId.segurancaTela));
                if (toState.name != menuItem.href) {
                    return {
                        valido: false,
                        proximo: menuItem.href
                    };
                }
                return {
                    valido: true
                };
            }
            return {
                valido: true
            };
        }



        function newPerfil(perfil) {
            var req = {
                method: 'POST',
                url: 'config/perfil',
                data: perfil
            }
            return $http(req);
        }

        function editPerfil(perfil) {
            var req = {
                method: 'PUT',
                url: 'config/perfil',
                data: perfil
            }
            return $http(req);
        }

        function saveTime(data) {
            return true;
        }
    }
})();