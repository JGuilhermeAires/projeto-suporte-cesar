istema de Chamados Técnicos
👥 Integrantes
João Guilherme Aires Chagas de Oliveira (@JGuilhermeAires)
🏫 Instituição

CESAR School

📌 Descrição do Projeto

O Sistema de Chamados Técnicos tem como objetivo facilitar a comunicação entre os usuários da instituição e a equipe de Tecnologia da Informação (TI).

Através da plataforma, professores, alunos e funcionários podem registrar chamados técnicos para relatar problemas, solicitar suporte ou comunicar incidentes relacionados aos recursos tecnológicos da instituição.

Os chamados são encaminhados aos técnicos de TI, responsáveis pelo atendimento e resolução das solicitações. Além disso, administradores possuem acesso a indicadores e dashboards que permitem acompanhar o desempenho da equipe de suporte.

🚀 Entrega Única
📋 Histórias de Usuário
Quadro Trello contendo as histórias de usuário e o acompanhamento do desenvolvimento.
📄 Clique aqui para acessar o Trello
🎨 Protótipo do Sistema
Protótipo desenvolvido no Figma com base nos requisitos levantados.
🎨 Clique aqui para acessar o protótipo
👤 Perfis de Usuário
Cliente
Abrir chamados técnicos.
Consultar seus chamados.
Acompanhar o andamento das solicitações.
Técnico
Visualizar chamados.
Atualizar status dos chamados.
Atender solicitações dos usuários.
Administrador
Visualizar todos os chamados.
Acompanhar indicadores da equipe.
Monitorar o desempenho do suporte técnico.
⚙️ Tecnologias Utilizadas
Backend
Node.js
Express.js
JWT
Bcrypt
Banco de Dados
SQL Server
Mobile
React Native
Expo
Ferramentas
Visual Studio Code
SQL Server Management Studio (SSMS)
GitHub
🗄️ Banco de Dados
Entidades
Usuário
id
nome
email
senha
perfil
created_at
Chamado
id
titulo
descricao
status
usuario_id
created_at
Relacionamento
USUÁRIO (1) -------- (N) CHAMADO

Um usuário pode abrir vários chamados e cada chamado pertence a apenas um usuário.

📖 Documentação da API

A documentação completa da API encontra-se no arquivo:

API.md
🎥 Screencast do Sistema
Vídeo demonstrando o funcionamento completo da aplicação.
🎥 Clique aqui para assistir
🚀 Como Executar o Projeto
Backend
cd backend

npm install

node server.js

Servidor disponível em:

http://localhost:3000
Mobile
cd mobile

npm install

npx expo start

Após iniciar o Expo:

Abrir o aplicativo Expo Go no celular.
Escanear o QR Code gerado.
Utilizar o sistema normalmente.
🔐 Segurança

O sistema utiliza:

JWT para autenticação de usuários.
Bcrypt para criptografia de senhas.
Controle de perfis de acesso.
Validação de e-mails institucionais para perfis privilegiados.
📄 Licença

Projeto acadêmico desenvolvido para a disciplina de Projeto Integrador da CESAR School.
