let idCliente = localStorage.getItem('idCliente')
let user = localStorage.getItem('user')
let login = document.querySelector('#btn-login')
let logout = document.querySelector('#btn-logout')
let qr = document.querySelector('#btn-qr')
let boasVindas = document.querySelector('#boas-vindas')


if ( idCliente == "22997585299" ) {
    cadastrar.classList.remove('d-none')
    cadastrar.classList.add('d-block')
}
if ( document.URL.includes("cadastrar") && idCliente != "22997585299" ) {
    setRota('/home')
}
if ( idCliente ) {
    boasVindas.classList.remove('d-none')
    boasVindas.classList.add('d-flex')
    login.classList.remove('d-block')
    login.classList.add('d-none')
    logout.classList.remove('d-none')
    logout.classList.add('d-block')
    boasVindas.innerHTML = `<span>BEM VINDO!</span><span> ${ user }</span>`
}

function setRota(rota) {
    let a = document.createElement("a");
    a.setAttribute('href', rota)
    a.setAttribute('id', 'setRota')
    document.body.appendChild(a);
    console.log(a)
    return document.querySelector('#setRota').click()
}
async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

logout.addEventListener('click', async function () {
    boasVindas.classList.remove('d-flex')
    boasVindas.classList.add('d-none')
    login.classList.remove('d-none')
    login.classList.add('d-block')
    logout.classList.remove('d-block')
    logout.classList.add('d-none') 
    localStorage.clear()
    setRota('/home')
    await sleep(1000)
})

qr.addEventListener('click', function() {
    if ( idCliente ) return qr.href = '/qr?idCliente=' + idCliente
    else return login.click()    
})

