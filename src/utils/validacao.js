const fs = require("fs")
const path = require('path')

module.exports = {
    tarefaAtiva: (taskId, config, idCliente) => {
        let registros = JSON.parse(fs.readFileSync(path.join(absolutePath(), config[idCliente].MODEL_LOCAL)))
        return ( registros.ativo[taskId] || false )
    },
    tarefaInativa: (taskId, config, idCliente) => {
        let registros = JSON.parse(fs.readFileSync(path.join(absolutePath(), config[idCliente].MODEL_LOCAL)))
        return (registros.inativo[taskId] || false)
    },
    clienteAtivo: (telefone, config) => {
        let registros = JSON.parse(fs.readFileSync(path.join(absolutePath(), config.MODEL_LOCAL)))
        return ( registros.ativo[telefone] || false )
    },
    validaEnvioMensagem: function(body, config, idCliente) {
        let registros = JSON.parse(fs.readFileSync(path.join(absolutePath(), config[idCliente].MODEL_LOCAL)))
        if ( typeof registros.ativo[body.task_id] == 'undefined' || typeof registros.ativo[body.task_id].limpar_msg_saida == 'undefined' ) var commentAtivo = false
        else {
            var commentAtivo = ( typeof body.history_items[0].comment.id == 'undefined' ? false : (registros.ativo[body.task_id].limpar_msg_saida[body.history_items[0].comment.id] || false) )
        }
        if (body.event == "taskCommentPosted" && body.history_items[0].comment.emails.length == 0 && body.history_items[0].field == "comment" && body.history_items[0].comment.user.username != "Integração" && !commentAtivo ) {
            return true
        }else {
            return false
        }
    }
}

function absolutePath() { return __dirname.replace('\\utils', '').replace('/utils', '') }
