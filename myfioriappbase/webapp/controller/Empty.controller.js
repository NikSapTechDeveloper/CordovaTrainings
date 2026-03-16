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

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf com.nikitatrainings.view.Empty
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf com.nikitatrainings.view.Empty
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf com.nikitatrainings.view.Empty
		 */
		//	onExit: function() {
		//
		//	}

	});

});