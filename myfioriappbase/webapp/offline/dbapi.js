sap.ui.define([

], function () {
    'use strict';
    return {
        insert: function (username, password) {

            return new Promise((res, rej) => {
                sqliteDB.transaction(function (tx) {
                    tx.executeSql('INSERT INTO USER_LOGIN VALUES (?1,?2,?3,?4)', [username, password, 1, new Date()]);
                    tx.executeSql('INSERT INTO DemoTable VALUES (?1,?2)', ['Betty', 202]);
                }, function (error) {
                    console.log('Transaction ERROR: ' + error.message);
                    rej(error)
                }, function () {
                    console.log('Insert to user table is success');
                    res(null);
                });
            })

        },
        update: function () {

        },
        delete: function () {

        },
        select: function (username) {
            return new Promise((res,rej)=>{
             sqliteDB.transaction(function (tx) {

                var query = "SELECT * FROM USER_LOGIN WHERE USERID = ?";

                tx.executeSql(query, [username], function (tx, resultSet) {

                    if (resultSet.rows.length > 0) {
                        res({
                            "count": resultSet.rows.length,
                            "data": resultSet.rows.item(0)
                        })
                    } else {
                        res( {
                            "count": 0,
                            "data": null
                        })
                    }
                    // for(var x = 0; x < resultSet.rows.length; x++) {
                    //     console.log("First name: " + resultSet.rows.item(x).firstname +
                    //         ", Acct: " + resultSet.rows.item(x).acctNo);
                    // }
                },
                    function (tx, error) {
                        console.log('SELECT error: ' + error.message);
                        rej(error);
                    });
            }, function (error) {
                console.log('transaction error: ' + error.message);
                rej(error);
            }, function () {
                console.log('transaction ok');
                res(null);
            });

            })
            
        }
    }
})