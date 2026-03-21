sap.ui.define([
    'com/nikitatrainings/controller/BaseController',
    'sap/ui/model/json/JSONModel',
    'sap/m/MessageBox',
    'sap/m/MessageToast'
], function (BaseController, JSONModel, MessageBox, MessageToast) {
    'use strict';
    return BaseController.extend("com.nikitatrainings.controller.Add", {
        onInit: function () {
            this.oRouter = this.getOwnerComponent().getRouter();
            this.oRouter.getRoute("add").attachMatched(this.herculis, this);

            this.oLocalModel = new JSONModel();
            this.oLocalModel.setData({
                "prodData": {
                    "PRODUCT_ID": "",
                    "CATEGORY": "Notebooks",
                    "TYPE_CODE" : "PR",
                    "NAME": "",
                    "DESCRIPTION": "",
                    "SUPPLIER_ID": "0100000051",
                    "SUPPLIER_NAME": "TECUM",
                    "TAX_TARIF_CODE": "1 ",
                    "MEASURE_UNIT": "EA",
                    "PRICE": "0.00",
                    "CURRENCY_CODE": "EUR",
                    "DIM_UNIT": "CM",
                    "PRODUCT_PIC_URL": "/sap/public/bc/NWDEMO_MODEL/IMAGES/NV-2022.jpg"
                }
            });
            this.getView().setModel(this.oLocalModel, "prod");
        },
        herculis: function (oEvent) {

        },
         productId: "",
        onEnter: function (oEvent) {
          this.productId =  oEvent.getParameter("value");

          var oDataModel = this.getView().getModel();

          var that =this;
          oDataModel.read("/ProductSet('"+this.productId+"')",{
            success:function(data){
               that.oLocalModel.setProperty("/prodData", data)
               that.setMode("Update")
            },
            error:function(oError){
                MessageBox.show("Not Found");
                that.setMode("Create");
            }
          })
        },
        mode: "Create",
        setMode: function (sMode) {
            this.mode = sMode;
            if (this.mode === "Create") {
                this.getView().byId("idSave").setText("Save");
                this.getView().byId("idDelete").setEnabled(false);

                this.getView().byId("prodId").setEnabled(true);
            } else {
                this.getView().byId("idSave").setText("Update");
                  this.getView().byId("prodId").setEnabled(false);
                                  this.getView().byId("idDelete").setEnabled(true);

            }
        },

        onDelete:function(){
            //    this.productId = this.oLocalModel.getProperty("/prodData/PRODUCT_ID");
            var oDataModel = this.getView().getModel();
            oDataModel.remove("/ProductSet('"+this.productId+"')",{
                //Step 5: get the response - success, error
                success: function (data) {
                    MessageToast.show("Delete success");
                    that .onClear();
                },
                error: function (oError) {
                    MessageBox.show("Not perfet now");
                }
            });
        },
        onSave: function () {
            //Step 1: Prepare payload
            var payload = this.oLocalModel.getProperty("/prodData");
            //Step 2: Pre-checks
            if (payload.PRODUCT_ID === "") {
                MessageBox.error("Please enter a valid new product Id");
                return;
            }
            //Step 3: Get the odata model object
            var oDataModel = this.getView().getModel();
            //Step 4: post this data to backend

            if(this.mode === "Create"){
               oDataModel.create("/ProductSet", payload, {
                //Step 5: get the response - success, error
                success: function (data) {
                    MessageToast.show("Congratulations! The data has been posted to SAP");
                },
                error: function (oError) {
                    debugger;
                }
            });
            }else{
               oDataModel.update("/ProductSet('"+this.productId+"')", payload, {
                //Step 5: get the response - success, error
                success: function (data) {
                    MessageToast.show("Data updated successfully");
                },
                error: function (oError) {
                    MessageBox.show("Not fully good now")
                }
            });
            }
            
        },
        onClear: function () {
            this.setMode("Create"); 
            this.oLocalModel.setProperty("/prodData", {
                "PRODUCT_ID": "",
                "CATEGORY": "Notebooks",
                "NAME": "",
                "DESCRIPTION": "",
                "SUPPLIER_ID": "0100000051",
                "SUPPLIER_NAME": "TECUM",
                "TAX_TARIF_CODE": "1",
                "MEASURE_UNIT": "EA",
                "PRICE": "0.00",
                "CURRENCY_CODE": "EUR",
                "DIM_UNIT": "CM",
                "PRODUCT_PIC_URL": "/sap/public/bc/NWDEMO_MODEL/IMAGES/NV-2022.jpg"
            });
        }
    });
});