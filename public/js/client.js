//const socket = io()
var socket = io()
let port = 3000
let ip = "127.0.0.1"
socket.connect('http://' + ip + ':' + port)



let clicked = false
document.getElementById('emoji-table').style.display="none"
document.getElementById('btn-emoji').onclick = () => {
    if(clicked){
        document.getElementById('emoji-table').style.display="none"
        clicked = false
    } else {
        document.getElementById('emoji-table').style.display="inline-block"
        clicked = true
    }
}

