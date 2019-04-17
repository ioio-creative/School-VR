// https://fabiofranchino.com/blog/use-electron-as-local-webserver/

const http = require('http');
const static = require('node-static');


let fileServer;


function createServer(port, rootDirPath) {
  fileServer = new static.Server(rootDirPath);
  http.createServer((request, response) => {
    request.addListener('end', _ => {
      fileServer.serve(request, response);
    }).resume();
  }).listen(port);
}


/* ipc */
// https://nodejs.org/api/child_process.html#child_process_subprocess_send_message_sendhandle_options_callback

process.on('message', (message) => {
  if (message.address === 'create-server') {
    createServer(message.port, message.rootDirPath);
  }  
});

/* end of ipc */