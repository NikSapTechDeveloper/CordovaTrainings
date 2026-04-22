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

        },
        generateId: function () {
            const getRandomLetters = (length) => {
                const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
                let result = '';
                for (let i = 0; i < length; i++) {
                    result += chars.charAt(Math.floor(Math.random() * chars.length));
                }
                return result;
            };

            const getRandomNumber = (length) => {
                let min = Math.pow(10, length - 1);
                let max = Math.pow(10, length) - 1;
                return Math.floor(Math.random() * (max - min + 1)) + min;
            };

            const prefix = getRandomLetters(2);   // e.g. HT
            const middle = getRandomLetters(1);   // e.g. E
            const number = getRandomNumber(3);    // e.g. 456

            return `${prefix}-${middle}${number}`;
        },
        herculis: function (oEvent) {
            this.oLocalModel = new JSONModel();

            let sProductId = this.generateId();
            this.oLocalModel.setData({
                "prodData": {
                    "Category": "Notebooks",
                    "CurrencyCode": "EUR",
                    "TypeCode": "PR",
                    "Description": "",
                    "DimUnit": "CM",
                    "MeasureUnit": "EA",
                    "Name": "",
                    "Price": "0.00",
                    "ProductId": sProductId,
                    "ProductPicUrl": "/sap/public/bc/NWDEMO_MODEL/IMAGES/HT-4002.jpg",
                    "SupplierId": "0100000051",
                    "SupplierName": "TECUM",
                    "TaxTarifCode": "1 "
                }
            });
            this.getView().setModel(this.oLocalModel, "prod");
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
            //    this.productId = this.oLocalModel.getProperty("/prodData/ProductId");
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
            if (payload.ProductId === "") {
                BusyIndicator.hide();
                MessageBox.error("Please enter a valid new product Id");
                return;
            }
            //Step 3: Get the odata model object
            var oDataModel = this.getView().getModel();
            //Step 4: post this data to backend

            if (this.mode === "Create") {
                if (navigator.connection.type !== 'none') {
                    this.syncChangesWithServerOnline(oDataModel, payload);
                } else {
                    this.fillOfflineDb("ProductSet_" + payload.ProductId, payload, "POST", 0);
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
                "ProductId": "",
                "CATEGORY": "Notebooks",
                "CURRENCY_CODE": "EUR",
                "TYPE_CODE": "PR",
                "DESCRIPTION": "testing",
                "DIM_UNIT": "CM",
                "MEASURE_UNIT": "EA",
                "NAME": "New product",
                "PRICE": "0.00",
                "ProductId": "HT-3232",
                "PRODUCT_PIC_URL": "/sap/public/bc/NWDEMO_MODEL/IMAGES/HT-4002.jpg",
                "SUPPLIER_ID": "0100000051",
                "SUPPLIER_NAME": "TECUM",
                "TAX_TARIF_CODE": "1 "
            });
        }
    });
});