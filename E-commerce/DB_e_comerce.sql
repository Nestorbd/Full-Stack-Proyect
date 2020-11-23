drop database if exists db_e_commerce;
create database db_e_commerce;

use db_e_commerce;


drop table if exists products;
create table products (
id int primary key auto_increment,
name varchar(50) not null,
description varchar(500),
price float not null,
tax_rate float default 7 not null ,
image varchar(500),
category varchar(50),
availability boolean not null
);

drop table if exists address;
create table address (
id int primary key auto_increment,
street varchar(200) not null,
number varchar(10) not null,
zip_code int not null,
location varchar(50) not null,
province varchar(50) not null,
country varchar(50) not null
);


drop table if exists users;
create table users  (
id int primary key auto_increment,
name varchar(100) not null,
last_name varchar(100) not null,
email varchar(100) not null,
password varchar(500) not null,
id_address int not null,
isAdmin boolean default false,
timestamp timestamp,

foreign key (id_address) references address(id)
on update cascade
on delete cascade
);

drop table if exists orders;
create table orders (
id int primary key auto_increment,
date date not null,
total float not null,
status varchar(50),
id_user int not null,
timestamp timestamp,

foreign key (id_user) references users(id)
on update cascade
on delete cascade
);

drop table if exists order_product;
create table order_product (
id_product int not null,
id_order int not null,
timestamp timestamp,

primary key (id_product,id_order),
foreign key (id_product) references products(id)
on update cascade
on delete cascade,
foreign key (id_order) references orders(id)
on update cascade
on delete cascade
);

-- Productos de prueba
insert into products(name,description,price,category,availability)
	values ("producto1","este es el producto 1", 5.5, "una cateforia", true );
insert into products(name,description,price,tax_rate,category,availability) 
	values ("product2","este es el producto 2", 8, 10, "una cateforia 2", false );

-- direccion de prueba
insert into address 
	values (1,"una calle",1,35400,"un sitio","las palmas", "spain");

-- usuario admin para pruebas, cambiar la contraseña para su uso, esta en bcript
insert into users 
	values (1,"admin","admin", "admin@administrador.com","$2y$12$FBXtee5Os8kqOZPjBNeiK.OCFB/VpV2d653HHu86ERlNQRP08TiXG",1,true,timestamp("2020-11-06"));

-- orden de prueba
insert into orders 
	values (1,"2020-11-06",50.5, "pago",1,timestamp("2020-11-06"));

-- se deberia hacer un trigger para esto
insert into order_product 
	values (1,1,timestamp("2020-11-06"));

-- select * from products;
-- select * from address;
-- select * from users;
-- select * from orders;
-- select * from order_product;

