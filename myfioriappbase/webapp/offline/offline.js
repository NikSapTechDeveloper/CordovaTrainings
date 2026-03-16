sap.ui.define([

],
    function () {
        'use strict';
        return {

            initialize: function () {
                document.addEventListener('deviceready', jQuery.proxy(this.onDeviceReady, this), false)
            },

            onDeviceReady: function () {
                this.onCreateLocalDB();
            },

            onCreateLocalDB: function () {
                sqliteDB = window.sqlitePlugin.openDatabase({
                    name: "nikita.db",
                    location: "default",
                    androidDatabaseProvider: "system"
                });
                this.onCreateDBTables();
            },
            onCreateDBTables: function () {
                var that = this;
                sqliteDB.transaction(function (tx) {
                    tx.executeSql('CREATE TABLE IF NOT EXISTS USER_LOGIN (USERID varchar, PASSWORD varchar, LOGGED integer, LASTLOGIN numeric, primary key(USERID))');
                }, function (error) {
                    console.log('Transaction ERROR: ' + error.message);
                }, function () {
                    console.log('login table database OK');
                     that.onStartComponent();
                });
               
            },
            onStartComponent: function () {
                sap.ui.getCore().attachInit(function () {
                    let oComponentContainer = new sap.ui.core.ComponentContainer({
                        name: "com.nikitatrainings"
                    });
                    oComponentContainer.placeAt("content")
                });
            }
        }
    }
)