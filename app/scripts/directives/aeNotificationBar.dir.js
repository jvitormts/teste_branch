(function () {
    'use strict';
    angular.module('sejaDiretoApp').directive('notificationBar', function () {
        return {
            'restrict': 'AE',
            'templateUrl': 'view/directives/barraNotificacoes.tmpl.html',
            controller: function ($document, $interval, $rootScope, NotificacoesService, ConfigService, ModalService, $state, $timeout, MensagensService, $cookies, $scope) {
                var controller = this;
                controller.linkClickFunction = function () {
                    var container = $document.find("#notificationContainer");
                    container.toggle();
                    container = null;
                };
                controller.documentClickFunction = function (obj) {
                    var container = $document.find("#notificationContainer");
                    container.hide();
                    container = null;
                };
                controller.countUnread = function (notificacoes) {
                    return notificacoes.filter(function (obj) {
                        return !obj.lida;
                    }).length;
                };
                controller.notificar = function () {
                    if (!controller.isMobile()) {
                        var quantidade = controller.countUnread(controller.notificacoes);
                        if (quantidade > 0 && (!$rootScope.ultimoAviso || moment().diff($rootScope.ultimoAviso, 'minutes') >= 3)) {
                            $rootScope.ultimoAviso = moment();
                            MensagensService.azul("Notificações não lidas", "Você possui " + quantidade + " notificações não lidas.");
                        }
                    }
                }
                controller.atualizar = function () {
                    if (ConfigService.loaded) {
                        $rootScope.blockSpin = true;
                        NotificacoesService.getNotificacoes().then(function (result) {
                            controller.notificacoes = result.data;
                            controller.notificar();
                            $rootScope.blockSpin = false;
                            $document.attr("title", "Seja Direto (" + controller.countUnread(result.data) + ") - " + ConfigService.loja.nome)
                        });
                    }
                };
                controller.marcarTodas = function () {
                    NotificacoesService.marcarTodas().then(function () {
                        controller.atualizar();
                    });
                };
                controller.notificationClick = function (notificacao) {
                    notificacao.lida = true;
                    NotificacoesService.marcarLida(notificacao.id);
                    if (notificacao.type == 'notificacaoLead') {
                        ModalService.showLeadModalById(notificacao.leadId.visualId);
                    } else if (notificacao.type == 'notificacaoPrelead') {
                        $timeout(function () {
                            $state.go('home.idleads');
                        });
                    }
                };
                if (!$rootScope.intervaloAtualizacaoNotificaoes) {
                    $rootScope.intervaloAtualizacaoNotificaoes = $interval(function () {
                        controller.atualizar();
                    }, 60000);
                }
                controller.atualizar();
                controller.linkClickFunction();

                controller.isMobile = function () {
                    return "ontouchstart" in window;
                }

                controller.isOnline = function () {
                    return window.navigator.onLine;
                };
                $scope.$watch(controller.isOnline, function (newV) {
                    if (!newV) {
                        MensagensService.vermelha("Conexão indisponível", "Não foi possivel conectar à internet, verifique sua conexão.");
                    }
                });


            },
            link: function (scope, element, atttributes) {
                element.on('click', function () {
                    $('.page-chatbar').removeClass('open');
                    $('#menuContainer').hide();
                });
                $(document).on('click', function (e) {
                    if ($(e.target).closest("#notificationContainer").length === 0 && $(e.target).closest(".bell-link").length === 0) {
                        $("#notificationContainer").hide();
                    }
                    if ($(e.target).closest(".page-chatbar").length === 0 && $(e.target).closest(".bell-link").length === 0) {
                        $(".page-chatbar").removeClass('open');
                    }
                });
            },
            controllerAs: 'controller'
        };
    });
})();