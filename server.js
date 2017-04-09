/**
 * Require Browsersync along with webpack and middleware for it
 */
var express = require("express");
var browserSync = require('browser-sync');
var webpack = require('webpack');
var webpackDevMiddleware = require('webpack-dev-middleware');
var webpackHotMiddleware = require('webpack-hot-middleware');

/**
 * Require ./webpack.config.js and make a bundler from it
 */
var webpackConfig = require('./webpack.config');
var bundler = webpack(webpackConfig);



// Do "hot-reloading" of express stuff on the server
// Throw away cached modules and re-require next time
// Ensure there's no important state in there!
var throttle = require('throttle-debounce/throttle');


/**
 * Run Browsersync and use middleware for Hot Module Replacement
 */
var bs = browserSync.create()
const allMiddleware = (req, res, next) => {
  require("./server/all.js")(bs, req, res, next)
}

const chokidar = require('chokidar');
const watcher = chokidar.watch('./server');
let clearCache = (mode, id) => {
  // console.log("Clearing /server/ module cache from server :" + id);
  const resolved = require.resolve("./" + id);
  let module;
  let state;
  if (require.cache[resolved]) {
    module = require(resolved);
    if (module && module.deregister) state = module.deregister()
    delete require.cache[resolved];
  }
  try {
    let newModule = require(resolved);
    if (newModule.register) newModule.register(bs, state)
  }
  catch (e) {
    console.log("Error requiring a module")
    console.log(e).toString()
    if (module) require.cache[resolved] = module;
    if (module && module.register) module.register(bs, state)
  }

};

const delay = process.env.PROJECT_NAME ? 2000 : 20

clearCache = throttle(delay, false, clearCache);

watcher.on('ready', function () {
  watcher.on('all', clearCache);
});


var bsConfig = {
  server: {
    baseDir: 'app',
    ws: true,
    middleware: [
      webpackDevMiddleware(bundler, {
        // IMPORTANT: dev middleware can't access config, so we should
        // provide publicPath by ourselves
        publicPath: webpackConfig.output.publicPath,

        // pretty colored output
        stats: { chunks: false }

        // for other settings see
        // http://webpack.github.io/docs/webpack-dev-middleware.html
      }),

      // bundler should be the same as above
      webpackHotMiddleware(bundler),
      //this is a hot reloaded middleware
      allMiddleware


    ]
  },

  // no need to watch '*.js' here, webpack will take care of it for us,
  // including full page reloads if HMR won't work
  // files: [
  //   'app/css/*.css',
  //   'app/*.html'
  // ]


};



const initted = function () {
  try {
    require("./server/socket.js").register(bs)
  }
  catch (e) {
    console.log(e)
  }

}
obsolete = () => {
  // socketCode()
  console.log("Initializing");
  let state = {}
  state.seq = 0;
  var sock = bs.sockets;
  state.assignID = (socket) => {
    state.seq++;
    id = "Session " + state.seq
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
            todo: "THIS IS THE list"
          }));
    }
  }

  if (!state.onConnection) {
    state.onConnection = sock.on('connection', (socket) => {
      let id = state.assignID(socket)
      socket.on('message', (type, body) => {
        state.processMessage(socket, id, type, body);
      });
    });
  }
};
// sock.on ("connect")

bs.init(bsConfig, initted);
