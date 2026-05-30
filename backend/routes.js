const sql = require('./db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt'); // <-- Importamos o bcrypt aqui

// 1. REGISTRO / CADASTRO (Versão Corrigida e com Logs Avançados)
module.exports = (app) => {
app.post('/cadastro', async (req, res) => {
        try {
            const { nome, email, senha, perfil } = req.body;
            const EMAIL_TECNICO_OFICIAL = 'suporte.ti@cesarschool.com.br';

            if (!nome || !email || !senha || !perfil) {
                return res.status(400).json({ erro: 'Todos os campos são obrigatórios.' });
            }

            if (perfil === 'TECNICO' && email.toLowerCase() !== EMAIL_TECNICO_OFICIAL.toLowerCase()) {
                return res.status(403).json({ 
                    erro: 'Cadastro de técnico restrito ao e-mail oficial de suporte.' 
                });
            }

            const usuarioExistente = await sql.query`SELECT id FROM usuarios WHERE email = ${email}`;
            if (usuarioExistente.recordset.length > 0) {
                return res.status(400).json({ erro: 'Este e-mail já está em uso.' });
            }

            console.log("-> Gerando hash da senha...");
            const saltRounds = 8; // Um pouco mais rápido para evitar gargalo de hardware
            const senhaCriptografada = await bcrypt.hash(senha, saltRounds);
            
            console.log("-> Hash gerado com sucesso. Tamanho:", senhaCriptografada.length);
            console.log("-> Tentando inserir no SQL Server...");

            // Inserção explícita envolvendo a variável tratada
            await sql.query`
                INSERT INTO usuarios (nome, email, senha, perfil, created_at)
                VALUES (${nome}, ${email}, ${senhaCriptografada}, ${perfil}, GETDATE())
            `;

            console.log("-> Inserido com sucesso!");
            return res.status(201).json({ mensagem: 'Usuário cadastrado com sucesso!' });

        } catch (error) {
            // Se travar no banco, o erro vai aparecer aqui no terminal e a requisição NÃO vai carregar infinito
            console.error("❌ ERRO CRÍTICO NO CADASTRO:");
            console.error(error);
            
            return res.status(500).json({ 
                erro: 'Erro interno ao cadastrar usuário', 
                detalhe: error.message 
            });
        }
    });

    // 2. LOGIN (Protegido)
    app.post('/login', async (req, res) => {
        try {
            const { email, senha } = req.body;

            // 1º passo: Buscamos o usuário apenas pelo e-mail (trazendo a senha criptografada para comparar no Node)
            const result = await sql.query`
                SELECT id, nome, email, perfil, senha 
                FROM usuarios
                WHERE email = ${email}
            `;

            if (result.recordset.length === 0) {
                return res.status(401).json({ erro: 'Usuário ou senha inválidos' });
            }

            const usuario = result.recordset[0];

            // 2º passo: O bcrypt compara a senha digitada com o hash salvo no banco
            const senhaValida = await bcrypt.compare(senha, usuario.senha);

            if (!senhaValida) {
                return res.status(401).json({ erro: 'Usuário ou senha inválidos' });
            }

            // 3º passo: Removemos a senha do objeto 'usuario' antes de gerar o JSON de resposta
            delete usuario.senha;

            const token = jwt.sign(
                { id: usuario.id, perfil: usuario.perfil },
                process.env.JWT_SECRET || 'SECRET_RESERVA_FACULDADE', 
                { expiresIn: '1d' }
            );

            // Agora o objeto 'usuario' vai para o front-end 100% livre da senha
            res.json({ usuario, token });
        } catch (error) {
            console.log(error);
            res.status(500).json({ erro: 'Erro interno no login' });
        }
    });

    // 3. LISTAR CHAMADOS (GET) -> Ajustado com LEFT JOIN para prevenir falhas vazias
    app.get('/api/chamados', async (req, res) => {
        try {
            const usuarioIdRaw = req.headers['x-usuario-id'];
            const usuarioPerfil = req.headers['x-usuario-perfil'];

            if (!usuarioIdRaw || !usuarioPerfil) {
                return res.status(400).json({ erro: 'Informações de usuário ausentes no cabeçalho.' });
            }

            const idUsuarioTratado = parseInt(usuarioIdRaw, 10);
            let result;

            if (usuarioPerfil.toUpperCase() === 'TECNICO') {
                // Mudado para LEFT JOIN para não ignorar chamados sem usuário correspondente
                result = await sql.query`
                    SELECT c.*, u.nome as nome_solicitante 
                    FROM chamados c
                    LEFT JOIN usuarios u ON c.usuario_id = u.id
                    ORDER BY c.id DESC
                `;
            } else {
                result = await sql.query`
                    SELECT * FROM chamados 
                    WHERE usuario_id = ${idUsuarioTratado}
                    ORDER BY id DESC
                `;
            }

            res.json(result.recordset);
        } catch (error) {
            console.log(error);
            res.status(500).json({ erro: 'Erro ao buscar chamados' });
        }
    });

    // 4. CRIAR CHAMADO (POST) -> Centralizado na rota correta com tratamento de tipo INT
    app.post('/api/chamados', async (req, res) => {
        try {
            const { titulo, descricao, usuario_id } = req.body;

            if (!titulo || !descricao || !usuario_id) {
                return res.status(400).json({ erro: 'Título, descrição e id do usuário são obrigatórios.' });
            }

            const idUsuarioTratado = parseInt(usuario_id, 10);

            await sql.query`
                INSERT INTO chamados (titulo, descricao, usuario_id, status)
                VALUES (${titulo}, ${descricao}, ${idUsuarioTratado}, 'ABERTO')
            `;

            res.json({ mensagem: 'Chamado criado com sucesso!' });
        } catch (error) {
            console.log(error);
            res.status(500).json({ erro: 'Erro ao criar chamado' });
        }
    });

    // 5. ATUALIZAR STATUS (PUT) -> Agora mapeado corretamente com /api/
    app.put('/api/chamados/:id', async (req, res) => {
        try {
            const { status } = req.body;
            const chamadoId = req.params.id;

            await sql.query`
                UPDATE chamados
                SET status = ${status}
                WHERE id = ${chamadoId}
            `;

            res.json({ mensagem: 'Status do chamado atualizado com sucesso!' });
        } catch (error) {
            console.log(error);
            res.status(500).json({ erro: 'Erro ao atualizar chamado' });
        }
    });

    // 6. DELETAR (DELETE) -> Agora mapeado corretamente com /api/
    app.delete('/api/chamados/:id', async (req, res) => {
        try {
            const chamadoId = req.params.id;

            await sql.query`
                DELETE FROM chamados WHERE id = ${chamadoId}
            `;
            res.json({ mensagem: 'Chamado deletado com sucesso!' });
        } catch (error) {
            console.log(error);
            res.status(500).json({ erro: 'Erro ao deletar chamado' });
        }
    });
};