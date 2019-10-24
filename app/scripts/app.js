(function () {
    'use strict';
    /**
     * @ngdoc overview
     * @name sejaDiretoApp
     * @description
     * # sejaDiretoApp
     *
     * Main module of the application.
     */
    var libs = [
        'ngAnimate',
        'ngCookies',
        'ngResource',
        'ngRoute',
        'ngSanitize',
        'ngMaterial',
        'ui.router',
        'toastr',
        'chart.js',
        'ang-drag-drop',
        'jcs-autoValidate',
        'ui.utils.masks',
        'nl2br-filter',
        'perfect_scrollbar',
        'moment-picker',
        'pathgather.popeye',
        'sc.select',
        'summernote',
        'file-model',
        'ngStorage',
		'ngTagsInput',
		'ui.sortable',
		'rzModule'
	];


    angular.module('sejaDiretoApp', libs).config(function ($stateProvider, $urlRouterProvider, $mdThemingProvider, $locationProvider) {

        $locationProvider.html5Mode(true);
        $mdThemingProvider.theme('default').primaryPalette('indigo').accentPalette('light-blue');
        $stateProvider.state('home', {
            url: '/',
            templateUrl: 'view/home/home.html',
            controller: 'HomeController as ctrl',
            authenticate: true,
            controllerAs: 'ctrl',
            resolve: {
                ConfigService: function (ConfigService, $cookies, $state) {
                    if (!ConfigService.loaded && $cookies.get("session")) {
                        return ConfigService.fillConfigAndParameters();
                    } else if (ConfigService.loaded) {
                        return ConfigService;
                    } else {
                        return false;
                    }
                },
                Leads: function (LeadsService) {
                    return LeadsService.fillLeads();
                }
            }
        }).state('home.leads', {
            url: 'leads',
            params: {
                leadId: '',
            },
            controller: 'LeadsController as ctrl',
            templateUrl: 'view/leads/leads.html',
            authenticate: true
        }).state('home.lead', {
            url: 'lead/:leadId',
            controller: 'LeadModalController as ctrl',
            templateUrl: 'view/leads/lead.full.html',
            resolve: {
                LeadData: function (LeadsService, $stateParams) {
                    return LeadsService.getLead($stateParams.leadId);
                }
            }

        }).state('home.atividades', {
            url: 'atividades',
            controller: 'AtividadesController as ctrl',
            templateUrl: 'view/atividades/atividades.html',
            authenticate: true,
            resolve: {
                Atividades: function (AtividadesService) {
                    return AtividadesService.get();
                }
            }
        }).state('home.tags', {
            url: 'tags',
            controller: 'TagsController as ctrl',
            templateUrl: 'view/listas/tags.html',
            authenticate: true
        }).state('home.clientes', {
            url: 'clientes',
            controller: 'ClientesController as ctrl',
            templateUrl: 'view/listas/clientes.html',
            authenticate: true,
            resolve: {
                Equipes: function (EquipeService) {
                    return EquipeService.getEquipes();
                }
            }
        }).state('home.encerradas', {
            url: 'encerradas',
            controller: 'EncerradasController as ctrl',
            templateUrl: 'view/listas/encerradas.html',
            authenticate: true,
            resolve: {
                Equipes: function (EquipeService) {
                    return EquipeService.getEquipes();
                }
            },
            params: {
                filtros: {}
            }
        }).state('home.acompanhamento', {
            url: 'acompanhamento',
            controller: 'AcompanhamentoController as ctrl',
            templateUrl: 'view/listas/acompanhamento.html',
            authenticate: true,
            resolve: {
                Equipes: function (EquipeService) {
                    return EquipeService.getEquipes();
                }
            }
        }).state('home.equipe', {
            url: 'equipe',
            controller: 'EquipeController as ctrl',
            templateUrl: 'view/equipe/equipe.html',
            authenticate: true,
            resolve: {
                Usuarios: function (EquipeService) {
                    return EquipeService.getAllUsers();
                },
                Equipes: function (EquipeService) {
                    return EquipeService.getEquipes();
                }
            },
            params: {
                usuario: {}
            }
        }).state('home.idleads', {
            url: 'idleads',
            controller: 'IdLeadsController as ctrl',
            templateUrl: 'view/listas/id.leads.html',
            authenticate: true,
            resolve: {
                PreLeads: function (PreLeadsService) {
                    return PreLeadsService.getPreLeads();
                },
                Equipes: function (EquipeService) {
                    return EquipeService.getEquipes();
                }
            }
        }).state('home.relatorios', {
            url: 'relatorios',
            templateUrl: 'view/relatorios/filtrosRelatorios.tmpl.html',
            controller: 'RelatoriosController as ctrl',
            authenticate: true,
            resolve: {
                Equipes: function (EquipeService) {
                    return EquipeService.getEquipes();
                }
            },
            params: {
                relatorio: '',
                filtros: {}
            }
        }).state('home.dashboard', {
            url: 'dashboard',
            templateUrl: 'view/dashboard/dashboard.tmpl.html',
            controller: 'DashboardController as ctrl',
            authenticate: true,
            resolve: {
                Equipes: function (EquipeService) {
                    return EquipeService.getEquipes();
                }
            }
        }).state('home.rede', {
            url: 'rede',
            templateUrl: 'view/relatorios/filtrosRede.tmpl.html',
            controller: 'RedeController as ctrl',
            authenticate: true,
            resolve: {
                Equipes: function (ConfigService) {
                    return ConfigService.getEquipesRede();
                }
            }
        }).state('home.produtos', {
            url: 'produtos',
            templateUrl: 'view/produtos/produtos.genericos.html',
            controller: 'ProdutosController as ctrl',
            authenticate: true
        }).state('home.veiculos', {
            url: 'veiculos',
            templateUrl: 'view/produtos/produtos.veiculos.html',
            controller: 'VeiculosController as ctrl',
            authenticate: true,
            resolve: {
                Produtos: function (ProdutosService) {
                    return ProdutosService.getProdutos();
                }
            }
        }).state('home.imoveis', {
            url: 'imoveis',
            templateUrl: 'view/produtos/produtos.imoveis.html',
            controller: 'ImoveisController as ctrl',
            authenticate: true
        }).state('home.configuracoes', {
            url: 'configuracoes',
            templateUrl: 'view/configuracoes/configuracoes.novo.html',
            controller: 'ConfiguracoesController as ctrl',
            authenticate: true
        }).state('login', {
            url: '/login',
            controller: 'AuthController as authCtrl',
            templateUrl: 'view/auth/login.html',
            authenticate: false
        }).state('home.changepwd', {
            url: 'changepwd',
            controllerAs: 'ctrl',
            templateUrl: 'view/auth/mudarSenha.html',
            authenticate: false,
            controller: function (ConfigService, UsuarioService, MensagensService, $cookies) {
                var ctrl = this;
                ConfigService.loaded = false;
                var session = $cookies.get("session");
                $cookies.remove("session");
                ctrl.alterarSenha = function (novaSenha) {
                    if (novaSenha != "123456") {
                        var usuario = angular.copy(ConfigService.profile);
                        usuario.password = "123456";
                        usuario.newPassword = sha512(novaSenha);
                        UsuarioService.mudarSenha(usuario, session).then(function () {
                            alert("Faça o login com a nova senha.");
                            window.location = '/logout';
                        });
                    } else {
                        MensagensService.vermelha("Senha", "Senha inválida");
                    }
                }
            }
        }).state('logout', {
            url: '/logout',
            authenticate: true,
            controller: function ($state, $cookies, $timeout, $window) {
                $cookies.remove("session");
                delete $window.sessionStorage.session;
                $timeout(function () {
                    $window.location = "/login";
                });
            }
        }).state('esqueci',{
			url:'/forgotpwd',
			templateUrl: 'view/auth/resetpwd.html',
			controller: 'AuthController as authCtrl',
			authenticate:false
		}).state('reset', {
            url: '/newpwd/:token',
            controllerAs: 'ctrl',
            templateUrl: 'view/auth/mudarSenha.html',
            authenticate: false,
            controller: function (Usuario, AuthService, $stateParams, MensagensService) {
				var ctrl = this;
				ctrl.usuario = Usuario.data;
                ctrl.alterarSenha = function (novaSenha) {
                    if (novaSenha != "123456") {
                        ctrl.usuario.newPassword = sha512(novaSenha);
                        AuthService.resetPwd(ctrl.usuario, $stateParams.token).then(function () {
                            alert("Faça o login com a nova senha.");
                            window.location = '/logout';
                        });
                    } else {
                        MensagensService.vermelha("Senha", "Senha inválida");
                    }
                }
			},
            resolve: {
                Usuario: function (AuthService,$stateParams) {
                    return AuthService.getUserReset($stateParams.token);
                }
            } 
        });
        $urlRouterProvider.otherwise('login');
    }).config(['$httpProvider', function ($httpProvider, $q) {
        delete $httpProvider.defaults.headers.common["X-Requested-With"];
        $httpProvider.defaults.withCredentials = true;
        $httpProvider.defaults.timeout = 5000;
        $httpProvider.interceptors.push(function ($location) {
            var protocol = $location.protocol();
            var apiUrl = protocol + "://ws.sejadireto.com.br/";

            if ($location.host() == 'localhost') {
                apiUrl = "http://localhost:1207/";
            }
            
            if ($location.host() == 'testes.sejadireto.com.br') {
                apiUrl = protocol + "://wstestes.sejadireto.com.br/";
            }

            var ignoreFileRequests = ['png', 'jpg', 'json', 'html'];
            return {
                'request': function (config) {
                    if (typeof config.url == "object") {
                        return config || $q.when(config);
                    }
                    var urlParts = config.url.split('.');
                    if (config.url.includes("quicksip")){
                        config.url = config.url;
                        config.measure = true;
                        config.startTime = new Date().getTime();
                    } else if (ignoreFileRequests.indexOf(urlParts[urlParts.length - 1]) == -1 && urlParts[urlParts.length - 1].indexOf('?v') == -1 && !config.ignoreWS) {
                        config.url = apiUrl + config.url;
                        config.measure = true;
                        config.startTime = new Date().getTime();
                    } else {
                        config.url = config.url;
                    }
                    return config || $q.when(config);
                },

                response: function (response) {
                    
                    return response;
                }
            }
        });
    }]).run(function ($rootScope, $state, $cookies, ConfigService, $window) {
        $rootScope.$on("$stateChangeStart", function (event, toState, toParams, fromState, fromParams) {
			console.log(toState.name);
            if ($("div.sd-ul-container.vertical").hasClass("in")) {
                $("#menubar-open").click();
            }
            if (!ConfigService.loaded && $cookies.get("session")) {
                $window.sessionStorage.session = $cookies.get("session");
                ConfigService.fillConfigAndParameters().then(function (service) {
                    var estado = ConfigService.validarEstado(toState);

                    if (!estado.valido) {
                        $state.transitionTo(estado.proximo);
                        event.preventDefault();
                    }
                });
            } else if (ConfigService.loaded) {
                var estado = ConfigService.validarEstado(toState);
                if (!estado.valido) {
                    $state.transitionTo(estado.proximo);
                    event.preventDefault();
                }
            } else if (toState.name != "login" && toState.name != "esqueci" && toState.name != "reset") {

                $state.transitionTo("login");
                event.preventDefault();
            }
        });
    }).config( [
		'$compileProvider',
		function( $compileProvider )
		{   
			$compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|chrome-extension|quicksip):/);
			// Angular before v1.2 uses $compileProvider.urlSanitizationWhitelist(...)
		}
	]).value('summernoteConfig', {
        height: 130,
        airMode: false,
        lang: 'pt-BR',
        toolbar: [
            ['fontface', ['fontname']],
            ['textsize', ['fontsize']],
            ['style', ['bold', 'italic', 'underline', 'clear']],
            ['fontclr', ['color']],
            ['alignment', ['ul', 'ol', 'paragraph', 'lineheight']],
            ['insert', ['link', 'hr', 'picture']],
            ['edit', ['undo']],
            ['view', ['fullscreen']]
        ],
		callbacks: {
			onImageUpload: function(files) {
				var protocol = window.location.protocol;
				var apiUrl = protocol + "//ws.sejadireto.com.br/";

				if (window.location.host == 'localhost' || window.location.host == 'localhost:9000') {
					apiUrl = "http://localhost:1207/";
				}

				if (window.location.host== 'testes.sejadireto.com.br') {
					apiUrl = protocol + "//wstestes.sejadireto.com.br/";
				}
				
				if(files[0].size <= 1000000){
					$.ajax({
						data: files[0],
						type: "POST",
						url: apiUrl+"anexo/image",
						cache: false,
						headers: {
							'Content-Type':'application/octet-stream',
							'filename':files[0].name,
							"session" : $.cookie("session")		
						},
						contentType: false,
						processData: false,
						success: function(url) {
							$('.summernote').summernote('editor.insertImage', url);
						}
					});
				}else{
					alert("O tamanho deve ser menor que 1Mb");
				}
			}
		}
    });
    // Check if a new cache is available on page load.
    window.addEventListener('load', function (e) {
        window.applicationCache.addEventListener('updateready', function (e) {
            if (window.applicationCache.status == window.applicationCache.UPDATEREADY) {
                // Browser downloaded a new app cache.
                // Swap it in and reload the page to get the new hotness.
                try {
                    window.applicationCache.swapCache();
                } catch (e) {

                }
                window.location.reload(true);
            } else {
                window.location.reload(true);
                // Manifest didn't changed. Nothing new to server.
            }
        }, false);
    }, false);
})();

