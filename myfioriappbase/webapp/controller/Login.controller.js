sap.ui.define([
	"com/nikitatrainings/controller/BaseController",
	"sap/ui/model/odata/v2/ODataModel",
	"sap/m/MessageBox",
	"com/nikitatrainings/offline/reusedbapi"
], function (Controller, ODataModel, MessageBox, dbapi) {
	"use strict";

	return Controller.extend("com.nikitatrainings.controller.Login", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf com.nikitatrainings.view.App
		 */
		onInit: function () {
			this.oRouter = this.getOwnerComponent().getRouter();

		},

		onLogin: function () {
			let that = this;
			let sUser = this.getView().byId("idUser").getValue();
			let sPassword = this.getView().byId("idPassword").getValue();
			let oDataModel = new ODataModel("http://s4hana10.saraswatitechnologies.in:8010/sap/opu/odata/sap/ZNIKITA_MOCK_PROJECT_SRV/", {
				user: sUser,
				password: sPassword,
			});
            // oDataModel.setTokenHandlingEnabled(false);

			if (!oDataModel.oMetadata.sUser || !oDataModel.oMetadata.sPassword) {
				MessageBox.error("Credentials cannot be blank.");
				return;
			}

			if (navigator.connection.type !== 'none') {
				oDataModel.attachMetadataLoaded(null, () => {
					that.getOwnerComponent().setModel(oDataModel);
					that.oRouter.navTo("master");
					if (that.checkOffline(that)) {
						dbapi.read("USER_LOGIN", {
							USERID: oDataModel.oMetadata.sUser
						}).then(function (data) {
							if (data.length > 0) {

							} else {
								dbapi.create("USER_LOGIN", {
									USERID: oDataModel.oMetadata.sUser,
									PASSWORD: btoa(oDataModel.oMetadata.sPassword),
									logged: 1,
									lastlogin: Math.floor(Date.now() / 1000)
								}, ["USERID"]).then(function (data) {
									console.log("Also inserted data using promise")
								})
							}
						})

					}


				}, null)



			} else {
				dbapi.read("USER_LOGIN", {
					USERID: oDataModel.oMetadata.sUser
				}).then(function (data) {
					if (data.length > 0) {
						if (oDataModel.oMetadata.sUser === data[0].USERID &&
							btoa(oDataModel.oMetadata.sPassword) === data[0].PASSWORD) {
							that.oRouter.navTo("master");
						} else {
							MessageBox.error("Credentials do not match in offline mode.");
						}
					} else {
						MessageBox.error("You are offline and this user never stored in offline db");
					}
				})

			}

			oDataModel.refreshMetadata();

		},

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf com.nikitatrainings.view.App
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf com.nikitatrainings.view.App
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf com.nikitatrainings.view.App
		 */
		//	onExit: function() {
		//
		//	}

	});

});