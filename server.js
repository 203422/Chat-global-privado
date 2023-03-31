const express = require('express')
const socket_io = require('socket.io')();

const app = express();

app.use(express.static('public'));

let usuarios = [];
let users = {}

const server = app.listen(3000, { host: '192.168.89.113' }, () => {
    console.log('Servidor en ejecucion en el puerto 3000')
});

const io = socket_io.listen(server, {
    maxHttpBufferSize: 10e6
})

io.on('connection', (socket) => {

    socket.on('mensaje', (usuario, mensaje) => {
        io.sockets.emit('mensaje-servidor', usuario, mensaje)
    })

    socket.on('mensaje-privado', (msg, recipient, remitente) => {
        const recipientSocket = usuarios.find(user => user.username === recipient)?.id;
        if (recipientSocket) {
            socket.to(recipientSocket).emit('mensaje-privado', msg, recipient, remitente); 7
            socket.emit('mensaje-privado', msg, recipient, remitente);
        }
    });


    socket.on('escribiendo', (data) => {
        socket.broadcast.emit('escribiendo', data)
    })

    socket.on('resgistrar-usuario', (username) => {
        const userExists = usuarios.some(user => user.username === username);
        if (userExists) {
            let respuesta = true
            socket.emit('resgistrar-usuario', respuesta);
            console.log('El usuario', username, 'ya está conectado')
        } else {
            usuarios.push({ id: socket.id, username });
            let respuesta = false
            console.log(username, 'se ha conectado')
            socket.emit('resgistrar-usuario', respuesta);
            io.sockets.emit('nombres-usuarios', usuarios);
        }
    });

    socket.on('disconnect', (data) => {
        const index = usuarios.findIndex(user => user.id === socket.id);
        if (index !== -1) {
            console.log(usuarios[index].username, 'se desconecto')
            usuarios.splice(index, 1);
        }
        io.sockets.emit('nombres-usuarios', usuarios);
    })

    socket.on('file', (data, usuario) => {
        io.sockets.emit('file', data, usuario);
    });

    socket.on('file-privado', (data, recipient, remitente) => {
        const recipientSocket = usuarios.find(user => user.username === recipient)?.id;
        if (recipientSocket) {
            socket.to(recipientSocket).emit('file-privado', data, recipient, remitente);
            socket.emit('file-privado', data, recipient, remitente);
        }
    });

});
