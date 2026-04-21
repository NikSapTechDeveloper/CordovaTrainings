const sqlite3 = require('sqlite3').verbose(); //Dependency for Db
const db = new sqlite3.Database('anubhav.db'); //Creating DB (assigning name)

const anubhavapi = require('./anubhavdbapi');
anubhavapi.setDb(db);

//Async way to read data 
anubhavapi.read("USER_LOGIN", { userid: "anubhav" }).then((data) => {
    console.log(data);
})

//Sync way
async function testAnubhavAPI() {
    var mydata = await anubhavapi.read("USER_LOGIN", { userid: "anubhav" });
    console.log(mydata);
}

testAnubhavAPI();
db.close();