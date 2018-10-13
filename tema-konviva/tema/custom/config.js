require(["aprendizagem/services/AprendizagemService"],function() {  });

define(['portal/PortalModule','security/SecurityModule', 'shared/css/csslib', 'ferramentas/services/FerramentasService'], function(app, csslib)
{

    app.controller('ControllerTema', [
        '$scope',
        '$document',
        '$state',
        '$stateParams',
        '$modal',
        '$q',
        '$sce',
        '$rootScope',
        '$timeout',
        '$window',
        '$interval',
        '$location',
        '$anchorScroll',
        '$filter',
        'AuthService',
        'AuthStateService',
        'PilulaHistoricoService',
        'gettextCatalog',
        'promiseTracker',
        '$injector',
        '$modal',
        function($scope, $document, $state, $stateParams, $modal, $q, $sce, $rootScope, $timeout, $window,
                 $interval, $location, $anchorScroll, $filter, AuthService, AuthStateService, PilulaHistoricoService, gettextCatalog, promiseTracker , $injector, $modal) {



            $scope.bibliotecaTracker = promiseTracker('bibliotecaTracker');

            $scope.publicacaoBibliotecaGeral = null;

            require(["ferramentas/services/BibliotecaService",
                "biblioteca/services/BibliotecaLmsService"], function() {

                $injector.invoke(  [ 'BibliotecaService','BibliotecaLmsService', function (BibliotecaService,BibliotecaLmsService) {

                    var biblioteca = BibliotecaLmsService.getBibliotecaPadrao();
                    $scope.bibliotecaTracker.addPromise(biblioteca);

                    biblioteca.then(function(result) {
                        if (result) {
                            $scope.idComunidade = result.id;
                            $scope.idBiblioteca = result.idBiblioteca;
                            $scope.comunidadeInfo = result;
                            //var promisePublicacoes = BibliotecaService.getPublicacoesBiblioteca($scope.idBiblioteca,0,3);
                            var promisePublicacoes = BibliotecaService.getPublicacoesCategoria($scope.idBiblioteca,0,0,4,{});;
                            $scope.bibliotecaTracker.addPromise(promisePublicacoes);
                            promisePublicacoes.then(function(result) {
                                if(angular.isArray(result) && result.length>0)
                                    $scope.publicacaoBibliotecaGeralList = result;
                            });
                        }
                    });


                } ]);

            });
            $scope.getImagemPublicacao = function(publicacao){
                if(publicacao.idFileThumbnail){
                    return $sce.trustAsResourceUrl(restPrefix+"/action/rest/base/foto/storage?idFile="+publicacao.idFileThumbnail+"&w=342&h=208&c=60");
                }else{
                    var imagem = "";
                    switch (publicacao.tipoPublicacao) {
                        case "LINK":
                            imagem = "web";
                            break;
                        case "IMAGE":
                            imagem = "image";
                            break;
                        case "PDF":
                            imagem = "pdf";
                            break;
                        case "VIDEO":
                            imagem = "video";
                            break;
                        case "FILE":
                            imagem = "file";
                            break;
                        case "REFERENCE":
                            imagem = "reference";
                            break;
                        default:
                            imagem = "file";
                            break;
                    }
                    return $sce.trustAsResourceUrl("img/biblioteca/biblioteca-"+imagem+".png");
                }
            };

          $scope.getIconeBiblioteca = function(publicacao) {
            var icone = 'fa-book';
            switch (publicacao.tipoPublicacao) {
              case "AUDIO":
                icone = 'fa-music';
                break;
              case "VIDEO":
                icone = 'fa-film';
                break;
              case "REFERENCE":
                icone = 'fa-file-archive-o';
                break;
              case "IMAGE":
                icone = 'fa-image';
                break;
              case "LINK":
                icone = 'fa-link';
                break;

              case "PDF":
                icone = 'fa-file-pdf-o';
                break;

              case "FILE":
                icone = 'fa-file-text-o';
                break;
              default:
                icone = 'fa-book';
                break;
            }
            return icone;
          }


            /*Modal Versão do Tema 1.5*/
            $scope.isSuporte = AuthStateService.isSuporte();

            $scope.openModalVersaoTema = function() {
                $scope.modalInstance = $modal.open(
                    {
                        templateUrl: "versao/versaoTema_modal.tpl.html",
                        scope: $scope
                    }
                );
            }

            $scope.closeModalVersaoTema = function() {
                $scope.modalInstance.close();
            };

            var isDebug = false;
            var DEBUG = function( msg ) {
                if( isDebug ) console.log( msg );
            };



        } ]);

    app.controller('PilulaPortalCustomController', [
        '$scope',
        '$document',
        '$state',
        '$stateParams',
        '$modal',
        '$q',
        '$sce',
        '$rootScope',
        '$timeout',
        '$window',
        '$interval',
        '$location',
        '$anchorScroll',
        '$filter',
        'AuthService',
        'AuthStateService',
        'PilulaHistoricoService',
        'gettextCatalog',
        'promiseTracker',

        function($scope, $document, $state, $stateParams, $modal, $q, $sce, $rootScope, $timeout, $window,
                 $interval, $location, $anchorScroll, $filter, AuthService, AuthStateService, PilulaHistoricoService, gettextCatalog, promiseTracker)
        {
            var isDebug = false;
            var DEBUG = function( msg ) {
                if( isDebug ) console.log( msg );
            };

            $scope.tracker = promiseTracker();
            var filtroDefault =  {"idPilula":null,"idUsuario":null,"idPublicacao":null,"nome":"","obrigatoriedadeVencida":null};

            $scope.pilulas = [];

            $scope.buscar = function (){
                var pilulas = PilulaHistoricoService.getMinhasPilulasList(0,3,filtroDefault);
                $scope.tracker.addPromise(pilulas);
                pilulas.then(function(data) {
                    if (data && data.length > 0) {

                        for(var i = 0 ; i < data.length; i++) {
                            var pilula = data[i];
                            if( pilula.dataAcesso ) {
                                pilula.situacao = gettextCatalog.getString("Iniciada");
                            } else {
                                pilula.situacao = gettextCatalog.getString("Não Iniciada");
                            }
                            console.log(pilula);
                            $scope.pilulas.push(pilula);
                        }

                        DEBUG($scope.pilulas);
                    }
                });
            };

            $scope.playPilula = function(idPilula) {
                $state.go("pilula.playerconteudo", {'idPilula': idPilula, 'itemIndex': "0", 'isPreview' : "0"});
            };

            $scope.playPilulaObrigatoria = function(idPilula) {
                if( !PilulaHistoricoService.getVerificacaoObrigatoriedadeExecutada() ) {
                    $scope.playPilula(idPilula);
                }
            };

            $scope.getUrlDownload = function (fileId) {
                return $sce.trustAsResourceUrl(restPrefix + "action/base/download/" + fileId);
            };

            $scope.buscar();
        }
    ]);
});