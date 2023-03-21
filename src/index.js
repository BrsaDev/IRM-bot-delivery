const express = require('express');
const { resetClientesConfigSet } = require("./utils/utils");
const { raiz, home, login, qr, qrcode, cadastrar, erro } = require('./routes/get')
const { initSession, closeSession, resetSenha, acessar, message } = require('./routes/post')

let port = process.env.PORT || 3000
const app = express()
app.use(express.urlencoded({ extended: false }))
app.use(express.json());
app.use(express.static('pages'))

let { conexaoClientes } = require('./model/conexaoClienteCache')

// rotas get 
app.get('/', raiz)
app.get('/home', home)
app.get('/qr', qr)
app.get('/get-qrcode', qrcode)
app.get('/erro', erro)
app.get('/cadastrar', cadastrar)
app.get('/login', login)

// rotas post
app.post('/iniciar-sessao', initSession)
app.post('/fechar-sessao', closeSession)
app.post('/reset-senha', resetSenha)
app.post('/acessar', acessar)
app.post('/message', message)

app.listen(port, ()=> { console.log('running app') })


process.on('SIGINT', (e) => {console.log(e); process.exit()})
process.on('SIGQUIT', (e) => {console.log(e); process.exit()})
process.on('SIGTERM', (e) => {console.log(e); process.exit()})
process.on('exit', (code) => {
    resetClientesConfigSet(Object.keys(conexaoClientes), { tipo1: "inicializado", tipo2: "autenticado", value: false })
    console.log('Fechando o processo com o código: ', code);
});
