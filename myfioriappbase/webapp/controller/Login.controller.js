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
			if (!sUser || !sPassword) {
				MessageBox.error("Credentials cannot be blank.");
				return;
			}
			let oDataModel = new ODataModel("https://122.162.240.164:44310/sap/opu/odata/sap/ZHYBRID_CORDOVA_PROJECT_SRV/", {
				user: sUser,
				password: sPassword,
			});
			this.getOwnerComponent().setModel(oDataModel);

			if (navigator.connection.type !== 'none') {
				oDataModel.attachMetadataLoaded(null, () => {
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
			this.isAppOnline();
		},

	});

});