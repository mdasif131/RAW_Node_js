/*
 * Title: Handle Request Response
 * Description: Handle Request response
 * Date: 25/5/2025
 * Learn by "Learn with Sumit"
 */

// Depndensies
const url = require('url');
const { StringDecoder } = require('string_decoder');
const routes = require('../routes');
const {
  notFoundHandler,
} = require('../handlers/routeHandlers/notFoundHandler');
const { parseJSON } = require('../helpers/utilites');

// module scaffolding
const handler = {};

handler.handleReqRes = (req, res) => {
  // request handling
  // get the url and parse it
  const parseUrl = url.parse(req.url, true);
  const path = parseUrl.pathname;
  const trimmedPath = path.replace(/^\/+|\/+$/g, '');
  const method = req.method.toLowerCase();
  const queryStringObject = parseUrl.query;
  const headersObject = req.headers;
  const requestProperties = {
    parseUrl,
    path,
    trimmedPath,
    method,
    queryStringObject,
    headersObject,
  };
  

  const decoder = new StringDecoder('utf-8');
  let realData = '';

  const chosenHandler = routes[trimmedPath]
    ? routes[trimmedPath]
    : notFoundHandler;

  req.on('data', buffer => {
    realData += decoder.write(buffer);
  });
  req.on('end', () => {
    realData += decoder.end();
    requestProperties.body = parseJSON(realData);
    // console.log(realData);
    console.log('Request Body:', requestProperties.body);

    chosenHandler(requestProperties, (statusCode, payload) => {
      statusCode = typeof statusCode === 'number' ? statusCode : 500;
      payload = typeof payload === 'object' ? payload : {};

      const payloadString = JSON.stringify(payload);

      // return the final response
      res.setHeader('Content-Type', 'application/json');
      res.writeHead(statusCode);
      res.end(payloadString);
    });
  });
};

module.exports = handler;
