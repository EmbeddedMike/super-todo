import React, { Component } from 'react';
//Test the socket connection
const managers = window.___browserSync___.io.managers;
window.myBeforeUnload = () => {console.log("closing"); sock.send("closing")}

//The first manager is the one that BrowserSync uses

const man1 = managers[Object.keys(managers)[0]];

//The socket that BrowserSync uses is the first entry in the connecting array
const sock = man1.connecting[0];


let label = "THIS LABEL";
let hasBeenSetup = false; //Reset when module reloads

let setupCB = (_this) => {
  if (hasBeenSetup) return;
  //Release old callback, if it exists
  console.log("SETUP")
  if (_this.socketCB) {
    console.log("OFF")
    sock.off("message", _this.socketCB);
  }

  console.log("set up the socket")

  _this.socketCB = sock.on("message", (type, data) => {
    // console.log("message received '" + type + "'")
    if (type === 'id') {
      // console.log("got id")
      _this.setState({ id: data });
    } else if (type === 'todo') {
      console.log("TODO received")
      console.log(data);
      _this.props.returnTodo + ""
      _this.props.returnTodo(data.todo)
      _this.setState({ last: data.todo.substring(0, 20) });
      // console.log("ACK from mounted Remounted listener")
      // console.log(substring(0,20));
    } else {
      _this.setState({ last: `unknown message ${type}` });
    }
  });
  
  hasBeenSetup = true;
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
    window.addEventListener("beforeunload", () => window.myBeforeUnload())

    // sock.send("opening");
  }
  componentWillUnmount() {
    console.log("UNLOADING")
    sock.send("closing");

  }
componentWillReceiveProps(nextProps){
  console.log("Will receive")
  if(nextProps.id != this.props.id){
    sock.send("getTodo", {id: nextProps.id});
  }
}

render() {
  // Play with it...
  const name = 'SocketStatus1';
  setupCB(this);
  return (
    <div>
      <h2 className="hello-world">
        <span className="hello-world__i">ID: {this.props.id}</span>
      </h2>
      <h2 className="hello-world">
        <span className="hello-world__i">{this.state.last}</span>
      </h2>
    </div>
  );
}
}
