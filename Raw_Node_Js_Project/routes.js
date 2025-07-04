/*
 * Title: Routes
 * Description: Application Routes
 * Date: 25/5/2025
 * Learn by "Learn with Sumit"
 */

// dependencies
const { sampleHandler } = require('./handlers/routeHandlers/sampleHandler');
const { tokenHandler } = require('./handlers/routeHandlers/tokenHandler');
const { userHandler } = require('./handlers/routeHandlers/userHandler');
const { checkHandler } = require('./handlers/routeHandlers/checkHandler');
const routes = {
  sample: sampleHandler,
  user: userHandler,
  token: tokenHandler,
  check: checkHandler,
};

module.exports = routes;
