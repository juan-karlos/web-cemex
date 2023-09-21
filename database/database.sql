CREATE DATABASE IF NOT EXISTS cemex;

use cemex;

create table Historial(
id_historial int not null auto_increment,
segmento nvarchar (100),
zona nvarchar(50),
cumplimiento nvarchar(250),
fecha datetime,
primary key (id_historial)
);

Create Table Usuarios
(
id_usuario INT NOT NULL AUTO_INCREMENT,
correo_electronico nvarchar (50) not null,
nombre_usuario Nvarchar(50) not null,
apellidos nvarchar (50) not null,
contrasena Nvarchar(120) not null,
primary key (id_usuario),
UNIQUE(correo_electronico) 
);

Create table Unidad_Operativa
(
id_planta INT NOT NULL AUTO_INCREMENT,
nombre_planta nvarchar(100),
segmento nvarchar(100),
zona nvarchar(100),
Estado nvarchar(100),
porcentaje_cumplimiento nvarchar (150),
fija boolean,
primary key (id_planta),
UNIQUE(Nombre_planta)
);

create table Requerimiento
(
id_requerimiento int not null auto_increment,
nombre_requerimiento nvarchar(250),
peso int,
impacto nvarchar(100),
siglas nvarchar(50),
primary key (id_requerimiento),
unique (nombre_requerimiento)
);



create table Registro
(
id_registro INT NOT NULL AUTO_INCREMENT,
id_requerimiento INT,
id_planta INT,
fecha_inicio datetime,
fecha_vencimiento datetime,
observaciones nvarchar(250),
estatus nvarchar (150),
url Nvarchar(250), 
validez_unica boolean,
foreign key (id_planta) references Unidad_Operativa(id_planta) , 
foreign key (id_requerimiento) references requerimiento(id_requerimiento),
primary key (id_registro)
    
);