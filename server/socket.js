console.log("socket js")
module.exports = () =>{
  console.log("Socket.js called")
}

let state = {}
let socket = null;
let doAssignments = () =>{
  state.assignID = (socket) => {
    state.seq++;
    id = "QUACK " + state.seq
    console.log(`Session ${id} connected~~~~`)
    socket.send("id", id);
    return id;
  }
  state.processMessage = (socket, id, type, body) => {
    // we tell the client to execute 'new message'
    console.log("got a message " + type);
    if (type === "getTodo") {
      socket.send("id", id);
      readTodoList("mwolf").then(
        list => socket.send("todo",
          {
            id: id,
            todo: "THIS IS NOT THE list"
          }));
    }
  }
}
const path = require("path");
const fsp = require("fs-promise");

const readTodoList = (name) => {
  return fsp.readFile(path.join(".data", name + ".md")).then(contents => contents.toString());
}

module.exports.register = (bs, newState) => {
  console.log("socket.js registering")
  sock = bs.sockets
  if (newState) {
    state = newState;
    console.log(state.connectionData.length + " connections")
    state.connectionData.forEach( (element,i) => {
      console.log( `${i}: ${element.id}`)
    }, this);
    doAssignments();
  } else {
    console.log("Setting up");
    state = {}
    state.seq = 0;
    state.connectionData = []
    doAssignments();
    state.onConnection = sock.on('connection', (socket) => {
      
      let id = state.assignID(socket)
      let cb = socket.on('message', (type, body) => {
        state.processMessage(socket, id, type, body);
      });
      state.connectionData.push({id, cb});
    });
  }
}

module.exports.deregister = () => {
  console.log("socket.js deregistering");
  return state;
}


