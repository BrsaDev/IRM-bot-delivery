let stages = require("../model/stages")

module.exports = {
    sendMessage: async (client, msg, configUser) => {
        let telClienteEmpresa = msg.from + configUser.telefone
        console.log(telClienteEmpresa, '------------\n')
        if ( typeof stages[telClienteEmpresa] == 'undefined' ) {
            stages[telClienteEmpresa] = 'init'
        }
        if ( msg.body.toString().toLowerCase() == 'menu' ) {
            stages[telClienteEmpresa] = "init"
            await client.sendMessage(msg.from, configUser['0'])
            return true
        }
        if ( msg.body == '1' && stages[telClienteEmpresa] != '61' ) {  //msg status do pedido
            stages[telClienteEmpresa] = "11"
            await client.sendMessage(msg.from, "Ok! Informe o número do Pedido Ex: PED123456789")
            return true
        }
        if ( msg.body == '2' && stages[telClienteEmpresa] != '61' ) {  //msg cardápio
            await client.sendMessage(msg.from, configUser.mensagem_cardapio)
            await client.sendMessage(msg.from, configUser['2'])
            return true
        }
        if ( msg.body == '3' && stages[telClienteEmpresa] != '61' ) {  //msg horário de funcionamento
            await client.sendMessage(msg.from, configUser['3'])
            return true
        }
        if ( msg.body == '4' && stages[telClienteEmpresa] != '61' ) {  //msg tempo de entrega
            await client.sendMessage(msg.from, configUser['4'])
            return true
        }
        if ( msg.body == '5' && stages[telClienteEmpresa] != '61' ) {  //msg endereço
            await client.sendMessage(msg.from, configUser['5'])
            return true
        }
        if ( msg.body == '6' && stages[telClienteEmpresa] != '61' ) {  //msg falar com atendente
            stages[telClienteEmpresa] = "61"
            await client.sendMessage(msg.from, configUser['6'])
            return true
        }
        if ( stages[telClienteEmpresa] == '11' ) { // retorna o status do pedido
            stages[telClienteEmpresa] = 'init'
            if ( typeof configUser.pedidos[msg.body] != 'undefined' ) {
                await client.sendMessage(msg.from, `*${configUser.pedidos[msg.body].status}*`)  
            }else {
                await client.sendMessage(msg.from, "O número do pedido não foi encontrado, ou não houve atualização no status.") 
            }
            return true
        }
        if ( stages[telClienteEmpresa] == '61' ) { // passa para atendente humana
            return true
        }
        // msg menu principal
        await client.sendMessage(msg.from, configUser.mensagem_topo)
        return await client.sendMessage(msg.from, configUser['0'])
    }
}

function absolutePath() { return __dirname.replace('\\utils', '').replace('/utils', '') }
function runtime(start) {
    let time = new Date();
    let runtime = Number(time) - Number(start);
  
    if (runtime <= 300000) { // 5 minutos
      return true;
    } else {
      return false;
    }
  }
