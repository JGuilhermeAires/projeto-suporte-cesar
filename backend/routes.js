const sql = require('./db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt'); // <-- Importamos o bcrypt aqui

// EXPORTAÇÃO DA FUNÇÃO QUE RECEBE O 'APP' DO SERVER.JS
module.exports = function(app) {

    // 1. REGISTRO / CADASTRO (Versão com perfil ADMINISTRADOR)
    app.post('/cadastro', async (req, res) => {
        try {
            // Pega os dados e já limpa os espaços do e-mail
            const nome = req.body.nome;
            const email = req.body.email ? req.body.email.trim().toLowerCase() : '';
            const senha = req.body.senha;
            const perfil = req.body.perfil ? req.body.perfil.toUpperCase() : 'CLIENTE';

            const EMAIL_TECNICO_OFICIAL = 'suporte.ti@cesarschool.com.br';
            const EMAIL_ADMIN_OFICIAL = 'diretoria.ti@cesarschool.com.br';

            if (!nome || !email || !senha || !perfil) {
                return res.status(400).json({ erro: 'Todos os campos são obrigatórios.' });
            }

            const perfisValidos = ['CLIENTE', 'TECNICO', 'ADMINISTRADOR'];
            if (!perfisValidos.includes(perfil)) {
                return res.status(400).json({ erro: 'Perfil de usuário inválido.' });
            }

            if (perfil === 'TECNICO' && email !== EMAIL_TECNICO_OFICIAL) {
                return res.status(403).json({ 
                    erro: 'Cadastro de técnico restrito ao e-mail oficial de suporte.' 
                });
            }

            if (perfil === 'ADMINISTRADOR' && email !== EMAIL_ADMIN_OFICIAL) {
                return res.status(403).json({ 
                    erro: 'Cadastro de administrador restrito ao e-mail oficial da diretoria.' 
                });
            }

            // Verifica se o usuário já existe
            const usuarioExistente = await sql.query`SELECT id FROM usuarios WHERE email = ${email}`;
            if (usuarioExistente.recordset.length > 0) {
                return res.status(400).json({ erro: 'Este e-mail já está em uso.' });
            }

            // Criptografa a senha antes de salvar
            const saltRounds = 8;
            const senhaCriptografada = await bcrypt.hash(senha, saltRounds);
            
            // Grava de fato o novo usuário no Banco de Dados
            await sql.query`
                INSERT INTO usuarios (nome, email, senha, perfil, created_at)
                VALUES (${nome}, ${email}, ${senhaCriptografada}, ${perfil}, GETDATE())
            `;

            return res.status(201).json({ mensagem: 'Usuário cadastrado com sucesso!' });

        } catch (error) {
            console.error("❌ Erro no cadastro:", error);
            return res.status(500).json({ erro: 'Erro interno ao cadastrar usuário' });
        }
    });

    // 2. LOGIN (Protegido)
    app.post('/login', async (req, res) => {
        try {
            const { email, senha } = req.body;

            // 1º passo: Buscamos o usuário apenas pelo e-mail
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

            // 3º passo: Removemos a senha do objeto antes do envio
            delete usuario.senha;

            const token = jwt.sign(
                { id: usuario.id, perfil: usuario.perfil },
                process.env.JWT_SECRET || 'SECRET_RESERVA_FACULDADE', 
                { expiresIn: '1d' }
            );

            res.json({ usuario, token });
        } catch (error) {
            console.log(error);
            res.status(500).json({ erro: 'Erro interno no login' });
        }
    });

    // 3. LISTAR CHAMADOS (GET)
    app.get('/api/chamados', async (req, res) => {
        try {
            const usuarioIdRaw = req.headers['x-usuario-id'];
            const usuarioPerfil = req.headers['x-usuario-perfil'];

            if (!usuarioIdRaw || !usuarioPerfil) {
                return res.status(400).json({ erro: 'Informações de usuário ausentes no cabeçalho.' });
            }

            const idUsuarioTratado = parseInt(usuarioIdRaw, 10);
            let result;

            if (usuarioPerfil.toUpperCase() === 'TECNICO' || usuarioPerfil.toUpperCase() === 'ADMINISTRADOR') {
                // Admin e Técnico visualizam a fila inteira de chamados
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

    // 4. CRIAR CHAMADO (POST)
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

    // 5. ATUALIZAR STATUS (PUT)
    app.put('/api/chamados/:id', async (req, res) => {
        try {
            const { status } = req.body;
            const chamadoId = req.params.id;

            await sql.query`
                UPDATE chamados
                SET status = ${status}
                WHERE id = ${chamadoId}
            `;

            res.json({ mensagem: 'Status do chamado updated com sucesso!' });
        } catch (error) {
            console.log(error);
            res.status(500).json({ erro: 'Erro ao atualizar chamado' });
        }
    });

    // 6. DELETAR (DELETE)
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

    // 7. DASHBOARD / INDICADORES (GET)
    app.get('/api/dashboard/indicadores', async (req, res) => {
        try {
            const result = await sql.query`
                SELECT 
                    COUNT(*) as total,
                    SUM(CASE WHEN status = 'ABERTO' THEN 1 ELSE 0 END) as abertos,
                    SUM(CASE WHEN status = 'EM ATENDIMENTO' THEN 1 ELSE 0 END) as em_andamento,
                    SUM(CASE WHEN status = 'CONCLUÍDO' THEN 1 ELSE 0 END) as concluidos
                FROM chamados
            `;

            const dados = result.recordset[0];
            
            const total = dados.total || 0;
            const abertos = dados.abertos || 0;
            const emAndamento = dados.em_andamento || 0;
            const concluidos = dados.concluidos || 0;

            const taxaResolucao = total > 0 ? Math.round((concluidos / total) * 100) : 0;

            res.json({
                total,
                abertos,
                emAndamento,
                concluidos,
                taxaResolucao
            });

        } catch (error) {
            console.error("❌ Erro ao buscar indicadores do dashboard:", error);
            res.status(500).json({ erro: 'Erro ao carregar indicadores' });
        }
    });

}; // <-- FECHAMENTO DA FUNÇÃO EXPORTADA