const sqlite3 = require('sqlite3').verbose(); //Dependency for Db
const db = new sqlite3.Database('nikita.db'); //Creating DB (assigning name)

db.serialize(() => {
    db.run("CREATE TABLE lorem (info TEXT)"); //table =lorem and coloumn name =  info

    const stmt = db.prepare("INSERT INTO lorem VALUES (?)");
    for (let i = 0; i < 10; i++) {
        stmt.run("Anubhav Trainings " + i);
    }
    stmt.finalize();

    db.each("SELECT rowid AS id, info FROM lorem", (err, row) => {
        console.log(row.id + ": " + row.info);
    });
});

db.close();