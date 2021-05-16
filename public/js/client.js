//const socket = io()
var socket = io()
let port = 3000
let ip = "127.0.0.1"
socket.connect('http://' + ip + ':' + port)

