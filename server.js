const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Message = require('./utils/message')
const {
    userJoin, 
    getCurrentUser, 
    userLeave, 
    getRoomUsers,
    getAllUsers
} = require('./utils/users')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

// Set static folder
app.use(express.static(path.join(__dirname, "public")))

const botName = "Chat Bot"

// Run when client connects
io.on('connection', socket => {
    console.log("Client connected")
    socket.on('joinApp', ({username, room}) => {
        const user = userJoin(socket.id, username, room)
        //socket.join(user.room)
        // console.log("New WS connection...")

        // Welcome current user
        //socket.emit("message", Message(botName, "Welcome to ChatApp!"))

        // Send users info
        io.emit("onlineUsers", {
            users: getAllUsers()
        })
    })

    // Listen for chatMessage
    socket.on("chatMessage", ({msg, targetClientId}) => {
        const user = getCurrentUser(socket.id)
        io.to(targetClientId).emit("message", Message(user.username, msg))
    })
})


const PORT = process.env.PORT || 3000

server.listen(PORT, () => console.log(`Server running on port ${PORT}`))