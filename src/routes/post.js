const axios = require('axios')
const { gerarIdCliente, clienteConfigSet } = require("../utils/utils")
const session = require('../whatsapp')


const baseUrlApiGoogle = "https://script.google.com/macros/s/AKfycbyRhhah_kW0xmzpkSaV_5gxwZkmCIwt7cHAqR9nIbVGIEEjkwi8JVLUaRD1XwyQ0k0mbw/exec"

module.exports = {
    initSession: (req, res) => {
        let { idCliente } = req.body
        conexaoClientes[idCliente] = session(idCliente)
        return res.json({ status: 'OK' })
    },
    closeSession: async (req, res) => {
        let { idCliente } = req.body
        clienteConfigSet(idCliente, { tipo: "inicializado", value: false })
        clienteConfigSet(idCliente, { tipo: "autenticado", value: false })
        await conexaoClientes[idCliente].logout()
        return res.json({ status: 'OK' })
    },
    resetSenha: async (req, res) => {
        let { email } = req.body
        let urlFinal = `?tipo=reset_senha&user=${ email }`
        let options = {
            method: "get",
            url: baseUrlApiGoogle + urlFinal,
            headers: { "Content-Type": "application/json", 'Accept': 'application/json' },
        }
        let response = await axios(options)
        return res.json({ status: response.data.status })
    },
    acessar: async (req, res) => {
        let { email, pass, nome, telefone, tipo } = req.body
        if ( email == "" || pass == "" ) return res.redirect('/erro?tipo=' + tipo)
        let urlFinal = `?tipo=${ tipo }&user=${ email }&senha=${ pass }`
        if ( tipo == "cadastrar" ) { 
            let newIdCliente = gerarIdCliente()
            urlFinal = `?tipo=${ tipo }&user=${ email }&senha=${ pass }&nome=${ nome }&telefone=${ telefone }&idCliente=${ newIdCliente }`
        }
        let options = {
            method: "get",
            url: baseUrlApiGoogle + urlFinal,
            headers: { "Content-Type": "application/json", 'Accept': 'application/json' },
        }
        let response = await axios(options)
        if ( response.erro ) return res.redirect('/erro?tipo=' + tipo)
        return res.json(response.data)        
        // if ( tipo == "cadastrar" ) return res.json(response.data)
        // else {
        //     let configCliente = configGetCliente(response.data.idCliente)
        //     if ( response.data.autorizado && !configCliente.inicializado ) {
        //         conexaoClientes[response.data.idCliente] = session(response.data.idCliente)
        //         return res.json(response.data)
        //     }
        //     if ( configCliente.inicializado ) return res.json(response.data)
        // }
    }
}