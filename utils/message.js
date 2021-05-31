const moment = require('moment') // for time info

// return an object message
function Message(username, text, type) {
    return {
        username,
        text,
        time: moment().format("h:mm a"),
        type
    }
}

// return message details, it stores more information
function MessageInfo(username, target, text, state, type, id) {
    return {
        username,
        target,
        text,
        time: moment().format("h:mm a"),
        state,
        type,
        id
    }
}

module.exports = {
    Message,
    MessageInfo
}