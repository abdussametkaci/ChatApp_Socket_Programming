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

// User Variables
let targetClientId = 0
let targetClientName = ""
let isSelectedTargetClient = false

// Room Variables
let isSelectedRoom = false
let selectedRoomName = ""
let isExistUser = false

// File Variables
let isSelectedFile = false
let selectedFile

let msg = "" // Message text

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

// Get rooms
socket.on('newRoom', ({ rooms }) => {
    displayRooms(rooms)
})

// Get new chat room
socket.on('chatRoom', ({ messages }) => {
    if (isSelectedRoom)
        displayRoomMessages(messages)
    chatMessages.scrollTop = chatMessages.scrollHeight // Show scroll down
})
let fileid = 0
// Get fileID
socket.on('file', fileID => {
    console.log("fileid: " + fileID)
    fileid = fileID
    //downloadURI(file.data, file.filename)
})

// Get file
socket.on("getFile", ({file}) => {
    console.log("file")
    console.log(file)
    downloadURI(file.data, file.filename)
})

// Add message to DOM
// Used for client side, showing message
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

    if(message.type === "file") {
        div.setAttribute("id", message.id)
    }

    document.getElementById("messages").appendChild(div)

    if(message.type === "file") {
        document.getElementById(message.id).onclick = () => {
            socket.emit("getFile", message.id)
            console.log("file id: " + message.id)
         }
    }
}

// Add messages to DOM -> it is used for private messages
function displayMessages(messages) {
    while (chatMessages.lastChild) chatMessages.removeChild(chatMessages.lastChild) // Clear div
    for (const message of messages) {
        if (!(messages.length > 0 && pairMessage(message, username, targetClientName))) continue // Only show pair messages
       
        const div = document.createElement("div")
        // Show message for own or others
        if (message.state === "sended" && username == message.username) {
            div.classList.add("container")
            div.classList.add("darker")
            div.innerHTML = `<img src="img/avatar.png" alt="Avatar" class="right">
    <p><label class="username-chat">${message.username} </label><label class="time">${message.time}</label><br>
    ${message.text}</p>`
        } else if (message.state === "received" && username == message.username) {
            div.classList.add("container")
            div.innerHTML = `<img src="img/avatar.png" alt="Avatar">
    <p><label class="username-chat">${message.target} </label><label class="time">${message.time}</label><br>
    ${message.text}</p>`
        } else if (message.state === "sended" && username != message.username) {
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

        // If file type is file, add id as message id
        if(message.type === "file") {
            div.setAttribute("id", message.id)
        }

        document.getElementById("messages").appendChild(div)

        // Add click event for all file types, and request file
        if(message.type === "file") {
            document.getElementById(message.id).onclick = () => {
                socket.emit("getFile", message.id)
                console.log("file id: " + message.id)
             }
        }
    }
}

// Add clients to DOM
function displayUsers(users) {
    while (allUsers.lastChild) allUsers.removeChild(allUsers.lastChild) // Clear users div
    for (const user of users) {
        if (currentUser.innerText == user.username) continue
        const div = document.createElement("div")
        div.classList.add("user")
        div.setAttribute("id", user.id)
        div.innerHTML = `<img src="img/avatar.png" alt="Avatar">
        <p class="username"><b>${user.username} </b></p>`

        document.getElementById("users").appendChild(div)
        // Add clicl event for selecting client
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
    while (allRooms.lastChild) allRooms.removeChild(allRooms.lastChild) // Clear messages div
    for (const room of rooms) {
        // create div element and display room
        const div = document.createElement("div")
        div.classList.add("container")
        div.setAttribute("id", room.roomname)   // Add id to room div as room name
        div.innerHTML = `<img src="img/room.png" alt="Avatar">
        <p class="username">${room.roomname}</p>`
        document.getElementById("rooms").appendChild(div)
        // Add click event to div for select room name
        document.getElementById(room.roomname).onclick = () => {
            isSelectedRoom = true
            isSelectedTargetClient = false
            selectedRoomName = room.roomname
            socket.emit("joinRoom", selectedRoomName)
            console.log("selected room: " + room.roomname)
        }
    }
}

// Add room messages to DOM
function displayRoomMessages(messages) {
    while (chatMessages.lastChild) chatMessages.removeChild(chatMessages.lastChild) // Clear div messages
    for (const message of messages) {   // Add messages to div
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
    msg = e.target.elements.msg.value

    // Emit message to server
    if (isSelectedTargetClient) {
        if (isSelectedFile) {
            //socket.emit("chatMessage", { msg: selectedFile.name, targetClientId, type: "file" })
            sendFile("chatMessage", selectedFile, username, targetClientId) // Send file to target client
            isSelectedFile = false  // reset selected file
            // display message
            displayMessage({
                username,
                text: msg,
                time: moment().format("h:mm a"),
                type: "file"
            })
        } else {
            // Otherwise send a message
            socket.emit("chatMessage", { msg, targetClientId, type: "text" })

            // And display it
            displayMessage({
                username,
                text: msg,
                time: moment().format("h:mm a"),
                type: "text"
            })
        }


    } else if(isSelectedRoom){
        if (isSelectedFile) {
            // will be updated
            sendFile("chatRoom", selectedFile, username, selectedRoomName)
            isSelectedFile = false
        } else {
            // Send message for room
            socket.emit("chatRoom", { selectedRoomName, username, msg, type: "text" })
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
// msg -> my file object
// target -> to client or room
async function sendFile(event, file, username, target) {
    toBase64(file).then(data => {
        if(event === "chatMessage")
            socket.emit(event, { msg: { username, targetid: target, data, filename: file.name, filetype: file.type }, targetClientId: target, type: "file" })
        else // chatRoom
            socket.emit(event, { selectedRoomName: target, username, msg: { username, targetid: target, data, filename: file.name, filetype: file.type }, type: "file" })
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
