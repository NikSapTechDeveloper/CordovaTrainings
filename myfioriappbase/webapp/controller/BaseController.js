sap.ui.define([
  "sap/ui/core/mvc/Controller"
],
function(Controller){
    return Controller.extend("com.nikitatrainings.controller.BaseController",{

        onNavBack:function(){
           let oSplitApp =  this.getView().getParent().getParent();
           let oMasterApp = oSplitApp.getMasterPages()[0];
           oSplitApp.toMaster(oMasterApp,"flip");
        }
    })
})