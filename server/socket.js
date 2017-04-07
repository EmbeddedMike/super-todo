console.log("socket js")

module.exports = {} //structure to hang register and deregister on

//These will be set inside a function and need to be hoisted to module level
let state = {}

//The deregister function exports the state so it can be 
//forwarded to the reloaded module
module.exports.deregister = () => {
  return state;
}

module.exports.register = (bs, newState) => {
  console.log("socket.js registering")
  sock = bs.sockets
  if (newState) {
    state = newState;
    setupState()
    processEntriesFrom(0);
  } else {
    console.log("Setting up");
    state = { seq: 0, connectionData: [] }
    setupState()
    state.onConnection = sock.on('connection', (socket) => {
      state.connectionData.push({ seq: ++state.seq, socket });
      processEntriesFrom(state.connectionData.length - 1);
    });
  }
}

const processEntriesFrom = (n) => {
  for (i = n; i < state.connectionData.length; i++) {
    let entry = state.connectionData[i];
    entry.id = "Session: " + entry.seq;
    if (entry.cb) {
      entry.socket.off("message", entry.cb)
    }
    entry.cb = entry.socket.on('message', (type, body) => {
      state.processMessage(entry.socket, entry.id, type, body);
    });
  }
}


const path = require("path");
const fsp = require("fs-promise");

const setupState = () => {
  const name = "mwolf";
  state.processMessage = (socket, id, type, data) => {
    // we tell the client to execute 'new message'
    console.log("got a message " + type);
    if (type === "getTodo") {
      socket.send("id", id);
      fsp.readFile(path.join(".data", name + ".md")).
        then(contents => contents.toString())
        .then(
        list => socket.send("todo",
          {
            id: id,
            todo: "THIS IS NOT THE list"
          }));
    } else if (type === 'getID') {
      socket.send("id", id);
    }
  }
}




const dumpConnnections = () => {
  console.log(state.connectionData.length + " connections")
  state.connectionData.forEach((element, i) => {
    console.log(`${i}: ${element.id}`)
  }, this);
}



