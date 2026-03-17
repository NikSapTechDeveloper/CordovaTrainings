const sqlite3 = require('sqlite3').verbose(); //Dependency for Db
const db = new sqlite3.Database('anubhav.db'); //Creating DB (assigning name)

const anubhavapi = require('./anubhavdbapi');
anubhavapi.setDb(db);
    // db.run('CREATE TABLE IF NOT EXISTS USER_LOGIN (USERID varchar, PASSWORD varchar, LOGGED integer, LASTLOGIN numeric, primary key(USERID))');
    
    // anubhavapi.create("USER_LOGIN",{
    //     USERID:"anubhav",
    //     password:"test123",
    //     logged: 1,
    //     lastlogin:Math.floor(Date.now() / 1000)
    // },["USERID"]).then(function(data){
    //     console.log(data);
    // })
   //Async way to read data 
    anubhavapi.read("USER_LOGIN",{userid:"anubhav"}).then((data)=>{
        console.log(data);
    })

    //Sync way
    async function testAnubhavAPI(){
      var mydata = await anubhavapi.read("USER_LOGIN",{userid:"anubhav"});
      console.log(mydata);
    //   return mydata;
    }

    testAnubhavAPI();

// db.serialize(() => {
//     db.run("CREATE TABLE lorem (info TEXT)"); //table =lorem and coloumn name =  info

//     const stmt = db.prepare("INSERT INTO lorem VALUES (?)");
//     for (let i = 0; i < 10; i++) {
//         stmt.run("Anubhav Trainings " + i);
//     }
//     stmt.finalize();

//     db.each("SELECT rowid AS id, info FROM lorem", (err, row) => {
//         console.log(row.id + ": " + row.info);
//     });
// });

db.close();