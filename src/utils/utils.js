const fs = require("fs");
const stages = require("../model/stages");
const path = require('path')

module.exports = {
    configGetCliente: (idCliente) => {
        let config = JSON.parse(fs.readFileSync(path.join(absolutePath(), '/model/config.json')))
        return config[idCliente] || false
    },
    clienteConfigSet: (idCliente, param) => {
        let config = JSON.parse(fs.readFileSync(path.join(absolutePath(), '/model/config.json')))
        if ( typeof config[idCliente] != 'undefined' ) config[idCliente][param.tipo] = param.value
        else {
            config = { ...config, [idCliente]: { nome_qrcode: "", autenticado: false, inicializado: false } }
            config[idCliente][param.tipo] = param.value
        }
        fs.writeFileSync(path.join(absolutePath(), '/model/config.json'), JSON.stringify(config))
        return true
    },
    deletarArquivo: (path) => { 
        console.log(path)
        if ( fs.existsSync(path)) { fs.unlinkSync(path); return true }
        else return false
    },
    resetClientesConfigSet: (idsCliente, param) => {
        let config = JSON.parse(fs.readFileSync(path.join(absolutePath(), '/model/config.json')))
        for ( let idCliente of idsCliente ) {
            config[idCliente][param.tipo1] = param.value
            config[idCliente][param.tipo2] = param.value
            let caminho = path.join(absolutePath(), '/pages/assets/') + config[idCliente].nome_qrcode + '.svg'
            if ( fs.existsSync(caminho) ) fs.unlinkSync(caminho)
        }
        fs.writeFileSync(path.join(absolutePath(), '/model/config.json'), JSON.stringify(config))
        return true
    }
}

function absolutePath() { return __dirname.replace('\\utils', '').replace('/utils', '') }
