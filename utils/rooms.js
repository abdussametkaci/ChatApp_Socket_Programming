const rooms = []

// Join user to chat
function addRoom(roomname) {
    rooms.push(roomname)
    return rooms
}

function allRooms() {
    return rooms
}

module.exports = {
     addRoom,
     allRooms
}