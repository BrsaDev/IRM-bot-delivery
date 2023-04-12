const axios = require("axios");

const URL_GOOGLE_SAIDA = "https://script.google.com/macros/s/AKfycbwgxhovnkKTDOqgHCVF5gpzVBqPzZxAT0O-hNxeIBC3RKrlSIAp8UBxNJrHHHcfq355JA/exec"

module.exports = {
    getPedidoGoogleSheet: async function (numeroPedido) {
        try {
            let options = {
                method: 'get',
                url: URL_GOOGLE_SAIDA + "?tipo=info-pedido&numero_pedido=" + numeroPedido
            }
            let response = await axios(options)
            if (response.data == "") return { erro: "Erro na consulta, confirme o id do pedido." }
            // console.log(response.data)
            return response.data
        } catch (erro) {
            return { erro }
        }
    }
}
