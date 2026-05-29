const sql = require('./db');
const jwt = require('jsonwebtoken');

module.exports = (app) => {

    // REGISTRO / CADASTRO (Adicionado aqui junto com as suas outras rotas)
    app.post('/cadastro', async (req, res) => {
        try {
            const { nome, email, senha, perfil } = req.body;
            const EMAIL_TECNICO_OFICIAL = 'suporte.ti@cesarschool.com.br';

            if (!nome || !email || !senha || !perfil) {
                return res.status(400).json({ erro: 'Todos os campos são obrigatórios.' });
            }

            // Regra do Técnico Único da Cesar School
            if (perfil === 'TECNICO' && email.toLowerCase() !== EMAIL_TECNICO_OFICIAL.toLowerCase()) {
                return res.status(403).json({ 
                    erro: 'Cadastro de técnico restrito ao e-mail oficial de suporte.' 
                });
            }

            const usuarioExistente = await sql.query`SELECT id FROM usuarios WHERE email = ${email}`;
            if (usuarioExistente.recordset.length > 0) {
                return res.status(400).json({ erro: 'Este e-mail já está em uso.' });
            }

            await sql.query`
                INSERT INTO usuarios (nome, email, senha, perfil, created_at)
                VALUES (${nome}, ${email}, ${senha}, ${perfil}, GETDATE())
            `;

            res.status(201).json({ mensagem: 'Usuário cadastrado com sucesso!' });
        } catch (error) {
            console.log(error);
            res.status(500).json({ erro: 'Erro ao cadastrar usuário' });
        }
    });

    // LOGIN (Atualizado para injetar o perfil no JWT)
    app.post('/login', async (req, res) => {
        try {
            const { email, senha } = req.body;

            const result = await sql.query`
                SELECT id, nome, email, perfil 
                FROM usuarios
                WHERE email = ${email}
                AND senha = ${senha}
            `;

            if (result.recordset.length === 0) {
                return res.status(401).json({ erro: 'Usuário ou senha inválidos' });
            }

            const usuario = result.recordset[0];

            // Colocamos o id e o perfil dentro do Token para o app usar depois
            const token = jwt.sign(
                {
                    id: usuario.id,
                    perfil: usuario.perfil 
                },
                process.env.JWT_SECRET || 'SECRET_RESERVA_FACULDADE', // Fallback caso não tenha .env
                { expiresIn: '1d' }
            );

            res.json({
                usuario,
                token
            });
        } catch (error) {
            console.log(error);
            res.status(500).json({ erro: 'Erro interno' });
        }
    });

    // LISTAR CHAMADOS (Inteligente: Técnico vê tudo / Comunidade vê só os seus)
   app.get('/api/chamados', async (req, res) => {
    try {
        // O Express lê os headers sempre em letras minúsculas
        const usuarioIdRaw = req.headers['x-usuario-id'];
        const usuarioPerfil = req.headers['x-usuario-perfil'];

        if (!usuarioIdRaw || !usuarioPerfil) {
            return res.status(400).json({ erro: 'Informações de usuário ausentes no cabeçalho.' });
        }

        // 🌟 O PULO DO GATO: Converte para número inteiro para casar com o INT do banco
        const idUsuarioTratado = parseInt(usuarioIdRaw, 10);

        let result;

        if (usuarioPerfil === 'TECNICO') {
            // Técnico vê tudo
            result = await sql.query`
                SELECT c.*, u.nome as nome_solicitante 
                FROM chamados c
                JOIN usuarios u ON c.usuario_id = u.id
                ORDER BY c.id DESC
            `;
        } else {
            // Cliente vê apenas os dele usando o ID convertido para Inteiro
            result = await sql.query`
                SELECT * FROM chamados 
                WHERE usuario_id = ${idUsuarioTratado}
                ORDER BY id DESC
            `;
        }

        // Print no terminal do back-end para você ver o que está saindo do banco
        console.log(`[API] Chamados encontrados para o ID ${idUsuarioTratado}:`, result.recordset.length);

        res.json(result.recordset);
    } catch (error) {
        console.log(error);
        res.status(500).json({ erro: 'Erro ao buscar chamados' });
    }
});
    // CRIAR CHAMADO
    app.post('/chamados', async (req, res) => {
        try {
            const { titulo, descricao, usuario_id } = req.body;

            // Dica: Adicione campos de prédio/sala futuramente se achar necessário!
            await sql.query`
                INSERT INTO chamados (titulo, descricao, usuario_id, status)
                VALUES (${titulo}, ${descricao}, ${usuario_id}, 'ABERTO')
            `;

            res.json({ mensagem: 'Chamado criado com sucesso!' });
        } catch (error) {
            console.log(error);
            res.status(500).json({ erro: 'Erro ao criar chamado' });
        }
    });

    // ATUALIZAR STATUS (Para o Técnico mudar de 'ABERTO' para 'EM ATENDIMENTO' ou 'CONCLUÍDO')
    app.put('/chamados/:id', async (req, res) => {
        try {
            const { status } = req.body;

            await sql.query`
                UPDATE chamados
                SET status = ${status}
                WHERE id = ${req.params.id}
            `;

            res.json({ mensagem: 'Status do chamado atualizado!' });
        } catch (error) {
            console.log(error);
            res.status(500).json({ erro: 'Erro ao atualizar chamado' });
        }
    });

    // DELETAR
    app.delete('/chamados/:id', async (req, res) => {
        try {
            await sql.query`
                DELETE FROM chamados WHERE id = ${req.params.id}
            `;
            res.json({ mensagem: 'Chamado deletado com sucesso' });
        } catch (error) {
            console.log(error);
            res.status(500).json({ erro: 'Erro ao deletar chamado' });
        }
    });
    app.post('/api/chamados', async (req, res) => {
    try {
        const { titulo, descricao, usuario_id } = req.body;

        // Força a conversão para número inteiro para não quebrar a FOREIGN KEY do SQL Server
        const idUsuarioTratado = parseInt(usuario_id, 10);

        await sql.query`
            INSERT INTO chamados (titulo, descricao, usuario_id, status)
            VALUES (${titulo}, ${descricao}, ${idUsuarioTratado}, 'ABERTO')
        `;

        res.json({ mensagem: 'Chamado criado' });
    } catch(error){
        console.log(error);
        res.status(500).json({ erro: 'Erro ao criar chamado' });
    }
});
};