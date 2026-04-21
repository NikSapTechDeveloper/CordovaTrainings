sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "com/nikitatrainings/offline/reusedbapi",
    'sap/ui/core/BusyIndicator',
    'sap/m/MessageBox',
    'sap/m/MessageToast',
],
    function (Controller, reusedbapi, BusyIndicator, MessageBox, MessageToast) {
        return Controller.extend("com.nikitatrainings.controller.BaseController", {

            onNavBack: function () {
                this.getOwnerComponent().getRouter().navTo("master", {}, true);
                let oSplitApp = this.getView().getParent().getParent();
                let oMasterApp = oSplitApp.getMasterPages()[0];
                oSplitApp.toMaster(oMasterApp, "flip");
            },
            checkOffline: function (oController) {
                // this.getOwnerComponent().getModel('local').getProperty("/offlineApp");
                // If oController is passed, use it. Otherwise, use 'this'.
                let oCurrentContext = oController || this;
                let oModel = oCurrentContext.getOwnerComponent().getModel('local');
                if (oModel) {
                    // Return the actual value (true/false) to the caller
                    return oModel.getProperty("/offlineApp");
                }

                return false;
            },
            syncChangesWithServerOnline: function (oDataModel, payload) {
                 var that = this;
                //Step 3 = Trigger Post Request, Once POst is done, upsert our local DB
                oDataModel.create("/ProductSet", payload, {
                    //Step 5: get the response - success, error
                    success: function (data) {
                        BusyIndicator.hide();
                        // MessageToast.show("Congratulations! The data has been posted to SAP");
                        reusedbapi.upsert("OFFLINE_STORE_NEW", {
                            OPERATION: "POST",
                            ENTITYSET: "ProductSet_" + data.PRODUCT_ID,
                            DATA: JSON.stringify(data),
                            // TIMESTAMP: Math.floor(Date.now() / 1000),
                            SYNCTIME: Math.floor(Date.now() / 1000),
                            SYNCED: 1
                        }, ["OPERATION", "ENTITYSET"]).then(function (result) {
                            BusyIndicator.hide();
                            MessageToast.show("Your data is synced with SAP ");
                        }).catch(function (error) {
                            BusyIndicator.hide();
                            MessageToast.show("Error while saving to SAP, retrying with Local DB");
                            that.fillOfflineDb("ProductSet_" + payload.PRODUCT_ID, payload, "POST", 0);
                        });
                    },
                    error: function (oError) {
                        BusyIndicator.hide();
                        MessageToast.show("Error while saving to SAP, retrying with Local DB");
                        that.fillOfflineDb("ProductSet_" + payload.PRODUCT_ID, payload, "POST", 0);
                    }
                });
            },
            syncChangesWithServer: function (oDataModel) {

                var that = this;
                let ODataModel = oDataModel;
                // Step 1 = Read all changes from offline DB which are not synced

                reusedbapi.read("OFFLINE_STORE_NEW", {
                    OPERATION: "POST",
                    SYNCED: 0
                }).then(function (localdata) {
                    //Step 2 = Loop over each change POST Type
                    for (let index = 0; index < localdata.length; index++) {
                        const element = localdata[index];

                        let entitySetName = element.ENTITYSET.split("_")[0];
                        //Step 3 = Trigger Post Request, Once POst is done, upsert our local DB
                        oDataModel.create("/" + entitySetName, JSON.parse(element.DATA), {
                            //Step 5: get the response - success, error
                            success: function (data) {
                                BusyIndicator.hide();
                                // MessageToast.show("Congratulations! The data has been posted to SAP");
                                reusedbapi.update("OFFLINE_STORE_NEW", {
                                    OPERATION: "POST",
                                    ENTITYSET: "ProductSet_" + data.PRODUCT_ID,
                                    DATA: JSON.stringify(data),
                                    // TIMESTAMP: Math.floor(Date.now() / 1000),
                                    SYNCTIME: Math.floor(Date.now() / 1000),
                                    SYNCED: 1
                                }, ["OPERATION", "ENTITYSET"])
                            },
                            error: function (oError) {
                                BusyIndicator.hide();
                                debugger;
                            }
                        });
                    }
                })


            },
            fillOfflineDb: function (entity, data, operation, synced) {
                let entityName = "";
                if (entity.includes("_")) {
                    entityName = entity.split("_")[0];
                } else {
                    entityName = entity;
                }
                switch (entityName) {
                    case "ProductSet":
                        reusedbapi.upsert("OFFLINE_STORE_NEW", {
                            OPERATION: operation,
                            ENTITYSET: entity,
                            DATA: JSON.stringify(data),
                            TIMESTAMP: Math.floor(Date.now() / 1000),
                            SYNCTIME: Math.floor(Date.now() / 1000),
                            SYNCED: synced
                        }, ["OPERATION", "ENTITYSET"]).then(function (result) {
                            BusyIndicator.hide();
                            MessageToast.show("Your data is saved locally and will be synced with SAP when you are online");
                        }).catch(function (error) {
                            BusyIndicator.hide();
                            MessageBox.error("Error while saving data locally");
                        });
                        break;
                    default:
                        break;
                }
            }
        })
    })