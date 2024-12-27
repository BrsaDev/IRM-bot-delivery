const axios = require('axios')
const { clienteConfigSet, configGetCliente } = require("../utils/utils")
const session = require('../whatsapp')
let { conexaoClientes } = require('../model/conexaoClienteCache')
const fs = require('fs')
const path  = require('path')


const baseUrlApiGoogle = "https://script.google.com/macros/s/AKfycbxa1vxX7Nhw-fa6zeAfsZpWXW0a_7o3YYYOJdKoURxizgvfyU1coiewnRhPU_GyEkXo/exec"

module.exports = {
    message: async (req, res) => {
        let { idCliente } = req.query
        let config = JSON.parse(fs.readFileSync(path.join(absolutePath(), '/model/config.json')))
        if ( typeof conexaoClientes[idCliente] != 'undefined' ) {
            await receiverWebhookClickup(conexaoClientes[idCliente], req.body, idCliente, res, config[idCliente.slice(2)])
            return res.status(200).json({ retorno: { status: 'OK' } })
        }
        else {
            await whatsappOff(req.body, config[idCliente.slice(2)])
            return res.status(200).json({ retorno: { status: 'OK' } })
        }
    },
    initSession: async (req, res) => {
        let { idCliente } = req.body
        if ( typeof conexaoClientes[idCliente] == 'undefined' ) {
           conexaoClientes[idCliente] = await session(idCliente) 
        }        
        return res.json({ status: 'OK' })
    },
    closeSession: async (req, res) => {
        let { idCliente } = req.body
        clienteConfigSet(idCliente, { tipo: "inicializado", value: false })
        clienteConfigSet(idCliente, { tipo: "autenticado", value: false })
        await conexaoClientes[idCliente].logout()
        delete conexaoClientes[idCliente]
        return res.json({ status: 'OK' })
    },
    // resetSenha: async (req, res) => {
    //     let { email } = req.body
    //     let urlFinal = `?tipo=reset_senha&user=${ email }`
    //     let options = {
    //         method: "get",
    //         url: baseUrlApiGoogle + urlFinal,
    //         headers: { "Content-Type": "application/json", 'Accept': 'application/json' },
    //     }
    //     let response = await axios(options)
    //     return res.json({ status: response.data.status })
    // },
    acessar: async (req, res) => {
        let { pass, nome, telefone, tipo } = req.body
        if ( telefone == "" || pass == "" ) return res.redirect('/erro?tipo=' + tipo)
        let users = JSON.parse(fs.readFileSync(path.join(absolutePath(), '/model/users.json')))
        if ( tipo == "cadastrar" && typeof users[telefone] == 'undefined' ) { 
            users[telefone] = { telefone, senha: pass, user: nome }
            fs.writeFileSync(path.join(absolutePath(), '/model/users.json'), JSON.stringify(users))
            return res.json({cadastrado: true})
        }
        else if ( tipo == "cadastrar" && typeof users[telefone] != 'undefined' ) {
            return res.json({jaCadastrado: true})
        }
        if ( typeof users[telefone] != 'undefined' ) {}
        if ( typeof users[telefone] == 'undefined' ) return res.redirect('/erro?tipo=' + tipo)
        if ( typeof users[telefone] != 'undefined' && users[telefone].senha != pass ) return res.redirect('/erro?tipo=' + tipo)
        users[telefone].autorizado = true
        return res.json(users[telefone])        
    },
    checkUserConect: (req, res) => {
        try {
            let { idCliente } = req.body
            let config = configGetCliente(idCliente)
            if ( config.autenticado ) return res.json({ result: true })
            else return res.json({ result: false })
        }catch(erro) {
            return res.json({ erro })
        }
    },
    checkSendMessage: async (req, res) => {
        try {
            let { idCliente, msg } = req.body
            let response = await conexaoClientes[idCliente].sendMessage(idCliente+'@c.us', msg)
            return res.json({ result: "OK" })
        }catch(e) {
            return res.json({ result: false })
        }
    },
    editaTutorialCadastro: (req, res) => {
        let { posicao, page, tipo, value, extensaoImg } = req.body
        let config = JSON.parse(fs.readFileSync(path.join(absolutePath(), '/model/configPages.json')))
        if ( tipo == "imagem" ) {
            let oldImg = config[page][posicao][tipo]
            let pathOldImg = path.join(absolutePath(), "/pages" + oldImg)
            let newPathImg = path.join(absolutePath(), `/pages/assets/img-tutorial-${ posicao }.${ extensaoImg }`)
            if ( fs.existsSync(pathOldImg) && fs.existsSync(newPathImg) ) fs.unlinkSync(pathOldImg)
            config[page][posicao][tipo] = `/assets/img-tutorial-${ posicao }.${ extensaoImg }`
            fs.writeFile(newPathImg, value.replace("data:", "").replace(/^.+,/, ""), 'base64', (err) => {})
        }
        else config[page][posicao][tipo] = value
        fs.writeFileSync(path.join(absolutePath(), '/model/configPages.json'), JSON.stringify(config))
        return res.json({ result: "OK" })
    },
    receiverStatus: async (req, res) => {
        let configStatus = req.body
        let users = JSON.parse(fs.readFileSync(path.join(absolutePath(), `/model/users.json`)))
        if ( typeof configStatus.telefone == 'undefined ' ) return res.status(200).json({resultado: "Necessário enviar o telefone."})
        if ( typeof users[configStatus.telefone] != 'undefined' ) {
            users[configStatus.telefone].pedidos[configStatus.numero_pedido] = {status: configStatus.status}
            fs.writeFileSync(path.join(absolutePath(), '/model/users.json'), JSON.stringify(users))
            return res.status(200).json({resultado: "Status atualizado com sucesso!"})
        }else {
            return res.status(200).json({resultado: "Crie primeiro um usuário!"})
        }
    },
    setInformationsUser: async (req, res) => {
        let configUser = req.body
        let users = JSON.parse(fs.readFileSync(path.join(absolutePath(), `/model/users.json`)))
        if ( typeof configUser.telefone == 'undefined ' ) return res.status(200).json({resultado: "Necessário enviar o telefone."})
        if ( typeof users[configUser.telefone] == 'undefined' ) {
            users[configUser.telefone] = {
                "telefone": configUser.telefone,
                "senha": configUser.senha,
                "user": configUser.usuario,
                "pedidos": {},
                "0": `${configUser.mensagem_principal}\n1 -Pedido;\n2 - Cardapio;\n3 - Horario de Funcionamento;\n4 - Tempo e Taxa de Entrega;\n5 - Endereço;\n6 - Falar Com Atendente;\n\n${configUser.mensagem_rodape}`,
                "2": configUser.R2,
                "3": configUser.R3,
                "4": configUser.R4,
                "5": configUser.R5,
                "6": "Ok! Estou direcionando para um atendente humano.\nA qualquer momento digite *sair* para voltar ao início.",
                "mensagem_principal": configUser.mensagem_principal,
                "mensagem_topo": configUser.mensagem_topo,
                "mensagem_rodape": configUser.mensagem_rodape,
                "mensagem_cardapio": configUser.mensagem_cardapio
            }
            fs.writeFileSync(path.join(absolutePath(), '/model/users.json'), JSON.stringify(users))
            return res.status(200).json({resultado: "Usuário configurado com sucesso!"})
        }else {
            return res.status(200).json({resultado: "Usuário já inserido!"})
        }
    }
}

function absolutePath() { return __dirname.replace('\\routes', '').replace('/routes', '') }









