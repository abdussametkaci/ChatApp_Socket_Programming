const moment = require('moment')

function Message(username, text) {
    return {
        username,
        text,
        time: moment().format("h:mm a")
    }
}

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