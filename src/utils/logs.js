const fs = require('fs')
const { dataHotaAtualSimples } = require('./utils')
const path = require('path')

module.exports = {
    createLogErroWhatsapp: function(modulo, erro, infoExtra=false) {
        let pathFile = path.join(absolutePath(), `/logs/erros_${ modulo }.txt`)
        let logsOld = fs.readFileSync(pathFile)
        logsOld += `\n ---> [ DATA ]  ${ dataHotaAtualSimples() }\n`
        const myConsole = new console.Console(fs.createWriteStream(pathFile));
        if ( infoExtra ) {
            myConsole.log(logsOld, '---> [ INFO EXTRA ] ', infoExtra,'\n\n', '---> [ ERRO ] ', erro, "\n\n-----------------------------------------------------------------------------------");
        }else {
            myConsole.log(logsOld, '---> [ ERRO ] ', erro, "\n\n-----------------------------------------------------------------------------------");
        }
        return true
    }
}

function absolutePath() { return __dirname.replace('\\utils', '').replace('/utils', '') }

