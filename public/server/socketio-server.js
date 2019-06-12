// https://github.com/networked-aframe/networked-aframe/blob/master/server/easyrtc-server.js


// Load required modules
var http = require("http");              // http server core module
var express = require("express");           // web framework external module
var socketIo = require("socket.io");        // web socket external module


// Set process name
process.title = "node-socketio-server";

// Get port or default to 8080
//var port = process.env.PORT || 8080;

// constants
var closeServerTimeoutInMillis = 3000;

// global variables
var webServer;  // node http
var app;  // e.g. express
var socketServer;  // socket.io server


/* open server */

function openServer(port, rootDirPath = 'public/server/static', filesDirPath = null, webServerStaticFilesPathPrefix = null) {
  // Setup and configure Express http server. Expect a subfolder called "static" to be the web root.
  app = express();  
  console.log('rootDirPath: ' + rootDirPath);
  app.use(express.static(rootDirPath, {'index': ['index.html']}));

  if (filesDirPath) {
    console.log('filesDirPath: ' + filesDirPath);
    app.use(`/${webServerStaticFilesPathPrefix}`, express.static(filesDirPath));
  }

  // Start Express http server
  webServer = http.createServer(app);

  // Start Socket.io so it attaches itself to Express server
  socketServer = socketIo.listen(webServer);

  // listen on port
  webServer.listen(port, function () {
    console.log('listening on http://localhost:' + port);
  });

  let presenter = null;
  let sceneData = null;
  let viewer = [];
  socketServer.on('connection', (socket) => {
    // console.log('a user connected');
    socket.on('registerPresenter', (projectData) => {
      console.log('presenter connected');
      presenter = socket;
      socket.emit('serverMsg', 'You are now presenter');
      // console.log(getIp());
      presenter.emit('updateViewerCount', viewer.length);
    });
    socket.on('registerViewer', () => {
      console.log('viewer connected');
      socket.emit('serverMsg', 'You are now viewer');
      viewer.push(socket);
      console.log(sceneData);
      if (sceneData) {
        socket.emit('updateSceneData', sceneData);
      }
      if (presenter) {
        presenter.emit('updateViewerCount', viewer.length);
      }
    });
    socket.on('disconnect', () => {
      console.log('user disconnected');
      if (socket !== presenter) {
        viewer = viewer.filter((val, idx, arr) => {
          return val !== socket;
        })
        presenter.emit('updateViewerCount', viewer.length);
      }
    });
    socket.on('test', (data) => {
      if (presenter === socket) {
        // only let presenter send msg
        // if (data.action === "hello") {
          socket.broadcast.emit(data);
        // }
      }
    });
    socket.on('useSceneData', (data) => {
      console.log('useSceneData', presenter.id, socket.id);
      if (presenter.id === socket.id) {
        console.log('useSceneData');
      // only let presenter send msg
      // if (data.action === "hello") {
        sceneData = data;
        socket.broadcast.emit('updateSceneData', data);
        // }
      }
    });
    socket.on('updateSceneStatus', (data) => {
      // console.log('updateSceneStatus', presenter.id, socket.id);
      if (presenter.id === socket.id) {
        console.log('updateSceneStatus');
      // only let presenter send msg
      // if (data.action === "hello") {
        // sceneData = data;
        socket.broadcast.emit('updateSceneStatus', data);
        // }
      }
    });
    
    // basic flow
    /* 
      registerViewer 
        - check if presenter present
          > yes, reply the presenter project data
            > if the presentation started, may be need to send the current progress data
          > no, reply waiting message
      registerPresenter
        - store the presenter project data  
        - reply the ip address of current computer
        - may be a general endpoint for all the messages from the presenter,
          then broadcast to all viewers
      disconnected
        viewer
          - should be nothing to handle
        presenter
          - broadcast to the viewer?

      (do we need a chatting system also?)
    */
  })
}

/* end of open server */


/* close server */

function closeServer() {
  socketServer.close(_ => {
    socketServer = null;
    webServer.close((err) => {
      app = null;
      webServer = null;
      exitSuccess();
    });
  });
  setTimeout(_ => {
    socketServer = null;
    app = null;
    webServer = null;
    exitSuccess();
  }, closeServerTimeoutInMillis);
}

function exitSuccess() {
  console.log("socketio-server: web server closed.");
  process.exit(0);
}

/* end of close server */


/* ipc */
// https://nodejs.org/api/child_process.html#child_process_subprocess_send_message_sendhandle_options_callback

process.on('message', (message) => {
  switch (message.address) {
    case 'open-server':      
      openServer(message.port, message.rootDirPath, message.filesDirPath, message.webServerStaticFilesPathPrefix);
      break;
    case 'close-server':
      closeServer();
      break;
  }  
});

/* end of ipc */

// openServer(1111, './');