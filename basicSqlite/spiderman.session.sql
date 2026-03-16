CREATE TABLE IF NOT EXISTS user_login(userid varchar, password varchar, logged integer, 
lastlogin numeric, primary key(userid));

insert into user_login VALUES ('mob3','new@123',1,20201212);
SELECT * FROM user_login;


