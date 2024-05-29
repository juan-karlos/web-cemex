CREATE DATABASE IF NOT EXISTS cemex;

use cemex;

create table historial(
id_historial int not null auto_increment,
segmento nvarchar (100),
zona nvarchar(50),
cumplimiento nvarchar(250),
fecha datetime,
primary key (id_historial)
);

Create Table usuarios
(
id_usuario INT NOT NULL AUTO_INCREMENT,
correo_electronico nvarchar (50) not null,
nombre_usuario Nvarchar(50) not null,
apellidos nvarchar (50) not null,
contrasena Nvarchar(120) not null,
zona_asignada  varchar(30)  
rol varchar(100)
primary key (id_usuario),
UNIQUE(correo_electronico) 
);

Create table unidad_Operativa
(
id_planta INT NOT NULL AUTO_INCREMENT,
nombre_planta nvarchar(100),
segmento nvarchar(100),
zona nvarchar(100),
Estado nvarchar(100),
porcentaje_cumplimiento nvarchar (150),
fija boolean,
activo boolean,
primary key (id_planta),
UNIQUE(Nombre_planta)
);

create table requerimiento
(
id_requerimiento int not null auto_increment,
nombre_requerimiento nvarchar(250),
peso int,
impacto nvarchar(100),
siglas nvarchar(50),
primary key (id_requerimiento),
unique (nombre_requerimiento)
);



create table registro
(
id_registro INT NOT NULL AUTO_INCREMENT,
id_requerimiento INT,
id_planta INT,
fecha_inicio datetime,
fecha_vencimiento datetime,
observaciones nvarchar(2500),
estatus nvarchar (150),
url Nvarchar(250), 
validez_unica boolean,
foreign key (id_planta) references Unidad_Operativa(id_planta) , 
foreign key (id_requerimiento) references requerimiento(id_requerimiento),
primary key (id_registro)
    
);

create table documentos(
id_doc               int NOT NULL AUTO_INCREMENT,        
id_registro          int,          
nombre_planta        varchar(100), 
url                  varchar(250), 
fecha_inicio         date,         
fecha_vencimiento    date,         
impacto              varchar(200), 
zona                 varchar(200), 
segmento             varchar(300), 
nombre_requerimiento varchar(100), 
nombre_doc           varchar(250), 
primary key (id_doc)
);