import React, { Component } from 'react';
//Test the socket connection
const managers = window.___browserSync___.io.managers;

//The first manager is the one that BrowserSync uses

const man1 = managers[Object.keys(managers)[0]];

//The socket that BrowserSync uses is the first entry in the connecting array
const sock = man1.connecting[0];

//So now let's emit data
sock.emit("test", "This is a new socket test");
sock.on("ack", (data) =>{
  console.log("ACK")
  console.log(data);
});
const sock2 = man1.socket("altspace")
sock2.connect()
sock.emit("test", `Socket connected ${sock.connected}`)
sock.emit("test", `Socket2 connected ${sock2.connected}`)
sock.send("message", "more stuff");

let label = "THIS LABEL";
// const io = require("socket.io-client");
// window.io = io;

// console.log(io)
// // var socket = io()
// if (true && !window.socket) {
//   ; //window.socket = io(location.origin + "/browser-sync");
// }
//window.socket.emit('add user', "MIKE");

export default class HelloWorld extends Component {
  constructor(props) {
    console.log("contssructor");
    super(props);
    this.state = {isToggleOn: true};

    // This binding is necessary to make `this` work in the callback
    this.handleClick = this.handleClick.bind(this);
  }
  handleClick() {
   this.setState(prevState => ({
     isToggleOn: !prevState.isToggleOn
   }));
 }

  render() {
    // Play with it...
    const name = 'Worldlyness';

    return (
    <div>
    <button onClick={this.handleClick}>
      {this.state.isToggleOn ? 'ON' : 'OFF'}
    </button>
      <h2 className="hello-world">
        <span className="hello-world__i">Hello , {name}</span>
      </h2>
      </div>
    );
  }
}
