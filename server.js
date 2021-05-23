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


const app = express()
const server = http.createServer(app)
const io = socketio(server)

// Set static folder
app.use(express.static(path.join(__dirname, "public")))

const botName = "Chat Bot"

// Run when client connects
io.on('connection', socket => {
    console.log("Client connected")
    socket.on('joinApp', username => {
        const user = userJoin(socket.id, username)
        //socket.join(user.room)
        // console.log("New WS connection...")

        // Welcome current user
        //socket.emit("message", Message(botName, "Welcome to ChatApp!"))

        // Send users info
        io.emit("onlineUsers", {
            users: getAllUsers()
        })

        // And send rooms info
        io.emit("newRoom", {
            rooms: allRooms()
        })
    })

    // Listen for chatMessage
    socket.on("chatMessage", ({ msg, targetClientId, t }) => {
        const user = getCurrentUser(socket.id)
        const target = getCurrentUser(targetClientId)
        addMessageInfo(MessageInfo(user.username, target.username, msg, t, "sended"))
        addMessageInfo(MessageInfo(target.username, user.username, msg, t, "received"))
        //io.to(targetClientId).emit("message", Message(user.username, msg))
        io.to(targetClientId).emit("messages", {
            messages: getMessages(targetClientId)
        })
    })

    // Listen for messages
    socket.on("messages", (id) => {
        io.to(socket.id).emit("messages", {
            messages: getMessages(id)
        })
    })

    // Listen for new room
    socket.on("newRoom", roomname => {
        addRoom(roomname)
        io.emit("newRoom", {
            rooms: allRooms()
        })
    })

    // Listen for new room
    socket.on("joinRoom", ({ username, selectedRoomName }) => {
        let clientExist = userExistInRoom(selectedRoomName, username)
        console.log("exist:", clientExist)
        if (!clientExist) {
            joinRoom(username, selectedRoomName)
            socket.join(selectedRoomName)
            addMessage(selectedRoomName, Message(botName, "Welcome " + username))
        }
        io.to(selectedRoomName).emit("chatRoom", {
            messages: getMessagesInRoom(selectedRoomName)
        })
    })


    // Listen for chat room
    socket.on("chatRoom", ({ selectedRoomName, username, text, time }) => {
        addMessage(selectedRoomName, { username, text, time })
        io.to(selectedRoomName).emit("chatRoom", {
            messages: getMessagesInRoom(selectedRoomName)
        })
    })


    // Runs when client disconnects
    socket.on('disconnect', () => {
        const user = userLeave(socket.id)
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