set @@auto_increment_increment = 1;

insert into USER(name) values 
('rikmms');

insert into HOBBY(name) values
('soccer');

insert into USER_HOBBY(userId, hobbyName) values 
(1, 'soccer');