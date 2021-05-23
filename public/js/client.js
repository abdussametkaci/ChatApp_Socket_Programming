const roomForm = document.getElementById('room-form')
const chatForm = document.getElementById('chat-form')
const chatMessages = document.getElementById("messages")
const currentUser = document.getElementById("current-username")
const allUsers = document.getElementById("users")
const allRooms = document.getElementById("rooms")
const message = document.getElementById('msg')

//const socket = io()
var socket = io()
//let port = 3000
//let ip = "127.0.0.1"
//socket.connect('http://' + ip + ':' + port)

// Get username and room from URL
const { username } = Qs.parse(location.search, {
    ignoreQueryPrefix: true
})

let targetClientId = 0
let targetClientName = ""
let isSelectedTargetClient = false

let isSelectedRoom = false
let selectedRoomName = ""
let isExistUser = false

let isSelectedFile = false
let selectedFile

console.log(username, "joined to app")
currentUser.innerText = username

// Join chatRoom
socket.emit('joinApp', username)

// Get room and users
socket.on('onlineUsers', ({ users }) => {
    displayUsers(users)
})


// Message from server
/*
socket.on('message', message => {
    console.log(message)
    displayMessage(message)

    // Scroll down
    chatMessages.scrollTop = chatMessages.scrollHeight
})
*/


// Message from server
socket.on('messages', ({ messages }) => {
    console.log("messsages: ", messages)
    if (isSelectedTargetClient)
        displayMessages(messages)
    console.log("drawed")
    // Scroll down
    chatMessages.scrollTop = chatMessages.scrollHeight
})

// Get new room name
socket.on('newRoom', ({ rooms }) => {
    displayRooms(rooms)
})

// Get new chat room
socket.on('chatRoom', ({ messages }) => {
    if (isSelectedRoom)
        displayRoomMessages(messages)
    chatMessages.scrollTop = chatMessages.scrollHeight
})

// Get file
socket.on('file', file => {
    console.log("file")
    console.log(file)
    downloadURI(file.data, file.filename)
})

// Add message to DOM
function displayMessage(message) {
    const div = document.createElement("div")
    if (username != message.username) {
        div.classList.add("container")
        div.innerHTML = `<img src="img/avatar.png" alt="Avatar">
    <p><label class="username-chat">${message.username} </label><label class="time">${message.time}</label><br>
    ${message.text}</p>`
    } else {
        div.classList.add("container")
        div.classList.add("darker")
        div.innerHTML = `<img src="img/avatar.png" alt="Avatar" class="right">
    <p><label class="username-chat">${message.username} </label><label class="time">${message.time}</label><br>
    ${message.text}</p>`
    }

    document.getElementById("messages").appendChild(div)
}

// Add messages to DOM
function displayMessages(messages) {
    while (chatMessages.lastChild) chatMessages.removeChild(chatMessages.lastChild)
    for (const message of messages) {
        if (!(messages.length > 0 && pairMessage(message, username, targetClientName))) continue
        const div = document.createElement("div")
        if (message.type === "sended" && username == message.username) {
            div.classList.add("container")
            div.classList.add("darker")
            div.innerHTML = `<img src="img/avatar.png" alt="Avatar" class="right">
    <p><label class="username-chat">${message.username} </label><label class="time">${message.time}</label><br>
    ${message.text}</p>`
        } else if (message.type === "received" && username == message.username) {
            div.classList.add("container")
            div.innerHTML = `<img src="img/avatar.png" alt="Avatar">
    <p><label class="username-chat">${message.target} </label><label class="time">${message.time}</label><br>
    ${message.text}</p>`
        } else if (message.type === "sended" && username != message.username) {
            div.classList.add("container")
            div.innerHTML = `<img src="img/avatar.png" alt="Avatar">
    <p><label class="username-chat">${message.username} </label><label class="time">${message.time}</label><br>
    ${message.text}</p>`
        } else {
            div.classList.add("container")
            div.classList.add("darker")
            div.innerHTML = `<img src="img/avatar.png" alt="Avatar" class="right">
    <p><label class="username-chat">${message.target} </label><label class="time">${message.time}</label><br>
    ${message.text}</p>`
        }

        document.getElementById("messages").appendChild(div)
    }
}

