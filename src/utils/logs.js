const fs = require('fs')
const { dataHotaAtualSimples } = require('./utils')

module.exports = {
    createLogErroWhatsapp: function(modulo, erro, infoExtra=false) {
        let pathFile = `./src/logs/erros_${ modulo }.txt`
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
