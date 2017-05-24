import React, { Component } from 'react';
//Test the socket connection
const managers = window.___browserSync___.io.managers;


//The first manager is the one that BrowserSync uses

const man1 = managers[Object.keys(managers)[0]];

//The socket that BrowserSync uses is the first entry in the connecting array
let sock = man1.connecting[0];

//import sockLog from ('sockLog')
//Socket IO with logging
class SockLog {
  sockLog = []
  constructor(sock) {
    this.sock = sock;

    if (window._oldSockLog) {
      window._oldSockLog.callbacks.map(
        (entry) => entry.sock.off(entry.message, entry.cb))
    }
    this.callbacks = []
    window._oldSockLog = this;
    this.clearLog = this.clearLog.bind(this);
  }
  clearLog(component) {
    this.sockLog = []

    component.forceUpdate()
  }

  dump(string) {
    return;
    console.log(string);
    this.sockLog.map((item) => console.log(item));
    console.log("=====")
  }
  send(type, data) {
    this.sockLog.push({ op: "send", type, data });
    this.sock.send(type, data)
  }
  on(message, cb) {
    this.newCB = (type, data) => {
      this.sockLog.push({ op: "get", type, data });
      this.dump("After on")
      cb(type, data);
    }
    this.callbacks.push({ sock, message, cb: this.newCB })
    this.sock.on(message, this.newCB)
  }
  off(message, cb) {
    this.sock.off(message, this.newCB)
  }
}
sock = new SockLog(sock)

let label = "THIS LABEL";
let hasBeenSetup = false; //Reset when module reloads

let setupCB = (_this) => {
  if (hasBeenSetup) return;
  //Release old callback, if it exists
  if (_this.socketCB) {
    sock.off("message", _this.socketCB);
  }


  _this.socketCB = sock.on("message", (type, data) => {
    // console.log("message received '" + type + "'")
    if (type === 'todo') {
      // console.log("TODO received")
      // console.log(data);
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
class SocketStatus extends Component {
  constructor(props) {
    super(props);
    this.state = { isToggleOn: true };
    this.state = { last: "no message yet" }
    // This binding is necessary to make `this` work in the callback
    this.handleClick = this.handleClick.bind(this);
  }
  handleClick() {
    this.setState(prevState => ({
      isToggleOn: !prevState.isToggleOn
    }));
  }
  componentWillMount() {
    // console.log("mount");
    setupCB = setupCB.bind(this);

    // sock.send("opening");
  }
  componentWillUnmount() {
    // console.log("UNLOADING")
    sock.send("closing");

  }
  componentDidMount() {
    sock.send("getTodo", { user: this.props.user });
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.user && nextProps.user != this.props.user) {
      return sock.send("getTodo", { user: nextProps.user });
    }
    if (nextProps.editorAction && (nextProps.editorAction.op === 
    "saveTodo")) {
      sock.send("saveTodo", { user: nextProps.user, data: this.props.getTodo() });
    }

  }
  
  clearLog() {
    console.clear()
    // console.log("Clearest");
    sock.clearLog(this);
  }
  render() {
    // Play with it...
    const name = 'SocketStatus1';
    setupCB(this);
    return (
      <div>
        <button onClick={this.clearLog.bind(this)}>Clear</button>
        <ul>
          {sock.sockLog.length + " " + this.state.last}
          {"ALT: " + this.props.user}
          {sock.sockLog.map((e, i) => <li key={"" + i}>{e.op
            + " : "
            + e.type + " "
            + JSON.stringify(e.data).slice(0, 100)}</li>)}
        </ul>
      </div>
    );
  }
}
import { connect } from "react-redux";
const mapStateToProps = (state, ownProps) => {
  return { user: state.user,
           editorAction: state.editorAction }
}
const mapDispatchToProps = (dispatch, ownProps) => {
  return{}
  return {
    setUser : (name) => {
        dispatch(setUser(name))
    }
  }
}
    
export default connect(
      mapStateToProps,
      null
    )(SocketStatus)
