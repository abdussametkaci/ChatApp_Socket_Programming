const rooms = []

// Join user to chat
function addRoom(roomname) {
    const room = {roomname, messages: [], users: []} 
    rooms.push(room)
    return rooms
}

function allRooms() {
    return rooms
}

function addMessage(roomname, message) {
    const index = rooms.findIndex(room => room.roomname === roomname)
    if (index !== -1) {
        rooms[index].messages.push(message)
    } else {
        rooms[0].messages.push(message)
    }
}

function getMessagesInRoom(roomname) {
    const index = rooms.findIndex(room => room.roomname === roomname)
    return rooms[index].messages
}

function joinRoom(username, roomname) {
    const index = rooms.findIndex(room => room.roomname === roomname)
    if (index !== -1) {
        rooms[index].users.push(username)
    } else {
        rooms[0].users.push(username)
    }
}

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