sap.ui.define([
    'com/nikitatrainings/controller/BaseController',
    'sap/ui/model/json/JSONModel',
    'sap/m/MessageBox',
    'sap/m/MessageToast',
    'sap/ui/core/BusyIndicator'
], function (BaseController, JSONModel, MessageBox, MessageToast, BusyIndicator) {
    'use strict';
    return BaseController.extend("com.nikitatrainings.controller.Add", {
        onInit: function () {
            this.oRouter = this.getOwnerComponent().getRouter();
            this.oRouter.getRoute("add").attachMatched(this.herculis, this);

            this.oLocalModel = new JSONModel();
            this.oLocalModel.setData({
                "prodData": {
                    "CATEGORY": "Notebooks",
                    "CURRENCY_CODE": "EUR",
                    "TYPE_CODE": "PR",
                    "DESCRIPTION": "",
                    "DIM_UNIT": "CM",
                    "MEASURE_UNIT": "EA",
                    "NAME": "",
                    "PRICE": "0.00",
                    "PRODUCT_ID": "",
                    "PRODUCT_PIC_URL": "/sap/public/bc/NWDEMO_MODEL/IMAGES/HT-4002.jpg",
                    "SUPPLIER_ID": "0100000051",
                    "SUPPLIER_NAME": "TECUM",
                    "TAX_TARIF_CODE": "1 "
                }
            });
            this.getView().setModel(this.oLocalModel, "prod");
        },
        herculis: function (oEvent) {

        },
        productId: "",
        onEnter: function (oEvent) {
            this.productId = oEvent.getParameter("value");

            var oDataModel = this.getView().getModel();

            var that = this;
            oDataModel.read("/ProductSet('" + this.productId + "')", {
                success: function (data) {
                    that.oLocalModel.setProperty("/prodData", data)
                    that.setMode("Update")
                },
                error: function (oError) {
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

        onDelete: function () {
            //    this.productId = this.oLocalModel.getProperty("/prodData/PRODUCT_ID");
            var oDataModel = this.getView().getModel();
            oDataModel.remove("/ProductSet('" + this.productId + "')", {
                //Step 5: get the response - success, error
                success: function (data) {
                    MessageToast.show("Delete success");
                    that.onClear();
                },
                error: function (oError) {
                    MessageBox.show("Not perfet now");
                }
            });
        },
        onSave: function () {
            BusyIndicator.show(0);
            //Step 1: Prepare payload
            var payload = this.oLocalModel.getProperty("/prodData");
            //Step 2: Pre-checks
            if (payload.PRODUCT_ID === "") {
                BusyIndicator.hide();
                MessageBox.error("Please enter a valid new product Id");
                return;
            }
            //Step 3: Get the odata model object
            var oDataModel = this.getView().getModel();
            //Step 4: post this data to backend

            if (this.mode === "Create") {
                if (this.checkOffline(this)) {
                    this.fillOfflineDb("ProductSet_" + payload.PRODUCT_ID, payload, "POST", 0);
                }
                if (navigator.connection.type !== 'none') {
                    this.syncChangesWithServer(oDataModel);
                }

            } else {
                oDataModel.update("/ProductSet('" + this.productId + "')", payload, {
                    //Step 5: get the response - success, error
                    success: function (data) {
                        BusyIndicator.hide();
                        MessageToast.show("Data updated successfully");
                    },
                    error: function (oError) {
                        BusyIndicator.hide();
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
                "CURRENCY_CODE": "EUR",
                "TYPE_CODE": "PR",
                "DESCRIPTION": "testing",
                "DIM_UNIT": "CM",
                "MEASURE_UNIT": "EA",
                "NAME": "New product",
                "PRICE": "0.00",
                "PRODUCT_ID": "HT-3232",
                "PRODUCT_PIC_URL": "/sap/public/bc/NWDEMO_MODEL/IMAGES/HT-4002.jpg",
                "SUPPLIER_ID": "0100000051",
                "SUPPLIER_NAME": "TECUM",
                "TAX_TARIF_CODE": "1 "
            });
        }
    });
});