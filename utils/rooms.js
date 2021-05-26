const rooms = [] // Store all rooms

// Add room
function addRoom(roomname) {
    const room = {roomname, messages: [], users: []} 
    rooms.push(room)
    return rooms
}

// Get all rooms
function allRooms() {
    return rooms
}

// Add message to room
function addMessage(roomname, message) {
    const index = rooms.findIndex(room => room.roomname === roomname)
    if (index !== -1) {
        rooms[index].messages.push(message)
    } else {
        rooms[0].messages.push(message)
    }
}

// Get all messages in the room
function getMessagesInRoom(roomname) {
    const index = rooms.findIndex(room => room.roomname === roomname)
    return rooms[index].messages
}

// Client join to the room
function joinRoom(username, roomname) {
    const index = rooms.findIndex(room => room.roomname === roomname)
    if (index !== -1) {
        rooms[index].users.push(username)
    } else {
        rooms[0].users.push(username)
    }
}

// Check whether client is in the room
function userExistInRoom(roomname, username) {
    const index = rooms.findIndex(room => room.roomname === roomname)
    if (index !== -1) {
        const i = rooms[index].users.findIndex(user => user === username)
        if (i !== -1) {
            return true
        }
    }

    return false
}

module.exports = {
    addRoom,
    allRooms,
    addMessage,
    getMessagesInRoom,
    joinRoom,
    userExistInRoom
}