const moment = require('moment')    // for time info

// return an object message
function Message(username, text) {
    return {
        username,
        text,
        time: moment().format("h:mm a")
    }
}

// return message details
function MessageInfo(username, target, text, time, type) {
    return {
        username,
        target,
        text,
        time,
        type
    }
}

module.exports = {
    Message,
    MessageInfo
}