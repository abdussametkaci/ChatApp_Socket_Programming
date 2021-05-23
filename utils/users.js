const users = []

// Join user to chat
function userJoin(id, username) {
    const user = {id, username}
    user.messages = []
    users.push(user)
    return user
}

// Get current user
function getCurrentUser(id) {
    return users.find(user => user.id === id)
}

// User leaves chat
function userLeave(id) {
    const index = users.findIndex(user => user.id === id)

    if(index !== -1) {
        return users.splice(index, 1)[0]
    }
}

// Get room users
function getRoomUsers(romm) {
    return users.filter(user => user.room === romm)
}

// Get all users
function getAllUsers() {
    return users
}

function addMessageInfo(message) {
    const index = users.findIndex(user => user.username === message.username)
    users[index].messages.push(message)
}

function getMessages(id) {
    const index = users.findIndex(user => user.id === id)
    return users[index].messages
}

module.exports = {
    userJoin,
    getCurrentUser,
    userLeave,
    getRoomUsers,
    getAllUsers,
    addMessageInfo,
    getMessages
}