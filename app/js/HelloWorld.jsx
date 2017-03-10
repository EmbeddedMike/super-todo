import React, { Component } from 'react';
let label = "THIS LABEL"
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
    const name = 'World';

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
