const users = []    // Store all clients

// Join user to server
function userJoin(id, username) {
    const user = {id, username}
    user.messages = []  // also every client has messages
    users.push(user)
    return user
}

// Get current client
function getCurrentUser(id) {
    return users.find(user => user.id === id)
}

// Client leaves from server
function userLeave(id) {
    const index = users.findIndex(user => user.id === id)

    if(index !== -1) {
        return users.splice(index, 1)[0]
    }
}

// Get all users
function getAllUsers() {
    return users
}

// Add message info to client messages
function addMessageInfo(message) {
    const index = users.findIndex(user => user.username === message.username)
    users[index].messages.push(message)
}

// Get all messages of the client
function getMessages(id) {
    const index = users.findIndex(user => user.id === id)
    return users[index].messages
}

module.exports = {
    userJoin,
    getCurrentUser,
    userLeave,
    getAllUsers,
    addMessageInfo,
    getMessages
}