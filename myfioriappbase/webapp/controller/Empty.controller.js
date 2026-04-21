sap.ui.define([
	"com/nikitatrainings/controller/BaseController",
], function (Controller) {
	"use strict";

	return Controller.extend("com.nikitatrainings.controller.Empty", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf com.nikitatrainings.view.Empty
		 */
		onInit: function () {
			this.oRouter = this.getOwnerComponent().getRouter();
			this.oRouter.getRoute('master').attachPatternMatched(this._masterRmh, this);

		},
		_masterRmh: function (oEvent) {
			debugger
			let olocalModel = this.getOwnerComponent().getModel("local")
			this.getView().setModel(olocalModel,"local");
			// let olocalModel = this.getView().getModel("local");
			 if (sap.ui.Device.system.phone) {
				olocalModel.setProperty('/isPhone', true);
			} else {
				olocalModel.setProperty('/isPhone', false);
			}

			
		},
	});

});