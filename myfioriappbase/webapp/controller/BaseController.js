sap.ui.define([
  "sap/ui/core/mvc/Controller"
],
function(Controller){
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
        }
    })
})