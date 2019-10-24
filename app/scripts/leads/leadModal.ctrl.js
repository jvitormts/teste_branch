(function () {
  'use strict';

  angular.module('sejaDiretoApp').controller('LeadModalController', Controller);



  function Controller(RedeService, LeadsService, ConfigService, ProdutosService, EquipeService, MensagensService, ModalService, AnexosService, $sce, $scope, summernoteConfig, $mdDialog, LeadData, $window, $state, $timeout) {
    var ctrl = {};
    ctrl.summernoteConfig = summernoteConfig;
    //	
    ctrl.profile = ConfigService.profile;
    ctrl.midias = ConfigService.midias;
    ctrl.canais = ConfigService.canais;
    ctrl.loja = ConfigService.loja;
    ctrl.lead = LeadData ? LeadData.data : $scope.leadSelecionada;
    ctrl.etapas = ctrl.lead.usuarioId.equipeId ? ctrl.lead.usuarioId.equipeId.etapas : [];
    //registro de funções (seguir ess        ctrl.profile = ConfigService.profile;e padrão)

    ctrl.init = init;
    ctrl.editProduto = editProduto;
    ctrl.editCanal = editCanal;
    ctrl.editMidia = editMidia;
    ctrl.editCliente = editCliente;
    ctrl.editValor = editValor;
    ctrl.encerrarLeadComSucesso = encerrarLeadComSucesso;
    ctrl.cancelarLead = cancelarLead;
    ctrl.abrirModalCancelamento = abrirModalCancelamento;
    ctrl.abrirModalAvanco = abrirModalAvanco;
    ctrl.abrirModalReativar = abrirModalReativar;
    ctrl.avancarEtapaPara = avancarEtapaPara;
    ctrl.sanitizeMe = sanitizeMe;
    ctrl.abrirModalReativar = abrirModalReativar;
    ctrl.reativarLead = reativarLead;
    ctrl.validarAcessoFuncao = ConfigService.validarAcessoFuncao;
    ctrl.validarAcessoTela = ConfigService.validarAcessoTela;
    ctrl.abrirModalTransferencia = abrirModalTransferencia;
    ctrl.transferirLead = transferirLead;
    ctrl.excluirLead = excluirLead;
    ctrl.formataTel = formataTel;
    ctrl.textoProduto = ProdutosService.textoProduto;
    ctrl.buscarProdutos = buscarProdutos;
    ctrl.getAnexo = AnexosService.getAnexo;
    ctrl.encerrarComSucessoAnexo = encerrarComSucessoAnexo;
    ctrl.getTags = ConfigService.getTags;
    ctrl.editTags = editTags;
    ctrl.formOpen = false;
    ctrl.back = back;
    ctrl.editDadosLead = editDadosLead;
    ctrl.editProdutoValor = editProdutoValor;
    ctrl.getAnexo = getAnexo;
    ctrl.deleteAnexo = deleteAnexo;
    ctrl.inserirNota = inserirNota;
    ctrl.changeProduto = changeProduto;
    ctrl.validarAcessoTela = ConfigService.validarAcessoTela;
    //funcoes de rede 


    ctrl.abrirModalTransferenciaRede = abrirModalTransferenciaRede;
    ctrl.selecionarLoja = selecionarLoja;
    ctrl.encaminharLeadRede = encaminharLeadRede;
    ctrl.filtroTransferencia = filtroTransferencia;
    ctrl.openFab = false;
    ctrl.whatsappWebLauncher = whatsappWebLauncher;

    ctrl.init();


    return ctrl;

    function back() {
		try{
			
			  back();
		  }catch(e){
			$window.history.back();
		  }
    }

    function init(lead) {
		$(window).scrollTop(0);
      ModalService.currentScope = $scope;

      if (lead) {
        ctrl.lead = lead; // angular.copy(lead);
        LeadsService.refreshLeads();
      }
      ctrl.campos = angular.copy(ctrl.loja.campos);
      if (ctrl.lead.campos && ctrl.campos) {
        ctrl.campos.forEach(function (campo) {
          var valorCampo = ctrl.lead.campos.find(function (valor) {
            return valor.campo.id == campo.id;
          });

          if (valorCampo) {
            campo.valor = valorCampo.valor;
          }
        });
      }

      ctrl.anexos = {
        "recebidos": [],
        "enviados": []
      };

      ctrl.lead.interacaoList.forEach(function (interacao) {
        if (interacao.anexosList && interacao.anexosList.length > 0) {
          interacao.anexosList.forEach(function (anexo) {
            if (interacao.vendedorId) {
              ctrl.anexos.enviados.push(anexo);
            } else {
              ctrl.anexos.recebidos.push(anexo);
            }
          });
        }
      });
      var now = moment.utc();
      var leadDate = moment.utc(ctrl.lead.createdAt);
      ctrl.lead.diffDate = now.diff(leadDate, 'days');
      if (ctrl.lead.usuarioId && ctrl.profile.id == ctrl.lead.usuarioId.id) {
        LeadsService.marcarVisto(ctrl.lead.visualId);
      }
      if (ctrl.lead.clienteId) {
        ctrl.lead.clienteId.telefoneList = ctrl.lead.clienteId.telefoneList.length > 0 ? ctrl.lead.clienteId.telefoneList : [{}];
        ctrl.lead.clienteId.emailValidado = 'VALIDO';
      } else {
        ctrl.lead.clienteId = {
          telefoneList: [{}]
        };
      }
      ctrl.motivos = filterMotivos();
      delete ctrl.proximaEtapa;
      if (ctrl.lead.etapaFunilId.ordem == 0) {
        ctrl.proximaEtapa = ctrl.etapas.filter(function (obj) {
          return obj.ordem == 1;
        })[0];
      } else if (ctrl.lead.etapaFunilId.ordem > 0 && ctrl.lead.etapaFunilId.ordem + 1 < ctrl.etapas.length) {
        ctrl.proximaEtapa = ctrl.etapas.filter(function (obj) {
          return obj.ordem == ctrl.lead.etapaFunilId.ordem + 1;
        })[0];
        ctrl.etapaAnterior = ctrl.etapas.filter(function (obj) {
          return obj.ordem == ctrl.lead.etapaFunilId.ordem - 1;
        })[0];
      } else {
        ctrl.etapaAnterior = ctrl.etapas.filter(function (obj) {
          return obj.ordem == ctrl.lead.etapaFunilId.ordem - 1;
        })[0];
      }

    }


    function getAnexo(anexo) {
      AnexosService.getAnexo(anexo).then(function () {
        $state.reload();
      });
    }

    function deleteAnexo(anexo) {
      if (confirm("Deseja realmente excluir esse anexo? (Essa operação não poderá ser desfeita)")) {
        AnexosService.remove(anexo).then(function () {
          $state.reload();
        });
      }
    }

    function filtroTransferencia(usuariosList) {
      return usuariosList.filter(function(usuario){
        var tst = ctrl.validarAcessoTela("home.leads", usuario);
        if(tst){
          return usuario;
        }
      });
    }

    function editCanal() {
      return LeadsService.editCanal(ctrl.lead.visualId, ctrl.lead.canalId);
    }

    function editMidia() {
      return LeadsService.editMidia(ctrl.lead.visualId, ctrl.lead.midiaId);
    }

    function editProduto(produto) {
      LeadsService.editProduto(ctrl.lead.visualId, produto).then(function (result) {
        init(result.data);
      });
    }

    function editTags(tag) {
      LeadsService.editTags(ctrl.lead.visualId, ctrl.lead.tags).then(function (result) {
        init(result.data);
      });
    }



    function changeProduto(produto) {
      if (produto.type !== undefined && produto.type == 'imovel' && ctrl.loja.habilitaPreco) {
        ctrl.valor = produto.valorAluguel;
      }
    }


    function editValor(valor) {
      ctrl.lead.valor = valor;
      LeadsService.editValor(ctrl.lead.visualId, valor).then(function (result) {
        init(result.data);
      });
    }

    function editCliente() {
      var cliente = angular.copy(ctrl.lead.clienteId);
      if (!cliente.telefoneList[0].telefone) {
        cliente.telefoneList = [];
      }
      var campos = [];

      if (ctrl.campos && ctrl.campos.length > 0) {
        ctrl.campos.forEach(function (campo) {
          campos.push({
            campo: campo,
            valor: campo.valor
          });
        });
        LeadsService.editCamposPersonalizados(ctrl.lead.visualId, campos);

      }
      LeadsService.checkBlackList(cliente.email).then(function (response) {
        if (!response.data.id) {
          if (cliente.email) {
            cliente.emailValidado = 'VALIDO';
          }
          LeadsService.editCliente(ctrl.lead.visualId, cliente).then(function (response) {
            var objeto = response.data;
            if (objeto.resultado == 0) {
              init(objeto.lead);
            } else if (objeto.resultado == 1) {
              ctrl.submitDesabilitado = true;
              $mdDialog.show($mdDialog.alert().parent(angular.element(document.querySelector('#popupContainer'))).clickOutsideToClose(true).title('Lead reaberta').textContent(objeto.message).ariaLabel('Lead reaberta').ok('Continuar'));
			  LeadsService.refreshLeads();
			  back();
            } else if (objeto.resultado == 2) {
              $mdDialog.show($mdDialog.alert().parent(angular.element(document.querySelector('#popupContainer'))).clickOutsideToClose(true).title("Cliente já em atendimento").textContent(objeto.message).ariaLabel("Cliente já em atendimento").ok('Continuar'));
              LeadsService.refreshLeads();
              
			  back();
            } else if (objeto.resultado == 3) {
              $mdDialog.show($mdDialog.alert().parent(angular.element(document.querySelector('#popupContainer'))).clickOutsideToClose(true).title("Cliente já antendido").textContent(objeto.message).ariaLabel("Cliente já antendido").ok('Continuar'));
              LeadsService.refreshLeads();
              init(objeto.lead);
            }
          });
        } else {
          LeadsService.getLead(ctrl.lead.visualId).then(function (response) {
            ctrl.lead.clienteId.email = response.data.clienteId.email;
            $mdDialog.show($mdDialog.alert().parent(angular.element(document.querySelector('#popupContainer'))).clickOutsideToClose(true).title("Email inválido").textContent("Por favor, insira um email válido.").ariaLabel("Email inválido").ok('Continuar'));
          });
        }
      })
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

    function encerrarLeadComSucesso() {
      if (!ctrl.lead.midiaId) {
        MensagensService.roxa('Preenchimento de dados obrigatório', 'Para finalizar uma lead você deve preencher os dados de campanha da Lead.');
        return false;
      }
      if (!ctrl.lead.produtoList.length > 0 && !ctrl.loja.permitirFinalizarSemProduto) {
        MensagensService.roxa('Preenchimento de dados obrigatório', 'Para finalizar uma lead você deve preencher os dados de produto da Lead.');
        return false;
      }
      if (ctrl.loja.anexoObrigatorio) {
        ctrl.interacaoSucesso = {};
        ctrl.modalSucessoAnexo = ModalService.modalSucessoAnexo();
        return false;
      }
      if (!confirm("Venda concluída com sucesso?")) {
        return false;
      }
      LeadsService.encerramentoSucesso(ctrl.lead.visualId, {}).then(function (result) {
        init(result.data);
        MensagensService.verde('Parabéns pela venda.', 'Venda realizada com sucesso.');
        
			  back();
      });
    };

    function encerrarComSucessoAnexo() {
      if (ctrl.interacaoSucesso.uploading) {
        MensagensService.laranja("Efetuando upload de anexo", "Aguarde enquanto os anexos são carregados");
        return;
      }
      if (!ctrl.interacaoSucesso.anexosList || ctrl.interacaoSucesso.anexosList.length == 0) {
        MensagensService.vermelha("Anexo Obrigatório", ctrl.loja.textoAnexoObrigatorio);
        return;
      }
      LeadsService.encerramentoSucesso(ctrl.lead.visualId, ctrl.interacaoSucesso).then(function (result) {
        init(result.data);

        ctrl.modalSucessoAnexo.close();
        MensagensService.verde('Parabéns pela venda.', 'Venda realizada com sucesso.');
      });
    };

    function sanitizeMe(text) {
      return $sce.trustAsHtml(text);
    }

    function abrirModalCancelamento() {
      ctrl.blockCancel = false;
      ctrl.interacaoCancelamento = {
        indisponiveis: []
      };
      ctrl.modalCancelar = ModalService.modalCancelarLead();
    }

    function cancelarLead() {
      LeadsService.cancelarLead(ctrl.lead.visualId, ctrl.interacaoCancelamento).then(function (result) {
        $state.reload();
        ctrl.modalCancelar.close();
      });
    }

    function abrirModalAvanco() {
      var etapa = ctrl.etapas.find(function (obj) {
        return obj.ordem == ctrl.lead.etapaFunilId.ordem + 1;

      });
      ctrl.interacaoAvanco = {
        para: etapa
      };
      ctrl.blockAvanco = false;
      ctrl.modalAvanco = ModalService.modalAvancoEtapa();

    }

    function abrirModalReativar() {
      ctrl.modalReativar = ModalService.modalReativar();
    }

    function abrirModalTransferencia() {
      EquipeService.getEquipes().then(function (result) {
        ctrl.transferencia = {};
        ctrl.equipes = result.data.filter(function (obj) {
          return obj.usuariosList.length > 0;
        });
        ctrl.transferencia.etapa = ctrl.etapas.find(function (etapa) {
          return etapa.id == ctrl.lead.etapaFunilId.id;
        });
        ctrl.modalTransferencia = ModalService.modalTransferencia();
      });
    }

    function whatsappWebLauncher(tel) {
        var unformattedTel = tel.replace(/\D/g, '');
        if (unformattedTel && unformattedTel.length == 11) {
            return "55" + unformattedTel;
        }
    }

    function avancarEtapaPara() {
      ctrl.blockAvanco = true;
      LeadsService.avancarEtapaPara(ctrl.lead.visualId, ctrl.interacaoAvanco).then(function (result) {
        if (ctrl.modalAvanco) {
          init(result.data);
          ctrl.modalAvanco.close();
        } else {
          LeadsService.refreshLeads();
          
			  back();
        }
      });
    }

    function reativarLead() {
      LeadsService.reativarLead(ctrl.lead.visualId, ctrl.interacaoReativacao).then(function (result) {
        init(result.data);
        ctrl.modalReativar.close();
        if (ctrl.lead.usuarioId.id == ctrl.profile.id) {
          LeadsService.refreshLeads();
          if (LeadsService.funcaoRefresh) {
            LeadsService.funcaoRefresh();
          }
        }

      });
    }

    function transferirLead() {
      LeadsService.transferirLead(ctrl.lead.visualId, ctrl.transferencia).then(function (result) {
        init(result.data);
        ctrl.modalTransferencia.close();
        LeadsService.refreshLeads();
      });
    }


    function excluirLead() {
      if (confirm("Deseja excluir a lead permanentemente?")) {
        LeadsService.excluirLead(ctrl.lead.visualId).then(function () {
          LeadsService.refreshLeads();
          
			  back();
        });
      }
    }

    function formataTel(tel) {
      if (tel) {
        var value = tel.replace(/\D/g, '');
        var mascara9D = new StringMask('(00) 00000-0000');
        var mascara8D = new StringMask('(00) 0000-0000');
        var mascara9DSemDDD = new StringMask('00000-0000');
        var mascara8DSemDDD = new StringMask('0000-0000');
        if (value && value.length == 11) {
          return mascara9D.apply(value);
        } else if (value && value.length == 10) {
          return mascara8D.apply(value);
        } else if (value && value.length == 9) {
          return mascara9DSemDDD.apply(value);
        } else if (value && value.length == 8) {
          return mascara8DSemDDD.apply(value);
        } else {
          return "";
        }
      }
    }

    //Funcoes de REDE

    function abrirModalTransferenciaRede() {
      ctrl.lojas = ConfigService.rede;
      ctrl.modalTransferencia = ModalService.modalTransferenciaRede();
    }

    function selecionarLoja(loja) {
      RedeService.getEquipesLoja(loja.id).then(function (result) {
        ctrl.equipesLoja = result.data;
      });
    }


    function encaminharLeadRede() {

      var lead = angular.copy(ctrl.lead);

      ctrl.transferencia.lead = lead;

      LeadsService.encaminharLead(lead.visualId, ctrl.transferencia).then(function (result) {
        init(result.data);
        LeadsService.refreshLeads();
        ctrl.modalTransferencia.close();
      });
    }

    function buscarProdutos(searchText) {
      if (searchText && searchText.length >= 1) {
        return ProdutosService.getProdutosFiltrados({
          texto: searchText,
          disponivel: true
        }).then(function (result) {
          ctrl.produtos = result.data.lista;
          ctrl.produtos.forEach(function (element) {
            element.texto = ProdutosService.textoProduto(element);
          }, this);
          return ctrl.produtos;
        });
      } else if (!ctrl.produtos && ctrl.lead.produtoList) {
        ctrl.produtos = ctrl.lead.produtoList;
        ctrl.produtos.forEach(function (element) {
          element.texto = ProdutosService.textoProduto(element);
        }, this);
        return ctrl.produtos;
      }
    }

    function editProdutoValor(selectedProduto, valor) {
      editProduto(selectedProduto);
      editValor(valor);
    }

    function editDadosLead() {
		editMidia().then(function(result){
			editCanal().then(function(){
				init(result.data);		
			})
		});
    }

    function inserirNota() {
      LeadsService.inserirNota(ctrl.lead.visualId, { texto: ctrl.textoNota }).then(function (result) {
        init(result.data);
        delete ctrl.textoNota;
      })
    }
  }
})();
