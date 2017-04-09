# Client side
The client side uses the `browsersync` socket through some kludgy code:

```javascript
const managers = window.___browserSync___.io.managers;

//The first manager is the one that BrowserSync uses

const man1 = managers[Object.keys(managers)[0]];

//The socket that BrowserSync uses is the first entry in the connecting array
const sock = man1.connecting[0];
```
Now that we have the socket we can `emit` or `send ` data:

```javascript
sock.emit("test", "This is a new socket test");
sock.send("something that is not a message", "more stuff");
```

On the server side we get the socket from `browsersync` and once we've got it, we can listen:

```javascript
socket.on('message', function (data, body) {
 ///do stuff
});

socket.on('test', function (data) {
///do stuff

});
```
The `message` listener gets whatever is sent with `socket.send.` It would also get something sent by a custom emit event: `socket.emit('message',....)`

The process of operation is the following:

