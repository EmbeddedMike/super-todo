module.exports = {} //structure to hang register and deregister on

//These will be set inside a function and need to be hoisted to module level
let state = {}

//The deregister function exports the state so it can be 
//forwarded to the reloaded module
module.exports.deregister = () => {
  return state;
}

//the 
module.exports.register = (bs, newState) => {
  sock = bs.sockets
  if (newState) {
    state = newState;
  } else {
    state = { seq: 0, connectionData: [] }
  }
  setupState(sock)
}

const replaceListener = (agent, message, obj, attr, cb) =>{
  let oldCB = obj[attr];
  if(oldCB) agent.removeListener(message, oldCB);
  agent.addListener(message, cb);
  obj[attr] = cb;
}


const setupState = (sock) => {
  state.userName = "mwolf";
  replaceListener(sock,"connection", state, 'connectionListener', connectionListener );
  replaceListener(sock,"close", state, 'disconnectionListener', disconnectionListener );
  state.connectionData.map(processConnection)
}

const connectionListener = (socket) => {
  console.log("connection")
  const newConnection = { seq: ++state.seq, socket }
  state.connectionData.push(newConnection);
  processConnection(newConnection);
};
const disconnectionListener = (socket) => {
  console.log("Disconnected!!!");
};

const processConnection = (entry) => {
  replaceListener(entry.socket,
    "message", entry, 'cb', 
    (type, body) => {
    processMessage(entry.socket, entry.id, type, body);
    }
  )
  entry.socket.send("heartbeat", "" + entry.seq)
}


const processMessage = (socket, id, type, data) => {
  // we tell the client to execute 'new message'
  if (type === "getTodo") {
    getTodo(socket, id, type, data)
  } else if (type === 'getID') {
    socket.send("id", id);
  } else if(type === 'closing'){
    console.log("closing!!!!!");
  } else if(type === 'opening'){
    console.log("opening!!!!!");
  }
  }



const path = require("path");
const fsp = require("fs-promise");

const getTodo = (socket, id, type, data) => {
  console.log("getDoto")
  state.userName = data.id;
  fsp.readFile(path.join(".data", state.userName + ".md")).
    then(contents => contents.toString())
    .then(
    list => socket.send("todo",
      {
        id: id,
        todo: list
      }));
}





const dumpConnnections = () => {
  console.log(state.connectionData.length + " connections")
  state.connectionData.forEach((element, i) => {
    console.log(`${i}: ${element.id}`)
  }, this);
}



