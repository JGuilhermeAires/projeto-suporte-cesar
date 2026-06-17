Sistema de Chamados Técnicos
👥 Integrantes
João Guilherme Aires Chagas de Oliveira (@JGuilhermeAires)
🏫 Instituição

CESAR School

📌 Descrição do Projeto

O Sistema de Chamados Técnicos foi desenvolvido para facilitar a comunicação entre os usuários da instituição e a equipe de Tecnologia da Informação (TI).

Através da plataforma, professores, alunos e funcionários podem registrar chamados técnicos para relatar problemas, solicitar suporte ou comunicar incidentes relacionados aos recursos tecnológicos da instituição.

Os chamados são encaminhados aos técnicos de TI, responsáveis pelo atendimento e resolução das solicitações. Além disso, administradores possuem acesso a indicadores e dashboards que permitem acompanhar o desempenho da equipe de suporte.

🚀 Entrega Única
📋 Histórias de Usuário

Quadro Trello contendo as histórias de usuário e o acompanhamento do desenvolvimento.

📄 Trello:
https://trello.com/invite/b/6a32e92356b984f074cd9c32/ATTI5c947b7dd9880b1efcf36752204f64b7463E1060/sistema-de-chamadas-tecnicas

🎨 Protótipo do Sistema

Protótipo desenvolvido no Figma com base nos requisitos levantados.

🎨 Link do Figma:
[INSERIR LINK DO FIGMA]

🏗️ Arquitetura do Sistema

O projeto é composto por:

Aplicação Mobile

Responsável pela interação com o usuário, abertura e acompanhamento de chamados.

API Backend

Responsável pelas regras de negócio, autenticação, gerenciamento dos usuários e chamados.

Banco de Dados

Responsável pela persistência das informações dos usuários e chamados técnicos.

👤 Perfis de Usuário
Cliente
Abrir chamados
Consultar seus chamados
Técnico
Visualizar chamados
Atualizar status dos chamados
Atender solicitações
Administrador
Visualizar todos os chamados
Acompanhar indicadores
Monitorar o desempenho da equipe
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
Entidades Principais
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

Um usuário pode abrir vários chamados.

Um chamado pertence a apenas um usuário.

📖 Documentação da API

A documentação completa da API encontra-se no arquivo:

API.md
🎥 Screencast do Sistema

Vídeo demonstrando o funcionamento completo da aplicação.

🎥 YouTube:
https://youtu.be/JH0xc3G2aQQ

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

Abrir o aplicativo Expo Go.
Escanear o QR Code.
Utilizar o sistema normalmente.
🔐 Segurança

O sistema utiliza:

JWT para autenticação
Bcrypt para criptografia de senhas
Controle de perfis de acesso
Validação de e-mails institucionais para perfis privilegiados
📄 Licença

Projeto acadêmico desenvolvido para a disciplina de Projeto Integrador da CESAR School.
