const fs = require("fs");

module.exports = {
    tarefaAtiva: (taskId) => {
        let registros = JSON.parse(fs.readFileSync(process.env.MODEL_LOCAL))
        return ( registros.ativo[taskId] || false )
    },
    tarefaInativa: (taskId) => {
        let registros = JSON.parse(fs.readFileSync(process.env.MODEL_LOCAL))
        return (registros.inativo[taskId] || false)
    },
    clienteAtivo: (telefone) => {
        let registros = JSON.parse(fs.readFileSync(process.env.MODEL_LOCAL))
        return ( registros.ativo[telefone] || false )
    },
    validaEnvioMensagem: function(body) {
        let registros = JSON.parse(fs.readFileSync(process.env.MODEL_LOCAL))
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