sap.ui.define([
	"com/nikitatrainings/controller/BaseController",
	"com/nikitatrainings/util/formatter",
	"sap/m/MessageBox",
	"com/nikitatrainings/offline/reusedbapi"
], function (Controller, Formatter, MessageBox, reusedbapi) {
	"use strict";

	return Controller.extend("com.nikitatrainings.controller.SyncStatus", {
		formatter: Formatter,
		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf com.nikitatrainings.view.View1
		 */
		onInit: function () {
			//get the router object from Component.js
			this.oRouter = this.getOwnerComponent().getRouter();
			this.oRouter.getRoute("sync").attachMatched(this._view1Rmh, this);
			let oDefaultModel = this.getOwnerComponent().getModel();
			// oDefaultModel.setProperty("/deviceConnected", false);
			// oDefaultModel.setProperty("/onlineOrOfflineStatusText", "Oops! Offline")
			this.idleLogout();
		},
		_view1Rmh: function (oEvent) {
			this.checkConnection();
		},
		checkConnection: function () {
			var networkState = navigator.connection.type;

			let oDefaultModel = this.getView().getModel();
			let oLocalModel = this.getOwnerComponent().getModel("local")

			const Connection = {

				UNKNOWN: 'unknown',
				ETHERNET: 'ethernet',
				WIFI: 'wifi',
				CELL_2G: '2g',
				CELL_3G: '3g',
				CELL_4G: '4g',
				CELL: 'cellular',
				NONE: 'none'
			};
			var states = {};
			states[Connection.UNKNOWN] = 'Unknown connection';
			states[Connection.ETHERNET] = 'Ethernet connection';
			states[Connection.WIFI] = 'WiFi connection';
			states[Connection.CELL_2G] = 'Cell 2G connection';
			states[Connection.CELL_3G] = 'Cell 3G connection';
			states[Connection.CELL_4G] = 'Cell 4G connection';
			states[Connection.CELL] = 'Cell generic connection';
			states[Connection.NONE] = 'No network connection';

			// alert('Connection type: ' + states[networkState]);
			if (states[networkState] === 'No network connection') {
				oLocalModel.setProperty("/deviceConnected", false);
				oLocalModel.setProperty("/onlineOrOfflineStatusText", "Oops! Offline");
                 
			
			} else if(states[networkState] !== undefined){
				oLocalModel.setProperty("/deviceConnected", true);
				oLocalModel.setProperty("/onlineOrOfflineStatusText", "Connected" + states[networkState]);

				
			}else{
				oLocalModel.setProperty("/deviceConnected", true);
				oLocalModel.setProperty("/onlineOrOfflineStatusText", "Connected" + states[networkState]);

				

			}

			if (this.checkOffline(this)) {
                   var that = this;
                   reusedbapi.read("OFFLINE_STORE_NEW", {
					OPERATION: "POST",
				   }).then(function(localdata){
                     that.getOwnerComponent().getModel("local").setProperty("/OFFLINE_STORE_NEW", localdata);
				   })
				}


		},
		
		idleLogout: function () {
			let time;
			let that = this;
			window.onload = resetTimer;
			window.onmousemove = resetTimer;
			window.ontouchstart = resetTimer;
			window.onclick = resetTimer;
			window.onkeydown = resetTimer;
			window.addEventListener("scroll", resetTimer, true);

			function autoLogout() {
				MessageBox.alert("Page Expired!, Please Login Again.");
				window.top.location.href = './index.html';
			}
			function resetTimer() {
				clearTimeout(time);
				time = setTimeout(autoLogout, 600000);
			}
		},
		onSyncPress: async function(){
			let oDataModel = this.getOwnerComponent().getModel();
			await this.syncChangesWithServer(oDataModel);
			await this.checkConnection();
		}

	});

});
