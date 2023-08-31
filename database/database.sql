CREATE DATABASE IF NOT EXISTS cemex;

use cemex;
Create Table usuarios

(
id_usuario INT NOT NULL AUTO_INCREMENT,
correo_electronico nvarchar (50) not null,
Nombre_usuario Nvarchar(50) not null,
contrasena Nvarchar(120) not null,
primary key (id_usuario),
UNIQUE(correo_electronico)
);

Create table Unidad_Operativa
(
id_planta INT NOT NULL AUTO_INCREMENT,
Nombre_planta nvarchar(100),
Segmento nvarchar(100),
Zona nvarchar(100),
Estado nvarchar(100),
    
porcentaje_cumplimiento nvarchar (150),
fija boolean,
primary key (id_planta),
UNIQUE(Nombre_planta)
);

create table requerimiento
(
id_requerimiento int not null auto_increment,
nom_req nvarchar(250),

peso int,
impacto nvarchar(100),

siglas nvarchar(50),
primary key (id_requerimiento),
unique (nom_req)
);

create table registro
(
id_registro INT NOT NULL AUTO_INCREMENT,
id_requerimiento INT,
id_planta INT,
fecha_inicio datetime,
fecha_vencimiento datetime,
observaciones nvarchar(250),
Estatus nvarchar (150),
url Nvarchar(250),
	foreign key (id_planta) references Unidad_Operativa(id_planta) , 
    foreign key (id_requerimiento) references requerimiento(id_requerimiento),
primary key (id_registro)
    
);

