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
const { 
    addRoom, 
    allRooms, 
    joinRoom, 
    userExistInRoom, 
    addMessage, 
    getMessagesInRoom 
} = require('./utils/rooms')
const { 
    addFile, 
    getFile 
} = require('./utils/files')

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
    socket.on("chatMessage", ({ msg, targetClientId, type }) => {
        const user = getCurrentUser(socket.id)
        const target = getCurrentUser(targetClientId)
        // Save messages
        // User send a message
        // and target client receive message
        if(type === "text") {
            // Add message for two users
            // A client sends message and other side one receives message
            addMessageInfo(MessageInfo(user.username, target.username, msg, "sended", type, 0))
            addMessageInfo(MessageInfo(target.username, user.username, msg, "received", type, 0))
        } else {    // file
            let fileID = addFile(msg) // Storage file
            // Add file message for two sides one
            addMessageInfo(MessageInfo(user.username, target.username, msg.filename, "sended", type, fileID))
            addMessageInfo(MessageInfo(target.username, user.username, msg.filename, "received", type, fileID))
            // And send to other client
            io.to(targetClientId).emit("messages", {
                messages: getMessages(targetClientId)
            })

            // And send to own client
            io.to(user.id).emit("messages", {
                messages: getMessages(targetClientId)
            })
        }
        
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
    socket.on("joinRoom", selectedRoomName => {
        let user = getCurrentUser(socket.id)
        let clientExist = userExistInRoom(selectedRoomName, user.username) // Check this client in room
        // If not exist
        if (!clientExist) {
            // join room
            joinRoom(user.username, selectedRoomName)
            socket.join(selectedRoomName)
            // Server send message to joined client
            addMessage(selectedRoomName, Message(botName, "Welcome " + user.username, "text"))
        }
        // Send all messages in room to clients in room
        io.to(selectedRoomName).emit("chatRoom", {
            messages: getMessagesInRoom(selectedRoomName)
        })
    })


    // Listen for chat room
    socket.on("chatRoom", ({ selectedRoomName, username, msg, type }) => {
        if(type === "text")
            addMessage(selectedRoomName, MessageInfo(username, selectedRoomName, msg, "sended", type, 0))  // Add message to room
        else {
            let fileID = addFile(msg) // storage file
            // Add file messsage
            // Not data, less info
            addMessage(selectedRoomName, MessageInfo(username, selectedRoomName, msg.filename, "sended", type, fileID))
        }
        // Send messages in room to room
        io.to(selectedRoomName).emit("chatRoom", {
            messages: getMessagesInRoom(selectedRoomName)
        })
    })
    /*
    // Listen for file
    socket.on("file", file => {
        // Send file id to target client
        let fileID = addFile(file)
        io.to(file.targetid).emit("file", fileID)
    })
    */

    // Listen for getFile
    socket.on("getFile", selectedFileID => {
        // Send file to target client
        let file = getFile(selectedFileID)
        console.log(file)
        io.to(socket.id).emit("getFile", {file: file.file})
    })


    // Runs when client disconnects
    socket.on('disconnect', () => {
        const user = userLeave(socket.id)   // Client leave from server
        if (user) {
            // Send online users
            io.emit("onlineUsers", {
                users: getAllUsers()
            })
        }
        console.log("disconnected: " + user.username)
    })
})


const PORT = process.env.PORT || 3000
// Listen port
server.listen(PORT, () => console.log(`Server running on port ${PORT}`))