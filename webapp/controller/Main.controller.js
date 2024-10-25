sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/Device"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, JSONModel, Device) {
        "use strict";

        return Controller.extend("zuinp00012.controller.Main", {
            onInit: function () {

                this._sValidPath = sap.ui.require.toUrl("zuinp00012/sap/opu/odata/sap/ZNP_GW_PNR_SRV/TermSet(Uname='1',Tform='1')/$value?");
                this._sInvalidPath = sap.ui.require.toUrl("zuinp00012/sample_nonexisting.pdf");

                let source1 = sap.ui.require.toUrl("zuinp00012/sap/opu/odata/sap/ZNP_GW_PNR_SRV/TermSet(Uname='1',Tform='1')/$value?");
                let source2 = sap.ui.require.toUrl("zuinp00012/sap/opu/odata/sap/ZNP_GW_PNR_SRV/TermSet(Uname='1',Tform='2')/$value?");

                this._oModel = new JSONModel({
                    Source1: source1,            //this._sValidPath,
                    Source2: source2,
                    Title1: "My Title 1",
                    Title2: "My Title 2",
                    Height: "600px"
                });
                this.getView().setModel(this._oModel);

                const oDeviceModel = new JSONModel(Device);
                oDeviceModel.setDefaultBindingMode("OneWay");
                this.getView().setModel(oDeviceModel, "device");

                this.initPdfViewer();

            },

            onAceitoButtonPress: function() {
                this._oModel.setProperty("/Source", this._sValidPath);
            },

            onNoAceitoButtonPress: function() {
                this._oModel.setProperty("/Source", this._sInvalidPath);
            },

            onPrincpiosDeNegcioResponsvelButtonPress: function(){

                let source1 = sap.ui.require.toUrl("zuinp00012/sap/opu/odata/sap/ZNP_GW_PNR_SRV/TermSet(Uname='1',Tform='1')/$value?");

                this._pdfViewer.setSource(source1);
                this._pdfViewer.open();

            },

            onTermosDeAceiteDaTelefnicaButtonPress: function(){

                let source2 = sap.ui.require.toUrl("zuinp00012/sap/opu/odata/sap/ZNP_GW_PNR_SRV/TermSet(Uname='1',Tform='2')/$value?");

                this._pdfViewer.setSource(source2);
                this._pdfViewer.open();

            },

            initPdfViewer: function(){

                const oI18n = this.getOwnerComponent().getModel("i18n").getResourceBundle();

                this._pdfViewer = new sap.m.PDFViewer({
                    title: oI18n.getText("pdfTitle"),
                    errorPlaceholderMessage: oI18n.getText("pdfError"),
                    showDownloadButton: false
                });

                this._pdfViewer.attachSourceValidationFailed(function (oEvent){
                    oEvent.preventDefault();
                }.bind(this));

                this.getView().addDependent(this._pdfViewer);

            }

        });
    });
