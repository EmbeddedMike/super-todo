import React, { Component } from 'react';
//Test the socket connection
const managers = window.___browserSync___.io.managers;

//The first manager is the one that BrowserSync uses

const man1 = managers[Object.keys(managers)[0]];

//The socket that BrowserSync uses is the first entry in the connecting array
const sock = man1.connecting[0];

//So now let's emit data
sock.emit("test", "This is a new socket test");

// const sock2 = man1.socket("altspace")
// sock2.connect("connect payload")
// sock.emit("test", `Socket connected ${sock.connected}`)
// sock.emit("test", `Socket2 connected ${sock2.connected}`)
sock.send("something that is not a message", "more stuff");

let label = "THIS LABEL";
// const io = require("socket.io-client");
// window.io = io;

// console.log(io)
// // var socket = io()
// if (true && !window.socket) {
//   ; //window.socket = io(location.origin + "/browser-sync");
// }
//window.socket.emit('add user', "MIKE");
let reloaded = true; //Reset when module reloads

let setupCB = (_this) => {
  console.log("SETUP")
  // if (reloaded) {
  //   reloaded = false;
  //   if (_this.socketCB) {
  //     console.log("OFF")
  //     sock.off("message", socketCB);
  //     _this.socketCB = undefined
  //   }
  // }
  if (!_this.sockeCB) {
    console.log("set up socket")
    _this.socketCB = sock.on("message", (data) => {
      _this.setState({ last: data });
      console.log("ACK from mounted MESSAGE listener")
      console.log(data);
    });

  }
}
export default class SocketStatus extends Component {
  constructor(props) {
    super(props);
    this.state = { isToggleOn: true };
    this.state = { last: "no messsage yet" }
    // This binding is necessary to make `this` work in the callback
    this.handleClick = this.handleClick.bind(this);
  }
  handleClick() {
    this.setState(prevState => ({
      isToggleOn: !prevState.isToggleOn
    }));
  }
  componentWillMount() {
    console.log("mount");
    setupCB = setupCB.bind(this);

  }
  componentWillUnmount() {
    console.log("Unmount")

  }
  render() {
    // Play with it...
    const name = 'SocketStatus';
    console.log(setupCB)
    setupCB(this);

    return (
      <div>
        <button onClick={this.handleClick}>
          {this.state.isToggleOn ? 'ON' : 'OFF'}
        </button>
        <h2 className="hello-world">
          <span className="hello-world__i">{this.state.last}</span>
        </h2>
      </div>
    );
  }
}
