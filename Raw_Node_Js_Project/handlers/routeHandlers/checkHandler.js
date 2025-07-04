/*
 * Title: Check Handler
 * Description: Handler to handle user defined checks
 * Date: 3/6/2025
 * Learn by "Learn with Sumit"
 */

// dependensies
const data = require('../../lib/data');
const { parseJSON, createRandomString } = require('../../helpers/utilites');
const tokenHandler = require('./tokenHandler');
const { maxChecks } = require('../../helpers/environments');

// module scaffolding
const handle = {};

handle.checkHandler = (requestProperties, callBack) => {
  const acceptedMethods = ['get', 'post', 'put', 'delete'];
  if (acceptedMethods.indexOf(requestProperties.method) > -1) {
    handle._check[requestProperties.method](requestProperties, callBack);
  } else {
    callBack(405);
  }
};
handle._check = {};
handle._check.post = (requestProperties, callBack) => {
  // validate inputs
  let protocol =
    typeof requestProperties.body.protocol === 'string' &&
    ['http', 'https'].indexOf(requestProperties.body.protocol) > -1
      ? requestProperties.body.protocol
      : false;
  let url =
    typeof requestProperties.body.url === 'string' &&
    requestProperties.body.url.trim().length > 0
      ? requestProperties.body.url
      : false;
  let method =
    typeof requestProperties.body.method === 'string' &&
    ['GET', 'POST', 'PUT', 'DELETE'].indexOf(requestProperties.body.method) > -1
      ? requestProperties.body.method
      : false;
      let successCodes =
        typeof requestProperties.body.successCodes === 'object' &&
        requestProperties.body.successCodes instanceof Array
          ? requestProperties.body.successCodes
          : false;
    

  let timeoutSeconds =
    typeof requestProperties.body.timeoutSeconds === 'number' &&
    requestProperties.body.timeoutSeconds % 1 === 0 &&
    requestProperties.body.timeoutSeconds >= 1 &&
    requestProperties.body.timeoutSeconds <= 5
      ? requestProperties.body.timeoutSeconds
      : false;

  if (protocol && url && method && successCodes && timeoutSeconds) {
    const token =
      typeof requestProperties.headersObject.token === 'string' &&
      requestProperties.headersObject.token.trim().length > 0
        ? requestProperties.headersObject.token
        : false;
    // look up the user by reading the token
    data.read('tokens', token, (err1, tokenData) => {
      if (!err1 && tokenData) {
        let userPhone = parseJSON(tokenData).phone;
   
        // look up the user data
        data.read('userInfo', userPhone, (err2, userData) => {
          if (!err2 && userData) {
            tokenHandler._token.verify(token, userPhone, tokenIsValid => {
              if (tokenIsValid) {
                let userObject = parseJSON(userData);
                let userChecks =
                  typeof userObject.checks === 'object' &&
                  userObject.checks instanceof Array
                    ? userObject.checks
                    : [];
                
                if (userChecks.length < maxChecks) {
                  let checkId = createRandomString(20);
                  let checkObject = {
                    id: checkId,
                    userPhone,
                    protocol,
                    url,
                    method,
                    successCodes,
                    timeoutSeconds,
                  };

                  // store the check object
                  data.create('checks', checkId, checkObject, err3 => {
                    if (!err3) {
                      // add the check id to the user object
                      userObject.checks = userChecks;
                      userObject.checks.push(checkId);
                      // update the user data
                      data.update('userInfo', userPhone, userObject, err4 => {
                        if (!err4) {
                          return callBack(200, checkObject);
                        } else {
                          return callBack(500, {
                            error: 'There was a problem in the server side',
                          });
                        }
                      });
                    } else {
                      return callBack(500, {
                        error: 'There was a problem in the server side',
                      });
                    }
                  });
                } else {
                  return callBack(400, {
                    error: 'You have reached the maximum number of checks',
                  });
                }
              } else {
                return callBack(403, {
                  error: 'Authentication problem',
                });
              }
            });
          } else {
            callBack(403, {
              error: 'User not found',
            })
            console.log('User not found', err2);
            
          }
        });
      } else {
        callBack(403, {
          error: 'Authentication problem',
        });
      }
    });
  } else {
   callBack(400, {
      error: 'You have a problem with your inputs',
    });
  }
};

