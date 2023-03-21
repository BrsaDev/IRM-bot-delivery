const fs = require('fs')
const path  = require('path')

module.exports = {
    raiz: (req, res) => {
        return res.sendFile(path.join(absolutePath(), '/pages/home.html'))
    },
    home: (req, res) => {
        return res.sendFile(path.join(absolutePath(), '/pages/home.html'))
    },
    qr: (req, res) => {
        let { idCliente } = req.query
        if ( !idCliente || idCliente == "" ) return res.redirect('/login')
        return res.sendFile(path.join(absolutePath(), '/pages/qr.html'))
    },
    qrcode: (req, res) => {
        let { idCliente } = req.query
        let config = JSON.parse(fs.readFileSync(path.join(absolutePath(), '/model/config.json')))
        if ( fs.existsSync(`./../pages/assets/${ config[idCliente].nome_qrcode }.svg`) ) {
            return res.json({ nome_qrcode: config[idCliente].nome_qrcode, autenticado: config[idCliente].autenticado })
        }
        else return res.json({ nome_qrcode: false, autenticado: config[idCliente].autenticado })
    },
    erro: (req, res) => {
        let { tipo } = req.query
        return res.sendFile(path.join(absolutePath(), `/pages/erro/${ tipo }.html`))
    },
    cadastrar: (req, res) => {
        return res.sendFile(path.join(absolutePath(), "/pages/cadastrar.html"))
    },
    login: (req, res) => {
        return res.sendFile(path.join(absolutePath(), "/pages/login.html"))
    }
}

function absolutePath() { return __dirname.replace('\\routes', '').replace('/routes', '') }
