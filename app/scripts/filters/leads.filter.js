(function() {
	'use strict';
	angular.module('sejaDiretoApp').filter('leadFilter', function() {
		return function(input, searchText) {
			if (!searchText) {
				return input;
			}
			return input.filter(function(obj) {
				if(obj.lead){
					obj = obj.lead;
				}
				var text = searchText.toLowerCase();
				var validate = 0;
				angular.forEach(obj,function(item){
					if(validate === 0 && typeof item == "string" && item.toLowerCase().indexOf(text) >= 0 ){
						validate ++;
					}
				});
				return validate > 0;
			}, searchText);
		};
	}).filter('leadFilterStatus', function() {
		return function(input, status) {
			if (!status) {
				return input;
			}
			return input.filter(function(obj) {
				switch (status) {
					case "late":
						return obj.timeDiff < 0;
						break;
					case "visit":
						return obj.visitaHoje;
						break;
					case "mail":
						return obj.emailNaoLido;
						break;
					case "comment":
						return obj.comentarioNaoLido;
						break;
					case "postponed":
						return obj.situacao == 'ADIADA';
						break;
				}
			}, status);
		};
	}).filter('filtroListaClientes', function() {
		return function(input, searchText) {
			if (!searchText) {
				return input;
			}
			return input.filter(function(obj) {

				var text = searchText.toLowerCase();
				var nome = obj.titulo.toLowerCase().indexOf(text) >= 0;
				var email = obj.clienteId && obj.clienteId.email ? obj.clienteId.email.toLowerCase().indexOf(text) >= 0 : false;
				var telefone = false;
				if (obj.clienteId && obj.clienteId.telefoneList.length>0) {
					obj.clienteId.telefoneList.forEach(function(item){
						if(item.telefone.indexOf(text) >= 0){
							telefone = true;
						}
					});
				}
				return (nome || email || telefone);
			}, searchText);
		};
	}).filter('filtroTipoVeiculo', function() {
		return function(input, searchText) {
			if (!searchText) {
				return input;
			}
			return input.filter(function(obj) {
				if(obj.lead){
					obj = obj.lead;
				}
				var retorno = false;
				if(obj.produtoList.length > 0 ){
					obj.produtoList.forEach(function(produto){
						if(produto.condicao == searchText)
							retorno = true;
					});
				}
				return retorno;
			}, searchText);
		};
	}).filter('filtroListaAcompanhamento', function() {
		return function(input, searchText) {
			if (!searchText) {
				return input;
			}
			return input.filter(function(obj) {
				var text = searchText.toLowerCase();
				var nome = obj.lead.titulo.toLowerCase().indexOf(text) >= 0;
				var email = obj.lead.clienteId && obj.lead.clienteId.email ? obj.lead.clienteId.email.toLowerCase().indexOf(text) >= 0 : false;
				var telefone = false;
				if (obj.lead.clienteId && obj.lead.clienteId.telefoneList.length>0) {
					obj.lead.clienteId.telefoneList.forEach(function(item){
						if(item.telefone.indexOf(text) >= 0){
							telefone = true;
						}
					});
				}
				var produto = false;
				if (obj.lead.produtoList.length>0) {
					var textoProduto = obj.lead.produtoList[0].fabricante + ' ' + obj.lead.produtoList[0].modelo;
					if(obj.lead.produtoList[0].placa){
						textoProduto += ' ' + obj.lead.produtoList[0].placa
					}
					produto = textoProduto.toLowerCase().indexOf(text)>=0;
				}
				return (nome || email || telefone || produto);
			}, searchText);
		};
	}).filter('filtroListaEncerradas', function() {
		return function(input, searchText) {
			if (!searchText) {
				return input;
			}
			return input.filter(function(obj) {
				var text = searchText.toLowerCase();
				var nome = obj.titulo.toLowerCase().indexOf(text) >= 0;
				var email = obj.clienteId && obj.clienteId.email ? obj.clienteId.email.toLowerCase().indexOf(text) >= 0 : false;
				var telefone = false;
				if (obj.clienteId && obj.clienteId.telefoneList.length>0) {
					obj.clienteId.telefoneList.forEach(function(item){
						if(item.telefone.indexOf(text) >= 0){
							telefone = true;
						}
					});
				}
				var produto = false;
				if (obj.produtoList.length>0) {
					var textoProduto = obj.produtoList[0].fabricante + ' ' + obj.produtoList[0].modelo;
					if(obj.produtoList[0].placa){
						textoProduto += ' ' + obj.produtoList[0].placa
					}
					produto = textoProduto.toLowerCase().indexOf(text)>=0;
				}
				return (nome || email || telefone || produto);
			}, searchText);
		};
	}).filter('htmlToPlaintext', function() {
	  return function(text) {
		return angular.element("<p>"+text+"</p>").text();
	  }
	})
	.filter('filtroTags', function() {
		return function(input, tags) {
			if (!tags || tags.length==0) {
				return input;
			}
			return input.filter(function(lead) {
				var tagCount=0;
				tags.forEach(function(filterTag){
					if(lead.tags && lead.tags.indexOf(filterTag.tag) >=0 ){
						tagCount++;
					}
				});
				return tagCount>0;
			}, tags);
		};
	});
})();