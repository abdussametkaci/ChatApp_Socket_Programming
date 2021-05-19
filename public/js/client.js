const roomForm = document.getElementById('room-form')
const chatForm = document.getElementById('chat-form')
const chatMessages = document.getElementById("messages")
const currentUser = document.getElementById("current-username")

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
let isSelectedTargetClient = false

let room = ""
console.log(username, "joined to app")
currentUser.innerText = username

// Join chatRoom
socket.emit('joinApp', { username, room })

// Get room and users
socket.on('onlineUsers', ({ users }) => {
    displayUsers(users)
})

// Message from server
socket.on('message', message => {
    console.log(message)
    displayMessage(message)

    // Scroll down
    chatMessages.scrollTop = chatMessages.scrollHeight
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

function displayUsers(users) {
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
            isSelectedTargetClient = true
            console.log("target client id: " + targetClientId + ", username: " + user.username)
        };
    }
}

// New Room submit
roomForm.addEventListener('submit', (e) => {
    e.preventDefault()

    // Get new room name
    const msg = e.target.elements.msg.value

    const div = document.createElement("div")
    div.classList.add("container")
    div.innerHTML = `<img src="img/avatar.png" alt="Avatar">
    <p class="username">${msg}</p>`

    document.getElementById("rooms").appendChild(div)

    // Emit message to server
    socket.emit("newRoom", msg)

    // Clear input
    e.target.elements.msg.value = ""
    e.target.elements.msg.focus()
})

// Message submit
chatForm.addEventListener('submit', (e) => {
    e.preventDefault()

    // Get message text
    const msg = e.target.elements.msg.value

    // Emit message to server
    if (isSelectedTargetClient) {
        socket.emit("chatMessage", { msg, targetClientId })
        displayMessage({
            username,
            text: msg,
            time: moment().format("h:mm a")
        })
    }


    // Clear input
    e.target.elements.msg.value = ""
    e.target.elements.msg.focus()
})

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


