const { getPedidoGoogleSheet } = require("./src/services/requests.js");
const { getTarefa, atualizarTask, criarCustomFields } = require('../services/requests')

module.exports = {
    listarPedido: async function(numeroPedido) {
        try {
            let pedido = await getPedidoGoogleSheet(numeroPedido)
            if ( pedido.status != 'Pedido não localizado' && pedido.status != 'Pedido não localizado' ) {
                console.log('Pedido obtido do Google com sucesso...')
            }
            return pedido
        }catch(erro) {
            return { status:  'Pedido não localizado' }
        }
    },
    escreverPedidoEmTask: async function(taskId, pedido, config) {
        // console.log(pedido)
        console.log('----')
        try {
            if ( pedido.status == 'Pedido não localizado' || pedido.status == 'Pedido não localizado' ) return console.log('ERRO: ', pedido)
            let reidLoja = { "AP": "24625", "GS": "24626" }
            let nf = ( typeof pedido.numero_nf != 'undefined' ? pedido.numero_nf.toString().padStart(6, '0') : "")
            let urlRastreioParse = {
                "JadLog": `http://jadlog.com.br/sitejadlog/tracking.jad?cte=${ pedido.rastreamento }`,
                "Correios": `http://www.linkcorreios.com.br/${ pedido.rastreamento }`,
                "Total Express": `https://tracking.totalexpress.com.br/poupup_track.php?reid=${ reidLoja[pedido.loja] }&pedido=${ nf }&nfiscal=${ nf }`,
                "Jamef": `https://www.jamef.com.br/#acompanhamento-da-carga`
            }
            let urlRatreio = ""
            if ( typeof urlRastreioParse[pedido.transportadora] != 'undefined' ) { urlRatreio = urlRastreioParse[pedido.transportadora] }
            let idFieldNumeroPedido = ""
            let idFieldCpf = ""
            let idFieldContato = ""
            let dataPrevista = pedido.data_prevista == "" ? "00/00/00" : pedido.data_prevista
            let task = await getTarefa(taskId, config)

            let saltarLinha = false
            if ( !task.description || !task.description.includes('Status Pedido:') ) { saltarLinha = true }
            else {
                let inicioDescricao = task.description.indexOf('-----------------------------------------------------------------------\n')
                let fimDescricao = ( task.description.slice(100).indexOf('-----------------------------------------------------------------------') + 171 )
                var parteFinaldescricao = task.description.slice(fimDescricao).replace('\n', '')
                task.description = task.description.slice(0, inicioDescricao)   
            }

            task.name = `${ pedido.cliente } - ${ pedido.loja } - ${ pedido.canal }`
            task.description += ( saltarLinha ? "\n" : "" )
            task.description += `-----------------------------------------------------------------------\n`
            task.description += `Data Pedido: ${ pedido.data_pedido }    |    Status Pedido: ${ pedido.status }\n`
            task.description += `Data Prevista: ${ dataPrevista }                 |    Status Rastreio: ${ pedido.status_rastreamento }\n`
            task.description += `NF: ${ pedido.numero_nf }                                        |    Rastreio: ${ pedido.rastreamento }\n`
            task.description += `URL Rastreio: ${ urlRatreio }\n`
            task.description += `URL Tiny: https://erp.tiny.com.br/vendas#edit/${ pedido.id_pedido }\n`
			task.description += `SKU: ${ pedido.sku }     |     Produto: ${ pedido.produto }\n`
            task.description +=`-----------------------------------------------------------------------\n`
    		task.description += ( typeof parteFinaldescricao == 'undefined' ? "" : parteFinaldescricao ) 
            await atualizarTask(taskId, {name: task.name, description: task.description}, config)
            task.custom_fields.map( field => {
                if ( field.name == "Nº Pedido Tiny" ) idFieldNumeroPedido = field.id
                if ( field.name == "Contato" ) idFieldContato = field.id
                if ( field.name == "CPF/CNPJ" ) idFieldCpf = field.id
            })

            await criarCustomFields(taskId, idFieldContato, 0, config)
            await criarCustomFields(taskId, idFieldNumeroPedido, String(pedido.numero_pedido), config)
            await criarCustomFields(taskId, idFieldCpf, String(pedido.cpf_cnpj), config)
            return true
        }catch(erro) {
            console.log(erro)
            return { erro }
        }
    }
}
