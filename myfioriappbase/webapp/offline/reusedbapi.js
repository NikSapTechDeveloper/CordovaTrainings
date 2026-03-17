sap.ui.define([
   
], function() {
    return{
        upsert: function(tableName, payload, arrKeys) { // * ========= UPSERT operation on the offline database tables (Update & Insert simultaneously) =======
            //^ If the record if already present in the database table it will update the record,
            // ^ if the record was not in the database table it will create a new record 
            var that  = this;
            var oPayload = JSON.parse(JSON.stringify(payload));
            return new Promise(function(resolve, reject) {
                that.create(tableName, oPayload, arrKeys)
                .then(function(oRes) {
                    resolve(oRes);
                })
                .catch(function(oErr) {
                    that.update(oErr.tableName, oErr.oDataPayload, oErr.arrKeys)
                        .then(function(oRes1) {
                            if (oRes1.rs.rowsAffected) {
                                resolve("Success");
                            }else {
                                reject(oRes1);
                            }
                        })
                        .catch(function(oErr1) {
                            reject(oErr1);
                        });
                });
            });
        },
        create: function(tableName, payload, arrKeys) { // * ===== create operartion on offline database tables =======
            //^ ======= create refers to the INSERT operation ===========
            var that  = this;
            var oPayload = JSON.parse(JSON.stringify(payload));
            return new Promise(function(resolve, reject) {
                var sQuery = "INSERT INTO " + tableName;
                var sColumnValueString = that.getColumnValueList(oPayload);
                sQuery = sQuery + sColumnValueString;
                sqliteDB.transaction(function(tx) {
                    tx.executeSql(sQuery);
                }, function(error) {
                    var oErr = {
                        error: error,
                        tableName: tableName,
                        oDataPayload: oPayload,
                        arrKeys: arrKeys
                    }
                    reject(oErr);
                }, function() {
                    resolve("Success");
                });
            });
        },
        read: function(tableName, oFilter) { // * ===== Read function to get the data from the database tables ============
            // ^ this function do the "Select * from <databaseTableName>" operation to get the data.
            var that = this;
            return new Promise(function(resolve, reject) {
                var sSeletQuery = "SELECT * from " + tableName;
                if (oFilter) {
                    var sTemp = " WHERE " + that.getFiltersFromObject(oFilter) + ";";
                    sSeletQuery = sSeletQuery + sTemp;
                }
                sqliteDB.transaction(function(tx) {
                    tx.executeSql(sSeletQuery, [],
                    function(tx, rs) {
                        var arrLength = rs.rows.length;
                        var NotifList = [];
                        for(var x = 0 ; x < arrLength; x++){
                            if(rs.rows.item(x)) {
                                NotifList.push(rs.rows.item(x));
                            }
                        }
                        resolve(NotifList);
                    },
                    function(error) {
                        reject(error);
                    });
                });
            });
        },
        update: function(tableName, oPayload, arrKeys){ // * ====== function to update the database records =======
            // ^ this function do the "update" operation to update the particular existing record of the database table 
            var that = this;
            return new Promise(function(resolve, reject) {
                var oFilters = {};
                for(var i=0; i<arrKeys.length; i++) {
                    oFilters[arrKeys[i]] = oPayload[arrKeys[i]];
                }
                var sQuery = "UPDATE " + tableName;
                var sColumnString = " SET ";
                var sColumnValPair = that.getColumnValuePair(oPayload);
                var sValues = " WHERE " + that.getColumnValuePair(oFilters, true);
                sQuery = sQuery + sColumnString + sColumnValPair + sValues;
                sqliteDB.transaction(function(tx) {
                    tx.executeSql(sQuery, [], 
                        function(tx, rs) {
                            var oReturn = {
                                rs: rs,
                                tableName: tableName,
                                payload: oPayload,
                                arrKeys: arrKeys
                            }
                            resolve(oReturn);
                        },
                        function(tx, error) {
                            var oErr = {
                                error: error,
                                tableName: tableName,
                                payload: oPayload,
                                arrKeys: arrKeys
                            }
                            reject(oErr);
                        });
                });
            })
        },
        delete: function(tableName, payload, arrKeys) { //* function to delete the record from database table.
            // ^ this function perform the "delete" operation of a particular record menation in the "where clause".
            var that = this;
            return new Promise(function(resolve, reject) {
                var sQuery = "DELETE FROM " + tableName;
                var sWhereCondition =  " WHERE " + that.getColumnValuePair(payload, true);
                sQuery = sQuery + sWhereCondition;
                sqliteDB.transaction(function(tx) {
                    tx.executeSql(sQuery, [],
                        function(tnx, rs) {
                            resolve(rs);
                        },
                        function(tnx, error) {
                            reject(error);
                        }    
                    )
                });

            });
        },
        deleteAll: function(tableName) { // * function to delete all the records in the given table
            return new Promise(function(resolve, reject) {
                var sQuery = "DELETE FROM " + tableName;
                sqliteDB.transaction(function(tx) {
                    tx.executeSql(sQuery, [],
                        function(tnx, rs) {
                            resolve(rs);
                        },
                        function(tnx, error) {
                            reject(error);
                        }    
                    )
                });

            });
        },
        count: function(tableName, oFilter) { //* function to get the number of records in the given table
            // ^ this function get the count of how many records are present in the given table
            let that = this;
            return new Promise(function(resolve, reject) {
                let sTemp = ";";
                let sQuery = "SELECT COUNT(*) FROM " + tableName + " AS TOTALCOUNT";
                if (oFilter) {
                    sTemp = " WHERE " + that.getFiltersFromObject(oFilter) + ";";
                    // sSeletQuery = sSeletQuery + sTemp;
                }
                sQuery = sQuery + sTemp;
                sqliteDB.transaction(function(tx) {
                    tx.executeSql(sQuery, [],
                        function(tnx, rs) {
                            let nCount = rs.rows.item(0)['COUNT(*)'];
                            resolve(nCount);
                        },
                        function(tnx, error) {
                            console.log(JSON.stringify(error))
                            reject(error);
                        }    
                    )
                });

            });
        },
        readByLimit: function(tableName, Limit, Offset, oFilter) { // * function to read the records to a certain limit.
            // ^ it read the database table and return the number of records according to the specified limit.
            // ~ if the limit is 3 then it read the DB and provide output of only 3 record at once
            var that = this;
            return new Promise(function(resolve, reject) {
                var sQuery = "SELECT * FROM " + tableName;
                if (oFilter) {
                    sTemp = " WHERE " + that.getFiltersFromObject(oFilter);
                    sQuery = sQuery + sTemp;
                }
                if (Limit) {
                    sQuery = sQuery + " LIMIT " + Limit;
                }
                if (Offset) {
                    sQuery = sQuery + " OFFSET "+ Offset;
                }
                sQuery = sQuery + ";";
                sqliteDB.transaction(function(tx) {
                    tx.executeSql(sQuery, [],
                        function(tnx, rs) {
                            var arrLength = rs.rows.length;
                            var records = [];
                            for(var x = 0 ; x < arrLength; x++){
                                if(rs.rows.item(x)) {
                                    records.push(rs.rows.item(x));
                                }
                            }
                            resolve(records);
                        },
                        function(tnx, error) {
                            console.log(JSON.stringify(error))
                            reject([]);
                        }    
                    )
                });

            });
        },
        readDistinctValueInColumn: function(tableName, arrColumns) { // * ========= function to the unique value from the column ==============
            //^ this function returns the unique value of selected columns
            var that = this;
            return new Promise(function(resolve, reject) {
                var sQuery = "SELECT DISTINCT "+ arrColumns.join(", ") +" FROM " + tableName + ";";
                sqliteDB.transaction(function(tx) {
                    tx.executeSql(sQuery, [],
                        function(tnx, rs) {
                            var arrLength = rs.rows.length;
                            var records = [];
                            for(var x = 0 ; x < arrLength; x++){
                                if(rs.rows.item(x)) {
                                    records.push(rs.rows.item(x));
                                }
                            }
                            resolve(records);
                        },
                        function(tnx, error) {
                            console.log(JSON.stringify(error))
                            reject([]);
                        }    
                    )
                });

            });
        },
        readByColumns: function(tableName, arrColumns, oWhere) {//* function to read all the records of a specificed selected column
            var that = this;
            return new Promise(function(resolve, reject) {
                // var sQuery = "SELECT "+ arrColumns.join(", ") +" FROM " + tableName + ";";


                let sTemp = ";";
                let sQuery = "SELECT "+ arrColumns.join(", ") +" FROM " + tableName;
                if (oWhere) {
                    sTemp = " WHERE " + that.getFiltersFromObject(oWhere) + ";";
                    // sSeletQuery = sSeletQuery + sTemp;
                }
                sQuery = sQuery + sTemp;
                sqliteDB.transaction(function(tx) {
                    tx.executeSql(sQuery, [],
                        function(tnx, rs) {
                            var arrLength = rs.rows.length;
                            var records = [];
                            for(var x = 0 ; x < arrLength; x++){
                                if(rs.rows.item(x)) {
                                    records.push(rs.rows.item(x));
                                }
                            }
                            resolve(records);
                        },
                        function(tnx, error) {
                            console.log(JSON.stringify(error))
                            reject([]);
                        }    
                    )
                });

            });
        },
        getFiltersFromObject: function(oFilter) { // * function used to construct a SQL filter string from the filter object
            let resultString = '';
            let count = 0;
            for (const item in oFilter ) {
                count++;
            }
            let tempCount = 0;
            for (const key in oFilter) {
                tempCount++;
                let valueString = String(oFilter[key]);
                if(valueString.includes("'")) {
                    valueString = valueString.replace(/'/g, "`");
                }
                if(count === tempCount) {

                    // Here we will check if the Value is equal to 'IS NULL' or 'IS NOT NULL'
                    if (valueString === 'IS NULL') {
                        resultString = resultString + `(${key}='null' OR ${key}='' OR ${key} IS NULL)`;
                    }else if (valueString === 'IS NOT NULL') {
                        resultString = resultString + `(${key}<>'null' AND ${key}<>'' AND ${key} IS NOT NULL)`;
                    }else {
                        resultString = resultString + key + "='" + valueString +"'";
                    }

                }else {

                    if (valueString === 'IS NULL') {
                        resultString = resultString + `(${key}='null' OR ${key}='' OR ${key} IS NULL) AND `;
                    }else if (valueString === 'IS NOT NULL') {
                        resultString = resultString + `(${key}<>'null' AND ${key}<>'' AND ${key} IS NOT NULL) AND `;
                    }else {
                        resultString = resultString + key + "='" + valueString + "' AND ";
                    }
                    
                }
            }
            return resultString;
        },
        getColumnValueList: function(oPayload) { //* function used to create respective column value list in SQL format
            var sColumnString = "(";
            var valueString;
            var sValues = " VALUES (";
            var count = 0;
            delete oPayload.__metadata;
            for (const item in oPayload ) {
                count++;
            }
            var sTempCount = 0;
            for (const item in oPayload ) {
                sTempCount++;
                valueString = String(oPayload[item]);
                if(valueString.includes("'")) {
                    valueString = valueString.replace(/'/g, "`");
                }
                if(count === sTempCount) {
                    sColumnString  = sColumnString + item + ")";
                    sValues = sValues + "'" + valueString + "'" + ");";
                }else {
                    sColumnString  = sColumnString + item + ", ";
                    sValues = sValues + "'" + valueString + "'" + ", ";
                }
            }
            return sColumnString + sValues;
        },
        getColumnValuePair: function(oPayload, isFilter) { //* function used to generate column value pairs in SQL format
            var sColValPair = '';
            var count = 0;
            delete oPayload.__metadata;
            for (const item in oPayload ) {
                count++;
            }
            var sTempCount = 0;
            for (const item in oPayload ) {
                sTempCount++;
                var valueString = String(oPayload[item]);
                if(valueString.includes("'")) {
                    valueString = valueString.replace(/'/g, "`");
                }
                if(count === sTempCount) {
                    sColValPair = sColValPair +  String(item) + "=" + "'"  + valueString + "'" ;
                }else {
                    if(isFilter) {
                        sColValPair = sColValPair +  String(item) + "=" + "'"  + valueString + "'" + ' AND ' ;
                    }else {
                        sColValPair = sColValPair +  String(item) + "=" + "'"  + valueString + "'" + ', ' ;
                    }
                }
            }
            return sColValPair;
        }
    };
});