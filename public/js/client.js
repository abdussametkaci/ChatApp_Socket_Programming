// All elements
const roomForm = document.getElementById('room-form')
const chatForm = document.getElementById('chat-form')
const chatMessages = document.getElementById("messages")
const currentUser = document.getElementById("current-username")
const allUsers = document.getElementById("users")
const allRooms = document.getElementById("rooms")
const message = document.getElementById('msg')
const emojiPicker = document.querySelector('emoji-picker')
const emojiTable = document.getElementById('emoji-table')
const btnEmoji = document.getElementById('btn-emoji')
const btnFile = document.getElementById('btn-file')

//const socket = io()
//let port = 3000
//let ip = "127.0.0.1"
//socket.connect('http://' + ip + ':' + port)
// OR
var socket = io()

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

// Join system
socket.emit('joinApp', username)

// Get online users
socket.on('onlineUsers', ({ users }) => {
    displayUsers(users)
})

// Get all messages from server
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

// Add clients to DOM
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

// Add romms to DOM
function displayRooms(rooms) {
    while (allRooms.lastChild) allRooms.removeChild(allRooms.lastChild)
    for (const room of rooms) {
        const div = document.createElement("div")
        div.classList.add("container")
        div.setAttribute("id", room.roomname)
        div.innerHTML = `<img src="img/room.png" alt="Avatar">
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

// Add room messages to DOM
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
        let t = moment().format("h:mm a")   // Get time
        if (isSelectedFile) {
            sendFile(selectedFile, username, targetClientId, t) // Send file to target client
            isSelectedFile = false
        } else {
            // Otherwise send a message
            socket.emit("chatMessage", { msg, targetClientId, t })
            // And display it
            displayMessage({
                username,
                text: msg,
                time: t
            })
        }


    } else if(isSelectedRoom){
        let time = moment().format("h:mm a")
        if (isSelectedFile) {
            // will be updated
            //sendFile(selectedFile, username, targetClientId, time)
            isSelectedFile = false
        } else {
            // Send message for room
            socket.emit("chatRoom", { selectedRoomName, username, text: msg, time })
        }

    }

    // Clear input
    e.target.elements.msg.value = ""
    e.target.elements.msg.focus()
})

// Add emoji to message
emojiPicker.addEventListener('emoji-click', event => {
    console.log(event.detail)
    message.value = message.value + event.detail.unicode
});

let clicked = false
emojiTable.style.display = "none"
// Show emoji table
btnEmoji.onclick = () => {
    if (clicked) {
        emojiTable.style.display = "none"
        clicked = false
    } else {
        emojiTable.style.display = "inline-block"
        clicked = true
    }
}

// Select file
btnFile.onclick = () => {
    let fileList
    const inputElement = document.getElementById("myFile")
    inputElement.addEventListener("change", handleFiles, false) // When file is choosen
    function handleFiles() {
        fileList = this.files // we have file list
        console.log("filename: ", fileList[0]) 
        selectedFile = fileList[0] // selected file
        message.value = fileList[0].name
    }

    document.getElementById("myFile").click() // Activate file chooser
    isSelectedFile = true
}

// Check received messages are whether user and target client own
// Because we get all messages and a client can message to more than one
function pairMessage(message, username, target) {
    if ((message.username === username && message.target === target) || (message.username === target && message.target === username)) {
        return true
    }

    return false
}

// File to base64 format
const toBase64 = file => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
});

// Send file to server
async function sendFile(file, username, targetid, time) {
    toBase64(file).then(data => {
        socket.emit("file", { username, targetid, time, data, filename: file.name, filetype: file.type })
    }).catch();
}

// Download received file to own device
function downloadURI(uri, name) {
    var link = document.createElement("a");
    link.download = name;
    link.href = uri;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    delete link;
}


