const rooms = []

function addRoom(roomname) {
    const room = {roomname}
    room.push(room)
    return rooms
}

function addUserToRoom(roomname, user) {
    const index = rooms.findIndex(room => room.roomname === roomname)
    rooms[index].users.push(user)
    return rooms
}