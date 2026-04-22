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
                            ENTITYSET: "ProductSet_" + data.ProductId,
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
                            that.fillOfflineDb("ProductSet_" + payload.ProductId, payload, "POST", 0);
                        });
                    },
                    error: function (oError) {
                        BusyIndicator.hide();
                        MessageToast.show("Error while saving to SAP, retrying with Local DB");
                        that.fillOfflineDb("ProductSet_" + payload.ProductId, payload, "POST", 0);
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
                                    ENTITYSET: "ProductSet_" + data.ProductId,
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
            },
            isMetadataLoaded: function () {//******** Function to check if metadata of the service is loaded *********//
                var oDefaultModel = this.getOwnerComponent().getModel();
                var isLoaded = oDefaultModel.isMetadataLoadingFailed();
                return !isLoaded;
            },
            isAppOnline: async function () {//******** Function to check the connectivity state of the application *********//

                var networkState = navigator.connection.type;
                var states = {};
                let oLocalModel = this.getOwnerComponent().getModel("local")
                states[Connection.UNKNOWN] = 'Unknown connection';
                states[Connection.ETHERNET] = 'Ethernet connection';
                states[Connection.WIFI] = 'WiFi connection';
                states[Connection.CELL_2G] = 'Cell 2G connection';
                states[Connection.CELL_3G] = 'Cell 3G connection';
                states[Connection.CELL_4G] = 'Cell 4G connection';
                states[Connection.CELL] = 'Cell generic connection';
                states[Connection.NONE] = 'No network connection';
                var that = this;
                if (networkState === "none") {
                    this.appWasOffline = true;
                    oLocalModel.setProperty("/deviceConnected", false);
                    oLocalModel.setProperty("/onlineOrOfflineStatusText", "Oops! Offline");
                    setTimeout(function () {
                        that.isAppOnline();
                    }, 1000);
                    oLocalModel.updateBindings(true);
                    return false;
                } else {
                    if (this.isMetadataLoaded()) {

                        oLocalModel.setProperty("/deviceConnected", true);
                        oLocalModel.setProperty("/onlineOrOfflineStatusText", "Connected " + states[networkState]);
                        setTimeout(function () {
                            that.isAppOnline();
                        }, 1000);
                        oLocalModel.updateBindings(true);
                        return true;

                    } else {
                        // If the metadata of the servic is not loaded then reload the metadata of the service
                        oLocalModel.setProperty("/deviceConnected", false);
                        oLocalModel.setProperty("/onlineOrOfflineStatusText", "Oops! Offline");
                        var sRes = await this.reloadApplicationODataModel();
                        setTimeout(function () {
                            that.isAppOnline();
                        }, 1000);
                        oLocalModel.updateBindings(true);
                        return false;
                    }
                }
            },
            reloadApplicationODataModel: function () { //**********Function to reload the application metadata*********//
                let that = this;
                return new Promise(async function (resolve, reject) {

                    let oDefaultModel = that.getOwnerComponent().getModel();

                    oDefaultModel.refreshMetadata().then(
                        function () {
                            resolve(true);
                        }
                    ).catch(
                        function () {
                            resolve(false);
                        }
                    );
                })
            },
        })
    })