const socket = io("/"); 
const main__chat__window = document.getElementById("main__chat_window"); 
const videoGrids = document.getElementById("video-grids"); 
const myVideo = document.createElement("video"); 
const chat = document.getElementById("chat"); 
    OtherUsername = "";
chat.hidden = true;
myVideo.muted = true;

window.onload = () => {
    $(document).ready(function() {
        $("#getCodeModal").modal("show");
    });
};

var peer = new Peer(undefined, {
    path: "/peerjs",
    host: "/",
    port: "3000",
});

let myVideoStream;
const peers = {};
var getUserMedia =
    navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia;

sendmessage = (text) => {
    if (event.key === "Enter" && text.value != "") {
        socket.emit("messagesend", myname + ' : ' + text.value); 
        text.value = "";
        main__chat_window.scrollTop = main__chat_window.scrollHeight;
    }
};