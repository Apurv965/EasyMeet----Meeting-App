import {Server} from "socket.io";

let connections = {}
let message = {}
let timeOnline = {}
let participants = {}

export const connectToSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
            allowedHeaders: ["*"],
            credentials: true
        }
    });

    io.on("connection", (socket) => {
        
        socket.on("join-call", (payload) => {
            const roomPath = typeof payload === "string" ? payload : payload?.path;
            const username = payload?.username || "Guest";

            if(!roomPath){
                return;
            }

            if(connections[roomPath] === undefined){
                connections[roomPath] = []
            }
            if(participants[roomPath] === undefined){
                participants[roomPath] = {}
            }

            connections[roomPath].push(socket.id)
            participants[roomPath][socket.id] = username
            timeOnline[socket.id] = new Date();

            // connections[path].forEach(element => {
            //     io.to(element)
            // });

            for(let a = 0; a < connections[roomPath].length; a++){
                io.to(connections[roomPath][a]).emit("user-joined", socket.id, connections[roomPath], participants[roomPath])
            }

            if(message[roomPath] != undefined){
                for(let a = 0; a < message[roomPath].length; ++a){
                    io.to(socket.id).emit("chat-message", message[roomPath][a]['data'],
                        message[roomPath][a]['sender'], message[roomPath][a]['socket-id-sender']
                    )
                }
            }
        })

        socket.on("signal", (toId, message) => {
            io.to(toId).emit("signal", socket.id, message);
        })

        socket.on("chat-message", (data, sender) => {

            const [matchingRoom, found] = Object.entries(connections)
            .reduce(([room, isFound], [roomKey, roomValue]) => {
                if(!isFound && roomValue.includes(socket.id)){
                    return [roomKey, true];
                }
                return [room, isFound];
            }, ['', false]);

            if(found === true){
                if(message[matchingRoom] === undefined){
                    message[matchingRoom] = []
                }
                message[matchingRoom].push({'sender': sender, "data": data, "socket-id-sender": socket.id})
                // console.log("message", matchingRoom, ":", sender, data)

                connections[matchingRoom].forEach((elem) => {
                    io.to(elem).emit("chat-message", data, sender, socket.id)
                })
            }
        })

        socket.on("disconnect", () => {
            for(const[k, v] of JSON.parse(JSON.stringify(Object.entries(connections)))){
                for(let a = 0; a < v.length; ++a){
                    if(v[a] === socket.id){
                        const key = k;

                        for(let a = 0; a < connections[key].length; ++a){
                            io.to(connections[key][a]).emit('user-left', socket.id)
                        }

                        const index = connections[key].indexOf(socket.id)

                        connections[key].splice(index, 1)
                        delete participants[key][socket.id]

                        for(let a = 0; a < connections[key].length; ++a){
                            io.to(connections[key][a]).emit('participants-update', participants[key])
                        }

                        if(connections[key].length === 0){
                            delete connections[key]
                            delete participants[key]
                        }
                    }
                }
            }

            delete timeOnline[socket.id]
        })
    
    })

    return io;
}
