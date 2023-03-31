const socket = io()

const salida = document.querySelector('.salida')
const alertas = document.querySelector('.alertas')
const mensaje = document.querySelector('.mensaje')
const boton = document.querySelector('.boton')
const entrar = document.querySelector('.entrar')
const chat = document.querySelector('.chat-container')
const login = document.querySelector('.login-container')
const login_usuario = document.querySelector('.usuario-input')
const usuario = document.querySelector('.usuario')
const alerta_usuario = document.querySelector('.alerta-usuario')
const input_file = document.querySelector('.input-file')
const form_input = document.querySelector('.form-input')
const content_users = document.querySelector('.content-users')
const lista_usuario = document.querySelector('.lista-usuario')
const svg_file = document.querySelector('.svg-file')
let name_user = ""

entrar.addEventListener('click', () => {
    socket.emit('resgistrar-usuario', login_usuario.value)
})

socket.on('resgistrar-usuario', (respuesta) => {
    if (respuesta) {
        console.log('Usuario ya conectado')
        parrafo = `<p><strong>El usuario ya está conectado</strong></p>`;
        alerta_usuario.innerHTML = parrafo
        setTimeout(() => {
            alerta_usuario.innerHTML = ''
        }, 2000);
    } else {
        login.style.display = 'none'
        chat.classList.remove('chat-container-none')
        usuario.textContent = login_usuario.value;
    }
})

input_file.addEventListener('change', () => {
    svg_file.style.color = '#03C988'
})

form_input.addEventListener('submit', (e) => {
    e.preventDefault();
})

boton.addEventListener('click', (e) => {
    const file = input_file.files[0];
    msg = mensaje.value

    if (msg.startsWith('@')) {
        const recipient = msg.split(' ')[0].substring(1);
        const privateMsg = msg.substring(msg.indexOf(' ') + 1);
        if (mensaje.value.trim() !== `@${recipient}`) {
            socket.emit('mensaje-privado', privateMsg, recipient, login_usuario.value);
        }

        if (file) {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (e) => {
                socket.emit('file-privado', {
                    name: file.name,
                    type: file.type,
                    data: e.target.result,
                }, recipient, login_usuario.value);
            };
            input_file.value = '';
            svg_file.style.color = '#ffffff'
            return false;
        }
        mensaje.value = `@${name_user} `
    } else {
        if (mensaje.value.trim() !== "") {
            socket.emit('mensaje', login_usuario.value, mensaje.value);
            mensaje.value = ""
        }

        if (file) {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (e) => {
                socket.emit('file', {
                    name: file.name,
                    type: file.type,
                    data: e.target.result,
                }, login_usuario.value);
            };
            input_file.value = '';
            svg_file.style.color = '#ffffff'
            return false;
        }

    };
})

socket.on('mensaje-servidor', (usuario, mensaje) => {
    alertas.innerHTML = ''
    salida.innerHTML += `<p class="mensaje-salida"> <strong> ${usuario}:  </strong> ${mensaje}</p>`
})

mensaje.addEventListener('keypress', () => {
    socket.emit('escribiendo', login_usuario.value)
})

socket.on('escribiendo', (data) => {
    alertas.innerHTML = `<p class="mensaje-salida">${data} está escribiendo...</p>`
    alertas.innerHTML = ''
})

socket.on('file', (data, usuario) => {
    const link = document.createElement('a');

    link.textContent = data.name;
    link.href = data.data;
    link.download = data.name;

    salida.innerHTML += `<div class="div-file"><p class="usuario-file"><strong>${usuario}: </strong></p> ${link.outerHTML}</div>`
});

socket.on('nombres-usuarios', (usuarios) => {
    let html = ''
    usuarios.forEach(element => {
        html += `<p class="lista-usuario">${element.username}</p>`
    })
    content_users.innerHTML = html
});

socket.on('mensaje-privado', (mensaje, usuario, remitente) => {

    alertas.innerHTML = ''
    salida.innerHTML += `<p class="mensaje-salida mensaje-privado"> <strong> ${remitente}:  </strong> ${mensaje}</p>`

})

socket.on('file-privado', (data, usuario, remitente) => {
    console.log(data)
    const link = document.createElement('a');

    link.textContent = data.name;
    link.href = data.data;
    link.download = data.name;

    salida.innerHTML += `<div class="div-file"><p class="usuario-file mensaje-privado"><strong>${remitente}: </strong></p> ${link.outerHTML}</div>`
})

content_users.addEventListener('click', (event) => {
    if (event.target.tagName === 'P') {
        name_user = event.target.textContent;
        console.log(name_user);
        mensaje.value = `@${name_user} `
        mensaje.focus()
    }
});
