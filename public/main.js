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

// Webrtc provides a standard api for accessing cameras and microphones connected to the device
navigator.mediaDevices 
    .getUserMedia({
        video: true,
        audio: true,
    })
    .then((stream) => {
        myVideoStream = stream;
        addVideoStream(myVideo, stream, myname);

        socket.on("user-connected", (id, username) => {
            connectToNewUser(id, stream, username); 
            socket.emit("tellName", myname);
        });

        socket.on("user-disconnected", (id) => {
            console.log(peers);
            if (peers[id]) peers[id].close();
        });
    });
peer.on("call", (call) => { 
    getUserMedia({ video: true, audio: true },
        function(stream) {
            call.answer(stream);
            const video = document.createElement("video");
            call.on("stream", function(remoteStream) {
                addVideoStream(video, remoteStream, OtherUsername);
            });
        },
        function(err) {
            console.log("Failed to get local stream", err);
        }
    );
});

peer.on("open", (id) => {
    socket.emit("join-room", roomId, id, myname); 
});

socket.on("createMessage", (message) => {
    var ul = document.getElementById("messageadd");
    var li = document.createElement("li");
    li.className = "message";
    li.appendChild(document.createTextNode(message));
    ul.appendChild(li);
});

socket.on("AddName", (username) => { // Tell other user their name
    OtherUsername = username;
    console.log(username);
});

const RemoveUnusedDivs = () => { // This function is used to remove unused divs whenever if it is there
    //
    alldivs = videoGrids.getElementsByTagName("div"); // Get all divs in our video area
    for (var i = 0; i < alldivs.length; i++) { // loop through all the divs
        e = alldivs[i].getElementsByTagName("video").length; // Check if there is a video elemnt in each of the div
        if (e == 0) { // If no
            alldivs[i].remove // remove
        }
    }
};

const connectToNewUser = (userId, streams, myname) => {
    const call = peer.call(userId, streams); 
    const video = document.createElement("video"); 
    call.on("stream", (userVideoStream) => { 
        addVideoStream(video, userVideoStream, myname);
    });
    call.on("close", () => {
        video.remove();
        RemoveUnusedDivs();
    });
    peers[userId] = call;
};

const cancel = () => {
    $("#getCodeModal").modal("hide");
};

 // copy our Invitation link when we press the copy button
const copy = async() => {
    const roomid = document.getElementById("roomid").innerText;
    await navigator.clipboard.writeText("http://localhost:3000/join/" + roomid);
};
const invitebox = () => {
    $("#getCodeModal").modal("show");
};

 // Mute Audio
const muteUnmute = () => {
    const enabled = myVideoStream.getAudioTracks()[0].enabled;
    if (enabled) {
        myVideoStream.getAudioTracks()[0].enabled = false;
        document.getElementById("mic").style.color = "red";
    } else {
        document.getElementById("mic").style.color = "white";
        myVideoStream.getAudioTracks()[0].enabled = true;
    }
};


