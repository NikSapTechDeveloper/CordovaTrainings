CREATE TABLE IF NOT EXISTS user_login(userid varchar, password varchar, logged integer, 
lastlogin numeric, primary key(userid));

insert into user_login VALUES ('mob1','welcome@1234',1,20201212);
SELECT * FROM user_login;


