const { enviarMensagem, criarTarefa, addTagTarefa, getStatusWebhook, atualizarWebhook, postAttachmentTarefa } = require("../services/requests.js");
const { ativarTarefa, ativarCliente, deletarArquivo, sleep, dataHotaAtualSimples } = require("./utils.js");
const { clienteAtivo } = require("./validacao");
const { createLogErroWhatsapp } = require('./logs')

var clienteTemp = {}

module.exports = {
    sendMessage: async () => {
        if (msg.from == "status@broadcast" || msg.type == "e2e_notification" || msg.type == "protocol") return true
        if (msg.body == "status webhook") {
            let resultWebhook = await getStatusWebhook()
            await msg.reply(`*id:* ${resultWebhook.id}\n*status:* ${resultWebhook.status}`)
            return true
        }
        if (msg.body == "ativar webhook") {
            let resultWebhook = await getStatusWebhook()
            let resultAtualizarWebhook = await atualizarWebhook(resultWebhook)
            await msg.reply(`*id:* ${resultAtualizarWebhook.webhook.id}\n*status:*${resultAtualizarWebhook.webhook.health.status}`)
            return true
        }

        let nomeCliente = (typeof msg._data.notifyName == "undefined" ? "Sem Nome" : msg._data.notifyName)
        var cliente = clienteAtivo(msg.from)

        if (!cliente && typeof clienteTemp[msg.from] == 'undefined') {
            clienteTemp[msg.from] = true
            let newTask = await criarTarefa(process.env.ID_LISTA_CLIENTES, msg.from.toString().slice(2, -5) + "-" + nomeCliente, `Detalhes da solicitação do cliente: `, msg.from.toString().slice(2, -5))
            if (newTask.erro) {

                await client.sendMessage(process.env.TELEFONE_NOTIFICACAO, `*** ATENÇÃO: MSG DO SISTEMA ***\n😞Erro ao criar nova tarefa no ClickUp😞\n*${msg.from.slice(2).replace('@c.us', '')}*\nMSG enviada pelo remetente no WhatsApp\n👇👇👇👇👇👇👇`)
                if (msg.hasMedia) {
                    const attachmentData = await msg.downloadMedia();
                    createLogErroWhatsapp('whatsapp', newTask.erro, { cliente: msg.from, msg: "Msg foi um arquivo enviado" })
                    await client.sendMessage(process.env.TELEFONE_NOTIFICACAO, attachmentData, { sendAudioAsVoice: true })
                } else {
                    createLogErroWhatsapp('whatsapp', newTask.erro, { cliente: msg.from, msg: msg.body })
                    await client.sendMessage(process.env.TELEFONE_NOTIFICACAO, msg.body)
                }
                return false
            }
            newTask.configTask.user = msg.from
            ativarTarefa(newTask.taskId, newTask.configTask)
            ativarCliente(msg.from, newTask.taskId)
            cliente = clienteAtivo(msg.from)
        } else {
            await sleep(5000)
            cliente = clienteAtivo(msg.from)
            if (!cliente) {
                await sleep(2000)
                cliente = clienteAtivo(msg.from)
            }
            if (cliente && typeof clienteTemp[msg.from] != 'undefined') delete clienteTemp[msg.from]
        }

        if (msg.type == "call_log") {
            let resultCall = await enviarMensagem(cliente.taskId, "Chamada de voz perdida às: " + dataHotaAtualSimples())
            if (resultCall.erro) {
                await client.sendMessage(process.env.TELEFONE_NOTIFICACAO, `*** ATENÇÃO: MSG DO SISTEMA ***\n😞_Erro ao enviar notificação de chamada perdida do WhatsApp para o ClickUp_😞\n*${msg.from.slice(2).replace('@c.us', '')}*\nChamada perdida às: ${dataHotaAtualSimples()}`)
            }
            return false
        }

        if (msg.hasMedia) {
            const attachmentData = await msg.downloadMedia();
            let parseExtensao = { "12": "xlsm", "msword": "doc", "document": "docx", "ms-excel": "xls", "sheet": "xlsx", "zip": "zip", "x-rar-compressed": "rar", "plain": "txt", "pdf": "pdf", "csv": "csv", "jpeg": "png", "ogg": "ogg", "mpeg": "mpeg", "mp4": "mp4" }
            let nameFileSplit = attachmentData.mimetype.replace('/', '.').replace('; codecs=opus', '').split('.')
            let extensaoFile = nameFileSplit[nameFileSplit.length - 1]
            nameFileSplit[nameFileSplit.length - 1] = parseExtensao[extensaoFile]
            let nameFile = nameFileSplit.join('.')
            let pathArquivo = `./src/attachments/recebidos/${nameFile}`

            console.log(attachmentData.mimetype, "\n", extensaoFile, parseExtensao[extensaoFile])
            fs.writeFile(pathArquivo, Buffer.from(attachmentData.data, 'base64'), async (err) => {
                if (err) {
                    createLogErroWhatsapp('whatsapp', err, { cliente: msg.from, msg: "Msg foi arquivo" })
                    await client.sendMessage(process.env.TELEFONE_NOTIFICACAO, `*** ATENÇÃO: MSG DO SISTEMA ***\n😞_Erro ao enviar mensagem do WhatsApp para o ClickUp.\n VERIFICAR SERVIDOR WHATSAPP_😞\n*${msg.from.slice(2).replace('@c.us', '')}*\nMSG enviada pelo remetente no WhatsApp\n👇👇👇👇👇👇👇`)
                    await client.sendMessage(process.env.TELEFONE_NOTIFICACAO, attachmentData, { sendAudioAsVoice: true })
                } else {
                    let result = await postAttachmentTarefa(cliente.taskId, pathArquivo)
                    if (result.erro) {
                        createLogErroWhatsapp('whatsapp', result.erro, { cliente: msg.from, msg: "Msg foi arquivo" })
                        await client.sendMessage(process.env.TELEFONE_NOTIFICACAO, `*** ATENÇÃO: MSG DO SISTEMA ***\n😞_Erro ao enviar arquivo do WhatsApp para o ClickUp.\nVERIFICAR SERVIDOR WHATSAPP_😞\n*${msg.from.slice(2).replace('@c.us', '')}*\nArquivo enviado pelo remetente no WhatsApp\n👇👇👇👇👇👇👇`)
                        await client.sendMessage(process.env.TELEFONE_NOTIFICACAO, attachmentData, { sendAudioAsVoice: true })
                        return false
                    }
                    if (msg.type == "image" && msg.body != "") {
                        await enviarMensagem(cliente.taskId, msg.body)
                    }
                    await addTagTarefa(cliente.taskId)
                    deletarArquivo(pathArquivo)
                    return true
                }
            })
        } else {
            let result = await enviarMensagem(cliente.taskId, msg.body, (nomeCliente + '\n'))
            if (result.erro) {
                createLogErroWhatsapp('whatsapp', result.erro, { cliente: msg.from, msg: msg.body })
                await client.sendMessage(process.env.TELEFONE_NOTIFICACAO, `*** ATENÇÃO: MSG DO SISTEMA ***\n😞_Erro ao enviar mensagem do WhatsApp para o ClickUp.\nVERIFICAR SERVIDOR WHATSAPP_😞\n*${msg.from.slice(2).replace('@c.us', '')}*\nMSG enviada pelo remetente no WhatsApp\n👇👇👇👇👇👇👇`)
                await client.sendMessage(process.env.TELEFONE_NOTIFICACAO, msg.body)
            }
            await addTagTarefa(cliente.taskId)
            return true
        }
    }
}