handle._check.get = (requestProperties, callBack) => {
  const id =
    typeof requestProperties.queryStringObject.id === 'string' &&
      requestProperties.queryStringObject.id.trim().length === 20
      ? requestProperties.queryStringObject.id
      : false;
  
  if (id) {
    // lookup the check 
    data.read('checks', id, (err1, checkData) => {
      if (!err1 && checkData) { 
        const token =
          typeof requestProperties.headersObject.token === 'string' &&
          requestProperties.headersObject.token.trim().length > 0
            ? requestProperties.headersObject.token
            : false;
        
        tokenHandler._token.verify(token, parseJSON(checkData).userPhone, tokenIsValid => { 
          if (tokenIsValid) {
            let checkObject = parseJSON(checkData);
            callBack(200, checkObject);
          } else {
            callBack(403, {
              error: 'Authentication problem',
            });
          }
        })
      } else {
        callBack(404, {
          error: 'Requested check was not found',
        });
      }
    })
  } else {
    callBack(400, {
      error: 'You have a problem in your request',
    });
  };
}
handle._check.put = (requestProperties, callBack) => {
  const id =
    typeof requestProperties.body.id === 'string' &&
    requestProperties.body.id.trim().length === 20
      ? requestProperties.body.id
      : false;
  
      let protocol =
        typeof requestProperties.body.protocol === 'string' &&
        ['http', 'https'].indexOf(requestProperties.body.protocol) > -1
          ? requestProperties.body.protocol
          : false;
      let url =
        typeof requestProperties.body.url === 'string' &&
        requestProperties.body.url.trim().length > 0
          ? requestProperties.body.url
          : false;
      let method =
        typeof requestProperties.body.method === 'string' &&
        ['GET', 'POST', 'PUT', 'DELETE'].indexOf(
          requestProperties.body.method
        ) > -1
          ? requestProperties.body.method
          : false;
      let successCodes =
        typeof requestProperties.body.successCodes === 'object' &&
        requestProperties.body.successCodes instanceof Array
          ? requestProperties.body.successCodes
          : false;

      let timeoutSeconds =
        typeof requestProperties.body.timeoutSeconds === 'number' &&
        requestProperties.body.timeoutSeconds % 1 === 0 &&
        requestProperties.body.timeoutSeconds >= 1 &&
        requestProperties.body.timeoutSeconds <= 5
          ? requestProperties.body.timeoutSeconds
      : false;
  
  if (id) {
    if (protocol || url || method || successCodes || timeoutSeconds) { 
      data.read('checks', id, (err1, checkData) => {
        if (!err1 && checkData) { 
          const checkObject = parseJSON(checkData); 
          const token =
            typeof requestProperties.headersObject.token === 'string' &&
            requestProperties.headersObject.token.trim().length > 0
              ? requestProperties.headersObject.token
              : false;
          tokenHandler._token.verify(token, checkObject.userPhone, tokenIsValid => { 
            if (tokenIsValid) { 
              if (protocol) { 
                checkObject.protocol = protocol;
              }
              if (url) {
                checkObject.url = url;
              }
              if (method) {
                checkObject.method = method;
              }
              if (successCodes) {
                checkObject.successCodes = successCodes;
              }
              if (timeoutSeconds) {
                checkObject.timeoutSeconds = timeoutSeconds;
              }
              // store the updated check object
              data.update('checks', id, checkObject, err2 => { 
                if (!err2) {
                  callBack(200, checkObject);
                } else {
                  callBack(500, {
                    error: 'There was a problem in the server side',
                  });
                }
              })

            } else {
              callBack(403, {
                error: 'Authentication problem',
              });
            }
          })
        } else {
           callBack(500, {
            error: 'There was a problem in the server side',})
        }
 })
    } else {
      callBack(400, {
        error: 'You have a problem with your inputs',
      });
    }
  } else {
    callBack(400, {
      error: 'You have a problem in your request',
    });
  }
};


handle._check.delete = (requestProperties, callBack) => {
  const id =
    typeof requestProperties.queryStringObject.id === 'string' &&
    requestProperties.queryStringObject.id.trim().length === 20
      ? requestProperties.queryStringObject.id
      : false;
  
      if (id) {
        // lookup the check
        data.read('checks', id, (err1, checkData) => {
          if (!err1 && checkData) {
            const token =
              typeof requestProperties.headersObject.token === 'string' &&
              requestProperties.headersObject.token.trim().length > 0
                ? requestProperties.headersObject.token
                : false;

            tokenHandler._token.verify(
              token,
              parseJSON(checkData).userPhone,
              tokenIsValid => {
                if (tokenIsValid) {
                  // delete the check data
                  data.delete('checks', id, err2 => {
                    if (!err2) {
                      data.read('userInfo', parseJSON(checkData).userPhone, (err3, userData) => { 
                        let userObject = parseJSON(userData); 
                        if (!err3 && userData) { 
                        let userChecks =
                          typeof userObject.checks === 'object' &&
                          userObject.checks instanceof Array
                            ? userObject.checks
                              : []; 
                          // remove the deleted check id from the user object 
                          let checkPosition = userChecks.indexOf(id);
                          if (checkPosition > -1) { 
                            userChecks.splice(checkPosition, 1);
                            // re-assign the user checks to the user object 
                            userObject.checks = userChecks;
                            // update the user data
                            data.update('userInfo', userObject.phone, userObject, err4 => {
                              if (!err4) {
                                callBack(200, {
                                  message: 'Check was deleted successfully',
                                });
                              } else {
                                callBack(500, {
                                  error: 'There was a problem in the server side',
                                });
                              }
                            }) 
                          } else {
                            callBack(500, {
                              error: 'There was a problem in the server side',
                            });
                          }
                          
                        } else {
                          callBack(500, {
                            error: 'There was a problem in the server side',
                          });
                        }
                      })
                    } else {
                      callBack(500, {
                        error: 'There was a problem in the server side',
                      });
                    
                  }
                  })
                } else {
                  callBack(403, {
                    error: 'Authentication problem',
                  });
                }
              }
            );
          } else {
            callBack(404, {
              error: 'Requested check was not found',
            });
          }
        });
      } else {
        callBack(400, {
          error: 'You have a problem in your request',
        });
      };
};
module.exports = handle;
