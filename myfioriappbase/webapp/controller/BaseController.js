sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "com/nikitatrainings/offline/reusedbapi"
],
    function (Controller, reusedbapi) {
        return Controller.extend("com.nikitatrainings.controller.BaseController", {

            onNavBack: function () {
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
            syncChangesWithServer: function (oDataModel) {

                var that = this;
                let ODataModel = oDataModel;
                // Step 1 = Read all changes from offline DB which are not synced

                reusedbapi.read("OFFLINE_STORE_NEW", {
                    OPERATION: "POST",
                }).then(function (localdata) {
                    //JSON.parse(localdata[0].DATA)
                    //Step 2 = Loop over each change POST Type
                    for (let index = 0; index < localdata.length; index++) {
                        const element = localdata[index];

                        let entitySetName = element.ENTITYSET.split("_")[0];
                        //Step 3 = Trigger Post Request, Once POst is done, Update our local DB
                        oDataModel.create("/" + entitySetName, JSON.parse(element.DATA), {
                            //Step 5: get the response - success, error
                            success: function (data) {
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
                                debugger;
                            }
                        });
                    }
                })


            },
            fillOfflineDb: function (entity, data, operation, synced) {
                let entityName ="";
                if(entity.includes("_")){
                    entityName = entity.split("_")[0];
                }else{
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
                        }, ["OPERATION", "ENTITYSET"])
                        break;
                    default:
                        break;
                }
            }
        })
    })