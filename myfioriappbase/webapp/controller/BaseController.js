sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "com/nikitatrainings/offline/reusedbapi"
],
function(Controller, reusedbapi){
    return Controller.extend("com.nikitatrainings.controller.BaseController",{

        onNavBack:function(){
           let oSplitApp =  this.getView().getParent().getParent();
           let oMasterApp = oSplitApp.getMasterPages()[0];
           oSplitApp.toMaster(oMasterApp,"flip");
        },
        checkOffline: function(oController){
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
        fillOfflineDb: function(entity, data, operation){
            switch (entity){
                case "ProductSet":
                 reusedbapi.upsert("OFFLINE_STORE_NEW",{
                    OPERATION: operation,
                    ENTITYSET: entity,
                    DATA: JSON.stringify(data),
                    TIMESTAMP: Math.floor(Date.now() / 1000),
                    SYNCTIME: Math.floor(Date.now() / 1000)
                 },["OPERATION","ENTITYSET"])
                break;
                default:
                    break;
            }
        }
    })
})