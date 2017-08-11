create table if not exists USER (
	
	id int auto_increment primary key,
	name varchar(128) not null
);

create table if not exists HOBBY (
	
	name varchar(128) primary key
);

create table if not exists USER_HOBBY (
	
	userId int not null,
	hobbyName varchar(128) not null,
	
	foreign key(userId) references USER(id),
	foreign key(hobbyName) references HOBBY(name),
	
	primary key(userId, hobbyName)
);