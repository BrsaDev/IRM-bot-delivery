const express = require('express');
const { resetClientesConfigSet } = require("./utils/utils");
const { raiz, home, login, qr, qrcode, cadastrar, erro } = require('./routes/get')
const { initSession, closeSession, receiverStatus, setInformationsUser, acessar, message, checkUserConect, checkSendMessage } = require('./routes/post')

let port = process.env.PORT || 3000
const app = express()
// app.use(express.limit(100000000));
app.use(express.urlencoded({ extended: false, limit: '50mb' }))
app.use(express.json({limit: '50mb'}));
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
app.post('/acessar', acessar)
app.post('/message', message)
app.post('/checkUserConect', checkUserConect)
app.post('/checkSendMessage', checkSendMessage)
app.post('/receiver-status', receiverStatus)
app.post('/criate-user', setInformationsUser)

app.listen(port, ()=> { console.log('Rodando as rotas na porta: ' + port) })


process.on('SIGINT', (e) => {console.log(e); process.exit()})
process.on('SIGQUIT', (e) => {console.log(e); process.exit()})
process.on('SIGTERM', (e) => {console.log(e); process.exit()})
process.on('exit', (code) => {
    if ( Object.keys(conexaoClientes).length > 0 ) {
        console.log(Object.keys(conexaoClientes))
       resetClientesConfigSet(Object.keys(conexaoClientes), { tipo1: "inicializado", tipo2: "autenticado", value: false }) 
    }    
    console.log('Fechando o processo com o código: ', code);
});