function displayUsers(users) {
    while (allUsers.lastChild) allUsers.removeChild(allUsers.lastChild)
    for (const user of users) {
        if (currentUser.innerText == user.username) continue
        const div = document.createElement("div")
        div.classList.add("user")
        div.setAttribute("id", user.id)
        div.innerHTML = `<img src="img/avatar.png" alt="Avatar">
        <p class="username"><b>${user.username} </b></p>`

        document.getElementById("users").appendChild(div)
        document.getElementById(user.id).onclick = () => {
            targetClientId = user.id
            targetClientName = user.username
            isSelectedTargetClient = true
            isSelectedRoom = false
            socket.emit("messages", user.id)
            console.log("target client id: " + targetClientId + ", username: " + user.username)
        };
    }
}

function displayRooms(rooms) {
    while (allRooms.lastChild) allRooms.removeChild(allRooms.lastChild)
    for (const room of rooms) {
        const div = document.createElement("div")
        div.classList.add("container")
        div.setAttribute("id", room.roomname)
        div.innerHTML = `<img src="img/avatar.png" alt="Avatar">
        <p class="username">${room.roomname}</p>`
        document.getElementById("rooms").appendChild(div)
        document.getElementById(room.roomname).onclick = () => {
            isSelectedRoom = true
            isSelectedTargetClient = false
            selectedRoomName = room.roomname
            socket.emit("joinRoom", { username, selectedRoomName })
            console.log("selected room: " + room.roomname)
        }
    }
}

function displayRoomMessages(messages) {
    while (chatMessages.lastChild) chatMessages.removeChild(chatMessages.lastChild)
    for (const message of messages) {
        displayMessage(message)
    }
}

// New Room submit
roomForm.addEventListener('submit', (e) => {
    e.preventDefault()

    // Get new room name
    const msg = e.target.elements.msg_new_room.value

    // Emit message to server
    socket.emit("newRoom", msg)

    // Clear input
    e.target.elements.msg_new_room.value = ""
    e.target.elements.msg_new_room.focus()
})

// Message submit
chatForm.addEventListener('submit', (e) => {
    e.preventDefault()

    // Get message text
    const msg = e.target.elements.msg.value

    // Emit message to server
    if (isSelectedTargetClient) {
        let t = moment().format("h:mm a")
        if (isSelectedFile) {
            sendFile(selectedFile, username, targetClientId, t)
            isSelectedFile = false
        } else {
            socket.emit("chatMessage", { msg, targetClientId, t })
            displayMessage({
                username,
                text: msg,
                time: t
            })
        }


    } else {
        let time = moment().format("h:mm a")
        if (isSelectedFile) {
            sendFile(selectedFile, username, targetClientId, time)
            isSelectedFile = false
        } else {
            socket.emit("chatRoom", { selectedRoomName, username, text: msg, time })
        }

    }

    // Clear input
    e.target.elements.msg.value = ""
    e.target.elements.msg.focus()
})

document.querySelector('emoji-picker')
    .addEventListener('emoji-click', event => {
        console.log(event.detail)
        message.value = message.value + event.detail.unicode
    });

let clicked = false
document.getElementById('emoji-table').style.display = "none"
document.getElementById('btn-emoji').onclick = () => {
    if (clicked) {
        document.getElementById('emoji-table').style.display = "none"
        clicked = false
    } else {
        document.getElementById('emoji-table').style.display = "inline-block"
        clicked = true
    }
}

document.getElementById('btn-file').onclick = () => {
    let fileList
    const inputElement = document.getElementById("myFile");
    inputElement.addEventListener("change", handleFiles, false);
    function handleFiles() {
        fileList = this.files; /* now you can work with the file list */
        console.log("filename: ", fileList[0])
        selectedFile = fileList[0]
        message.value = fileList[0].name
    }

    document.getElementById("myFile").click();
    isSelectedFile = true
}

function pairMessage(message, username, target) {
    if ((message.username === username && message.target === target) || (message.username === target && message.target === username)) {
        return true
    }

    return false
}

const toBase64 = file => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
});

async function sendFile(file, username, targetid, time) {
    toBase64(file).then(data => {
        socket.emit("file", { username, targetid, time, data, filename: file.name, filetype: file.type })
    }).catch();
}

function downloadURI(uri, name) {
    var link = document.createElement("a");
    link.download = name;
    link.href = uri;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    delete link;
}


