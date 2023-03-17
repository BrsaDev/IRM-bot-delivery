const fs = require('fs')

module.exports = {
    raiz: (req, res) => {
        return res.sendFile(__dirname + '/pages/home.html')
    },
    home: (req, res) => {
        return res.sendFile(__dirname + '/pages/home.html')
    },
    qr: (req, res) => {
        let { idCliente } = req.query
        if ( !idCliente || idCliente == "" ) return res.redirect('/login')
        return res.sendFile(__dirname + '/pages/qr.html')
    },
    qrcode: (req, res) => {
        let { idCliente } = req.query
        let config = JSON.parse(fs.readFileSync(__dirname + '/model/config.json'))
        if ( fs.existsSync(`./pages/assets/${ config[idCliente].nome_qrcode }.svg`) ) {
            return res.json({ nome_qrcode: config[idCliente].nome_qrcode, autenticado: config[idCliente].autenticado })
        }
        else return res.json({ nome_qrcode: false, autenticado: config[idCliente].autenticado })
    },
    erro: (req, res) => {
        let { tipo } = req.query
        return res.sendFile(__dirname + `/pages/erro/${ tipo }.html`)
    },
    cadastrar: (req, res) => {
        return res.sendFile(__dirname + "/pages/cadastrar.html")
    },
    login: (req, res) => {
        return res.sendFile(__dirname + "/pages/login.html")
    }
}