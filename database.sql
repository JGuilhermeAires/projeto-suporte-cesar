CREATE DATABASE sistema_chamados;
GO
USE sistema_chamados;
GO
CREATE TABLE usuarios
        (
                id         INT PRIMARY KEY IDENTITY(1,1),
                nome       VARCHAR(100) NOT NULL        ,
                email      VARCHAR(100) UNIQUE NOT NULL ,
                senha      VARCHAR(255) NOT NULL        ,
                created_at DATETIME DEFAULT GETDATE()
        )
;
CREATE TABLE chamados
        (
                id         INT PRIMARY KEY IDENTITY(1,1),
                titulo     VARCHAR(200) NOT NULL        ,
                descricao  VARCHAR(500)                 ,
                status     VARCHAR(50) DEFAULT 'ABERTO' ,
                usuario_id INT                          ,
                created_at DATETIME DEFAULT GETDATE()   ,
                FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
        )
ALTER TABLE usuarios ADD perfil VARCHAR(20) NOT NULL DEFAULT 'CLIENTE';
ALTER TABLE usuarios
ALTER COLUMN senha VARCHAR(255) NOT NULL;