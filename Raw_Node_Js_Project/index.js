/*
 * Title: Server library
  * Description: Initial file to start the node server and workers
 * Date: 25/5/2025
 * Learn by "Learn with Sumit"
 */
//dependencies
const server = require('./lib/server')
const workers = require('./lib/workers');





//app object - module scaffolding
const app = {};
//init function
 
app.init = () => {
  // start the server
  server.init();
  // start the workers  
  workers.init();
}

app.init(); 


module.exports = app;