const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require('qrcode-terminal');
const qrimage = require('qr-image');
const fs = require(`fs`);
const { clienteConfigSet, configGetCliente, deletarArquivo } = require("./utils/utils");
const { sendMessage } = require('./utils/utilsWhatsapp')
let stages = require("./model/stages")

const session = async function (idCliente) {
 
    const client = new Client({
        // restartOnAuthFail: true,
        // puppeteer: { executablePath: "/usr/bin/chromium" },
        authStrategy: new LocalAuth({
            clientId: idCliente
        }),
        puppeteer: {
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        }
    });
    console.log('iniciando o cliente ' + idCliente)

    client.initialize()
    clienteConfigSet(idCliente, { tipo: "inicializado", value: true })
    clienteConfigSet(idCliente, { tipo: "falha", value: false })

    client.on(`qr`, async (qr) => {
        // qrcode.generate(qr, { small: true });
        let timestamp = Number(new Date())
        let qr_svg = qrimage.image(qr, { type: 'svg' });
        qr_svg.pipe(fs.createWriteStream(`${__dirname}/pages/assets/qr-code-${ idCliente }-${ timestamp }.svg`))

        let configCliente = configGetCliente(idCliente) 
        deletarArquivo(`${__dirname}/pages/assets/${ configCliente.nome_qrcode }.svg`) 
        clienteConfigSet( idCliente, { tipo: "nome_qrcode", value: `qr-code-${ idCliente }-${ timestamp }` })
    });

    client.on(`authenticated`, (session) => {
        console.log(`Cliente [ ${ idCliente } ] autenticado.`)
        clienteConfigSet(idCliente, { tipo: "autenticado", value: true })
        let configCliente = configGetCliente(idCliente) 
        deletarArquivo(`${__dirname}/pages/assets/${ configCliente.nome_qrcode }.svg`)
    });

    client.on(`auth_failure`, (msg) => {
        console.log(`Houve uma falha com o cliente ${ idCliente }.\n[ MSG ] = auth_failure =>`, msg);
        clienteConfigSet(idCliente, { tipo: "falha", value: true })
    });

    client.on(`ready`, () => {
        console.log(`Cliente [ ${ idCliente } ] preparado para uso.`);
    });

    client.on(`disconnected`, (reason) => {
        console.log(`disconnected`, reason);
        client.destroy();
        client.initialize();
        clienteConfigSet(idCliente, { tipo: "autenticado", value: false })
    });

    client.on('message_ack', async (msg, ack) => {
        return
    })
    
    client.on(`message_create`, async msg => {
        if (msg.from == "status@broadcast" || msg.type == "e2e_notification" || msg.type == "protocol") return true
        let users = JSON.parse(fs.readFileSync(`${__dirname}/model/users.json`))
        if ( typeof users[msg.to.slice(2).replace('@c.us', '')] != 'undefined' && msg.from != msg.to ) { 
            console.log('\n\nmessage de ' + msg.from + ' para ' + msg.to + ' com a msg => ' + msg.body + '\n\n =>>>---', users[msg.to.slice(2).replace('@c.us', '')])
            await sendMessage(client, msg, users[msg.to.slice(2).replace('@c.us', '')])
            return true
        }

        let telClienteEmpresa = msg.to + msg.from.slice(2).replace('@c.us', '')
        if ( msg.body.toString().toLowerCase() == 'finalizar atendimento' && typeof stages[telClienteEmpresa] != 'undefined' ) {
            await client.sendMessage(msg.to, "Atendimento finalizado.")
            return true
        }
    });

    return client;
};

module.exports = session
