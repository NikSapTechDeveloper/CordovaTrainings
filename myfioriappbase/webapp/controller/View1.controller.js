sap.ui.define([
	"com/nikitatrainings/controller/BaseController",
	"com/nikitatrainings/util/formatter",
	"sap/m/MessageBox"
], function (Controller, Formatter, MessageBox) {
	"use strict";

	return Controller.extend("com.nikitatrainings.controller.View1", {
		formatter: Formatter,
		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf com.nikitatrainings.view.View1
		 */
		onInit: function () {
			//get the router object from Component.js
			this.oRouter = this.getOwnerComponent().getRouter();
			this.oRouter.getRoute("master").attachMatched(this._view1Rmh, this);
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

			}
		},
		onItemSelect: function (oEvent) {
			var oSelectedItem = oEvent.getParameter("listItem");
			var sTitle = oSelectedItem.getTitle();
			this.onNext(sTitle);
		},
		oRouter: null,
		onSelectChange: function (oEvent) {
			var oList = oEvent.getSource();
			// var aItems = oList.getSelectedItems();
			// for (var i=0; i<aItems.length; i++) {
			// 	console.log(aItems[i].getTitle());
			// }
			//Technique 1: to send data but can only send FIELD by FIELD
			//if we have 100 fields, we will have 100 lines of code and multiply
			// var sTitle = oList.getSelectedItem().getTitle();
			// this.onNext(sTitle);

			//Technique 2: Bind the complete View 2 with the element selected
			// --> /fruits/2 -- {name: '', color: '', ....}
			var sPath = oList.getSelectedItem().getBindingContextPath();
			var sIndex = sPath.split("/")[sPath.split("/").length - 1];
			this.onNext(sIndex);
			// var oView2 = this.getView().getParent().getParent().getDetailPages()[1];
			// oView2.bindElement(sPath);

		},
		onSearch: function (oEvent) {
			//Step 1: get the value entered by user on screen
			var sSearchValue = oEvent.getParameter("query");
			if (!sSearchValue) {
				sSearchValue = oEvent.getParameter("newValue");
			}
			//Step 2: prepare a filter object - 2 operands and 1 operator
			var oFilter = new sap.ui.model.Filter("name", sap.ui.model.FilterOperator.Contains, sSearchValue);
			var oFilter2 = new sap.ui.model.Filter("type", sap.ui.model.FilterOperator.Contains, sSearchValue);
			var aFilter = [oFilter, oFilter2];
			var oFilterFinal = new sap.ui.model.Filter({
				filters: aFilter,
				and: false
			});
			//Step 3: get the control on which filter needs to be applied (List)
			var oList = this.getView().byId("idList");
			//step 4: Inject the filter into the binding of list
			oList.getBinding("items").filter(oFilterFinal);
		},
		onNext: function (sIndex) {
			// WHO IS RESPONSIBLE FOR NAVIGATION
			this.oRouter.navTo("detail", {
				navya: sIndex
			});
			//Step 1: Get The Container object for this view
			//Now it is Split App Container Object
			// var oParent = this.getView().getParent().getParent();

			// //Step 2: go to view 1 from parent
			// var oView2 = oParent.getDetailPages()[1];
			// //Step 3: get the child of the view1 (viz. search field )
			// var oPage = oView2.getContent()[0];
			// //Step 4: get the value
			// oPage.setTitle(sTitle);

			// //Step 2: use that to navigate to second view
			// oParent.toDetail("idView2");
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
				time = setTimeout(autoLogout, 60000);
			}
		}
		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf com.nikitatrainings.view.View1
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf com.nikitatrainings.view.View1
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf com.nikitatrainings.view.View1
		 */
		//	onExit: function() {
		//
		//	}

	});

});
