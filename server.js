// import needed packages
const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const {
    Message,
    MessageInfo
} = require('./utils/message')
const {
    userJoin,
    getCurrentUser,
    userLeave,
    getAllUsers,
    addMessageInfo,
    getMessages
} = require('./utils/users')
const { addRoom, allRooms, joinRoom, userExistInRoom, addMessage, getMessagesInRoom } = require('./utils/rooms')

// Set the socket
const app = express()
const server = http.createServer(app)
const io = socketio(server)

// Set static folder
app.use(express.static(path.join(__dirname, "public")))

const botName = "Chat Bot"  // Server name actually

// Run when client connects
io.on('connection', socket => {
    console.log("Client connected")
    // Client when join the app
    socket.on('joinApp', username => {
        const user = userJoin(socket.id, username)  // Join client to system

        // Welcome current user
        //socket.emit("message", Message(botName, "Welcome to ChatApp!")) // If you want

        // Send online users info to client
        io.emit("onlineUsers", {
            users: getAllUsers()
        })

        // And send rooms info to client
        // newRoom displays all rooms, but no create new, for just display
        io.emit("newRoom", {
            rooms: allRooms()
        })
    })

    // Listen for chatMessage
    // t is time
    socket.on("chatMessage", ({ msg, targetClientId }) => {
        const user = getCurrentUser(socket.id)
        const target = getCurrentUser(targetClientId)
        // Save messages
        // User send a message
        // and target client receive message
        addMessageInfo(MessageInfo(user.username, target.username, msg, "sended"))
        addMessageInfo(MessageInfo(target.username, user.username, msg, "received"))
        // Send all mesaages to target client
        io.to(targetClientId).emit("messages", {
            messages: getMessages(targetClientId)
        })
    })

    // Listen for messages
    socket.on("messages", (id) => {
        // and send them to client
        io.to(socket.id).emit("messages", {
            messages: getMessages(id)
        })
    })

    // Listen for new room
    socket.on("newRoom", roomname => {
        addRoom(roomname)   // Add new room to server
        // Send room information to all clients
        io.emit("newRoom", {
            rooms: allRooms()
        })
    })

    // Listen for join room
    socket.on("joinRoom", ({ username, selectedRoomName }) => {
        let clientExist = userExistInRoom(selectedRoomName, username) // Check this client in room
        console.log("exist:", clientExist)
        // If not exist
        if (!clientExist) {
            // join room
            joinRoom(username, selectedRoomName)
            socket.join(selectedRoomName)
            // Server send message to joined client
            addMessage(selectedRoomName, Message(botName, "Welcome " + username))
        }
        // Send all messages in room to clients in room
        io.to(selectedRoomName).emit("chatRoom", {
            messages: getMessagesInRoom(selectedRoomName)
        })
    })


    // Listen for chat room
    socket.on("chatRoom", ({ selectedRoomName, username, text }) => {
        addMessage(selectedRoomName, Message(username, text))  // Add message to room
        io.to(selectedRoomName).emit("chatRoom", {
            messages: getMessagesInRoom(selectedRoomName)
        })
    })

    // Listen for file
    socket.on("file", file => {
        // Send file to target client
        io.to(file.targetid).emit("file", file)
    })


    // Runs when client disconnects
    socket.on('disconnect', () => {
        const user = userLeave(socket.id)   // Client leave from server
        if (user) {
            // Send users info
            io.emit("onlineUsers", {
                users: getAllUsers()
            })
        }
        console.log("disconnected: " + user.username)
    })
})


const PORT = process.env.PORT || 3000

server.listen(PORT, () => console.log(`Server running on port ${PORT}`))