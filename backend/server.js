const express = require('express');
const cors = require('cors');

const app = express();

require('./db');

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.json({
        mensagem: 'API funcionando'
    });
});

require('./routes')(app);

app.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');
});