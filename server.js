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
var debounce = require('debounce');


/**
 * Run Browsersync and use middleware for Hot Module Replacement
 */
 var bs = browserSync.create()
 const allMiddleware = (req,res,next) => {
  require("./server/all.js")(bs,req,res,next)
  }
const chokidar = require('chokidar');
const watcher = chokidar.watch('./server');
let clearCache = (mode, id) => {
  console.log("Clearing /server/ module cache from server :" + id);
  const resolved = require.resolve("./" +id);
  let module;
  if (require.cache[resolved]){
    module = require(resolved);
    if (module.deregister ) module.deregister()
    delete require.cache[resolved];
  }
  module = require(resolved);
  if (module.register ) module.register(bs)
  // Object.keys(require.cache).forEach(function(id) {
  //   if (/[\/\\]server[\/\\]/.test(id)) delete require.cache[id];
  // });
};
clearCache = debounce(clearCache,2000,true); /*change on leading edge*/

watcher.on('ready', function() {
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
        allMiddleware,
        {
          route: "/api", // per-route
          handle: function (req, res, next) {
            console.log("API Route hit");
            require("./server/app.js")(bs,req,res,next);

              // handle any requests at /api
          }

        }
      ]
    },

    // no need to watch '*.js' here, webpack will take care of it for us,
    // including full page reloads if HMR won't work
    // files: [
    //   'app/css/*.css',
    //   'app/*.html'
    // ]


};

const initted = function() {
  console.log("SOCKETS");

  var sock = bs.sockets;
  sock.on('test', (data) => console.log("GOT TEST"));
  sock.on('connection', function (socket) {
    var addedUser = false;
    console.log("SOCKET connected~~~~")
    socket.on('message', function (data, body) {
      // we tell the client to execute 'new message'
      console.log("got a message " + data);
    });

    socket.on('test', function (data) {
      // we tell the client to execute 'new message'
      console.log("got test ")
      socket.emit("ack", "Test ack");
    });
    socket.use(function(packet, next){
      console.log(packet)
      socket.emit("ack", "This is an ack");
      return next();
    });
    // console.log(s  ocket)
    // when the client emits 'new message', this listens and executes


  });
};
  // sock.on ("connect")

bs.init(bsConfig,initted);
