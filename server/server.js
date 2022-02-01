const express = require("express");
const app = express();
const server = require("http").Server(app);
const { v4: uuidv4 } = require("uuid");
const io = require("socket.io")(server);
const { ExpressPeerServer } = require("peer");
const url = require("url");
const peerServer = ExpressPeerServer(server, { 
    debug: true,
});
const path = require("path");

app.set("view engine", "ejs");
app.use("/public", express.static(path.join(__dirname, "static")));
app.use("/peerjs", peerServer); // Now we just need to tell our application to server our server at "/peerjs".Now our server is up and running

app.get("/", (req, res) => { // On the '/' route
    res.sendFile(path.join(__dirname, "static", "index.html")); // Send our Intro page file(index.js)
});

app.get("/join", (req, res) => { // Our intro page redirects us to /join route with our query strings(We reach here when we host a meeting)
    res.redirect( // When we reach /join route we redirect the user to a new unique route with is formed using Uuid 
        url.format({ // The url module provides utilities for URL resolution and parsing.
            pathname: `/join/${uuidv4()}`, // Here it returns a string which has the route and the query strings.
            query: req.query, // For Eg : /join/A_unique_Number?Param=Params. So we basically get redirected to our old_Url/join/id?params
        })
    );
});

// The intro page redirects us to /joinold route with our query strings
app.get("/joinold", (req, res) => { 
    res.redirect(
        url.format({
            pathname: req.query.meeting_id,
            query: req.query,
        })
    );
});

// When we reach here after we get redirected to /join/join/A_unique_Number?params
app.get("/join/:rooms", (req, res) => { 
    res.render("room", { roomid: req.params.rooms, Myname: req.query.name }); 
}); 

// When a user coonnects to our server
io.on("connection", (socket) => { 

    // When the socket a event 'join room' event
    socket.on("join-room", (roomId, id, myname) => { 
        socket.join(roomId); 
        socket.to(roomId).broadcast.emit("user-connected", id, myname);

        socket.on("messagesend", (message) => { 
            console.log(message);
            io.to(roomId).emit("createMessage", message);
        });

        socket.on("tellName", (myname) => {
            console.log(myname);
            socket.to(roomId).broadcast.emit("AddName", myname);
        });

        // When a user disconnects or leaves
        socket.on("disconnect", () => { 
            socket.to(roomId).broadcast.emit("user-disconnected", id);
        });
    });
});

server.listen(process.env.PORT || 3000); // Listen on port 3030.
