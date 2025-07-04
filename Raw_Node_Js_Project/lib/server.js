/*
 * Title: Project Initial file 
* Description: Initial file to stat the node server and workers
 * Date:03/7/2025
 * Learn by "Learn with Sumit"
 */
//dependencies
const http = require('http');
const { handleReqRes } = require('../helpers/handleReqRes');

//serer object - module scaffolding
const server = {};
//configuration
server.config = {
  port: 3000
};

// create server
server.createServer = () => {
  const createServerVariable = http.createServer(server.handleReqRes);
  createServerVariable.listen(server.config.port, () => {
    console.log(`listening to port: http://localhost:${server.config.port}`);
  });
};

// handle Request Response
server.handleReqRes = handleReqRes;

// start the server
server.init = () => {
  // create server
  server.createServer();
};

//export the module
module.exports = server;