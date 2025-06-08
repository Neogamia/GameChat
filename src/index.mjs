import e from "express";
import http from "http";
import { Server } from "socket.io";
import path from "path";

const port = 7500;
const app = e();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // allow cross-origin
  }
});

const messages = []; // proper initialization

app.get('/', (req, res) => {
    res.sendFile(path.join("D:/Neogamia/GameChat/src/index.html"));
});

app.get('/status', (req, res) => {
    res.json({ 'Status': 'Running' });
});

io.on('connection', (socket) => { // use 'connection' not 'connect'
    console.log(`User with socket id: ${socket.id} connected`);

    // Send recent chat history
    socket.emit('getFullChatHistory', messages);
    socket.emit('getLatestChatMessage', messages[messages.length - 1] || null);

    socket.on('chatMessage', (msg) => {
        console.log(`[${socket.id}] ${msg}`);
        messages.push(msg);
        console.log(`New element added to messages: ${msg}`);
        
        // Broadcast to all connected sockets
        io.emit('getLatestChatMessage', msg);
    });

    socket.on('discordBotMessage', (msg) => {
        console.log(`received message from Bot via Discord ${msg}`);
        messages.push(msg);
    })

    socket.on('disconnect', () => {
        console.log(`User with id ${socket.id} disconnected`);
    });
});

server.listen(port, () => {
    console.log(`Running on http://localhost:${port}`);
});