Documentação da API
Descrição

A API do Sistema de Chamados Técnicos foi desenvolvida para gerenciar solicitações de suporte técnico dentro da instituição.

O sistema permite:

Cadastro de usuários
Autenticação de usuários
Controle de perfis
Abertura de chamados
Atualização de chamados
Exclusão de chamados
Dashboard de indicadores
URL Base

Ambiente Local

http://localhost:3000
Tecnologias Utilizadas
Node.js
Express.js
SQL Server
JWT (JSON Web Token)
Bcrypt
Perfis de Usuário

O sistema possui três perfis:

Perfil	Descrição
CLIENTE	Abre e acompanha seus próprios chamados
TECNICO	Visualiza e atende chamados
ADMINISTRADOR	Gerencia chamados e visualiza indicadores
Autenticação

O sistema utiliza JSON Web Token (JWT) para gerar um token de acesso após o login do usuário.

O token contém informações do usuário autenticado, como identificador e perfil de acesso.

Exemplo de resposta:

{
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
Endpoints
Cadastro de Usuário
POST /cadastro

Cadastra um novo usuário no sistema.

Requisição
{
  "nome": "João",
  "email": "joao@email.com",
  "senha": "123456",
  "perfil": "CLIENTE"
}
Resposta de Sucesso
{
  "mensagem": "Usuário cadastrado com sucesso!"
}
Possíveis Erros
{
  "erro": "Este e-mail já está em uso."
}
{
  "erro": "Perfil de usuário inválido."
}
Login
POST /login

Realiza a autenticação do usuário.

Requisição
{
  "email": "joao@email.com",
  "senha": "123456"
}
Resposta de Sucesso
{
  "usuario": {
    "id": 1,
    "nome": "João",
    "email": "joao@email.com",
    "perfil": "CLIENTE"
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
Resposta de Erro
{
  "erro": "Usuário ou senha inválidos"
}
Listar Chamados
GET /api/chamados

Retorna os chamados cadastrados.

Cabeçalhos da Requisição
x-usuario-id: 1
x-usuario-perfil: CLIENTE
Resposta
[
  {
    "id": 1,
    "titulo": "Notebook quebrado",
    "descricao": "Tela azul",
    "status": "ABERTO",
    "usuario_id": 1
  }
]
Criar Chamado
POST /api/chamados

Cria um novo chamado.

Requisição
{
  "titulo": "Problema no computador",
  "descricao": "Tela travando",
  "usuario_id": 1
}
Resposta
{
  "mensagem": "Chamado criado com sucesso!"
}
Atualizar Chamado
PUT /api/chamados/

Atualiza o status de um chamado.

Requisição
{
  "status": "EM ATENDIMENTO"
}
Resposta
{
  "mensagem": "Status do chamado updated com sucesso!"
}
Excluir Chamado
DELETE /api/chamados/

Remove um chamado do sistema.

Resposta
{
  "mensagem": "Chamado deletado com sucesso!"
}
Dashboard de Indicadores
GET /api/dashboard/indicadores

Retorna os indicadores utilizados pelo administrador para acompanhamento da equipe de TI.

Resposta
{
  "total": 10,
  "abertos": 3,
  "emAndamento": 2,
  "concluidos": 5,
  "taxaResolucao": 50
}
Segurança

O sistema utiliza:

JWT para autenticação de usuários
Bcrypt para criptografia de senhas
Controle de perfis de acesso
Validação de e-mails institucionais para perfis privilegiados
Regras de Negócio
Um usuário pode abrir vários chamados.
Um chamado pertence a apenas um usuário.
Clientes visualizam apenas seus próprios chamados.
Técnicos visualizam todos os chamados cadastrados.
Administradores visualizam todos os chamados cadastrados.
Senhas são armazenadas criptografadas utilizando Bcrypt.
Apenas e-mails institucionais autorizados podem criar contas de Técnico e Administrador.
Todo chamado é criado inicialmente com o status ABERTO.
O dashboard exibe indicadores baseados nos chamados cadastrados no sistema.