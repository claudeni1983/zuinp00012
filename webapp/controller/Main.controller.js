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

                let source1 = "/sap/opu/odata/sap/ZNP_GW_PNR_SRV/TermSet(Uname='1',Tform='1')/$value?";
                let source2 = "/sap/opu/odata/sap/ZNP_GW_PNR_SRV/TermSet(Uname='1',Tform='2')/$value?";

                this._oModel = new JSONModel({
                    Source1: source1,            //this._sValidPath,
                    Source2: source2,
                    Title1: "My Title 1",
                    Title2: "My Title 2",
                    Height: "600px",
                    Term: {}
                });
                this.getView().setModel(this._oModel);

                const oDeviceModel = new JSONModel(Device);
                oDeviceModel.setDefaultBindingMode("OneWay");
                this.getView().setModel(oDeviceModel, "device");

                var oMessageManager = sap.ui.getCore().getMessageManager();
                this.getView().setModel(oMessageManager.getMessageModel(), "message");
                oMessageManager.registerObject(this.getView(), true);

                this._initPdfViewer();

                this._initTerm();

            },

            _saveSuccessAccept: function (oData){
                const oI18n = this.getOwnerComponent().getModel("i18n").getResourceBundle();
                sap.m.MessageBox.success(oI18n.getText("saveSuccessAccept"));
                this._initTerm();
            },

            _saveSuccessNotAccept: function (oData){
                const oI18n = this.getOwnerComponent().getModel("i18n").getResourceBundle();
                sap.m.MessageBox.success(oI18n.getText("saveSuccessNotAccept"));
                this._initTerm();
            },

            _saveErrorAccept: function (oData){
                this._saveError(oData, "idAceitoButton");
            },

            _saveErrorNotAccept: function (oData){
                this._saveError(oData, "idNoAceitoButton");
            },

            _saveError: function (oData, sId){

                var oMessageManager = sap.ui.getCore().getMessageManager();
                var aMessages = oMessageManager.getMessageModel().getData();
                let sMessage = "";

                oMessageManager.removeAllMessages();

                if (oData.response.body !== undefined){
                    let objMsg = JSON.parse(oData.response.body);
                    sMessage = objMsg.error.message.value !== undefined ? objMsg.error.message.value : "";
                }

                if (sMessage == "" && oData.message !== undefined){
                    sMessage = oData.message;
                }

                oMessageManager.addMessages([new sap.ui.core.message.Message({
                    message: sMessage,
                    type: "Error"
                })])

                var oButton = this.getView().byId(sId);
                this._openMessagePopover(oButton);

            },

            _openMessagePopover: function(oButton) {

                if(!this._pMessagePopover){
                    this._pMessagePopover = sap.ui.xmlfragment("zuinp00012.view.Messages",this);
                    this.getView().addDependent(this._pMessagePopover);
                }
                this._pMessagePopover.openBy(oButton);

            },

            onAceitoButtonPress: function() {

                const oI18n = this.getOwnerComponent().getModel("i18n").getResourceBundle();

                sap.m.MessageBox.confirm(

                    oI18n.getText("confirmAccept"),

                    function (oAction){

                        if (oAction != sap.m.MessageBox.Action.OK)
                            return;

                        let sService = "/sap/opu/odata/sap/ZNP_GW_PNR_SRV";
                        let oDataModelTerm = new sap.ui.model.odata.ODataModel(sService, true);
                        let oJsonModelTerm = this.getView().getModel();
                        let dJsonModelTerm = oJsonModelTerm.getData();

                        dJsonModelTerm.Term.Accept = 'Y';

                        oDataModelTerm.create("/TermSignSet", dJsonModelTerm.Term, {
                            success: this._saveSuccessAccept.bind(this),
                            error: this._saveErrorAccept.bind(this)
                        });

                    }.bind(this)

                );

            },

            onNoAceitoButtonPress: function() {

                const oI18n = this.getOwnerComponent().getModel("i18n").getResourceBundle();

                sap.m.MessageBox.confirm(

                    oI18n.getText("confirmNotAccept"),

                    function (oAction){

                        if (oAction != sap.m.MessageBox.Action.OK)
                            return;

                        let sService = "/sap/opu/odata/sap/ZNP_GW_PNR_SRV";
                        let oDataModelTerm = new sap.ui.model.odata.ODataModel(sService, true);
                        let oJsonModelTerm = this.getView().getModel();
                        let dJsonModelTerm = oJsonModelTerm.getData();

                        dJsonModelTerm.Term.Accept = 'N';

                        oDataModelTerm.create("/TermSignSet", dJsonModelTerm.Term, {
                            success: this._saveSuccessNotAccept.bind(this),
                            error: this._saveErrorNotAccept.bind(this)
                        });

                    }.bind(this)

                );

            },

            _getURI: function (uriSource){
                return uriSource;
            },

            onPrincpiosDeNegcioResponsvelButtonPress: function(){

                let source1 = "/sap/opu/odata/sap/ZNP_GW_PNR_SRV/TermSet(Uname='1',Tform='1')/$value?";

                this._pdfViewer.setSource(this._getURI(source1));
                this._pdfViewer.open();

            },

            onTermosDeAceiteDaTelefnicaButtonPress: function(){

                let source2 = "/sap/opu/odata/sap/ZNP_GW_PNR_SRV/TermSet(Uname='1',Tform='2')/$value?";

                this._pdfViewer.setSource(this._getURI(source2));
                this._pdfViewer.open();

            },

            _initPdfViewer: function(){

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

            },

            _getTermSignFilters: function(){

                let la_filter = new Array();

                let pernrFilter = new sap.ui.model.Filter({
                    path : "Pernr",
                    operator : sap.ui.model.FilterOperator.EQ,
                    value1 : "00000000"
                });

                la_filter.push(pernrFilter);

                let yearFilter = new sap.ui.model.Filter({
                    path : "Year",
                    operator : sap.ui.model.FilterOperator.EQ,
                    value1 : "0000"
                });

                la_filter.push(yearFilter);

                return la_filter;

            },

            _fillTermSign: function(oData){

                var oTermSign = this.getView().getModel();
                var dTermSign = oTermSign.getData();

                for (let i = 0; i < oData.results.length; i++){
                    dTermSign.Term = oData.results[i];
                }

//                dTermSign.Term = oData;
                let oDataJ = {};
                oDataJ = dTermSign;
                oTermSign.setData(oDataJ);

                this.getView().setModel(oTermSign);

            },

            _initTerm: function(){

                let sService = "/sap/opu/odata/sap/ZNP_GW_PNR_SRV";
                var oDataTerm = new sap.ui.model.odata.ODataModel(sService, true);
                let sFilter = this._getTermSignFilters();

                oDataTerm.read("/TermSignSet?$format=json", {
//                oDataTerm.read("/TermSignSet(Pernr='00000000',Year='0000')", {

                    filters: sFilter,

                    success: function _onReadTermSignSetOk (oData, response){
                        this._fillTermSign(oData);
                    }.bind(this),

                    error: function _onReadTermSignError (oError){
                        console.log(oError);
                    }

                });

            }

        });
    });
