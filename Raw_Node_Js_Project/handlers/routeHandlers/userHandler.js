/*
 * Title: User Handler
 * Description: Handler to handle user related routes
 * Date: 29/5/2025
 * Learn by "Learn with Sumit"
 */

// dependensies
const data = require('../../lib/data');
const { hash, parseJSON } = require('../../helpers/utilites');
const tokenHandler = require('./tokenHandler');
// module scaffolding
const handle = {};

handle.userHandler = (requestProperties, callBack) => {
  const accepteMethods = ['get', 'post', 'put', 'delete'];
  if (accepteMethods.indexOf(requestProperties.method) > -1) {
    handle._users[requestProperties.method](requestProperties, callBack);
  } else {
    callBack(405);
  }
};
handle._users = {};
handle._users.post = (requestProperties, callBack) => {
  // data validation
  const firstName =
    typeof requestProperties.body.firstName === 'string' &&
    requestProperties.body.firstName.trim().length > 0
      ? requestProperties.body.firstName
      : false;
  const lastName =
    typeof requestProperties.body.lastName === 'string' &&
    requestProperties.body.lastName.trim().length > 0
      ? requestProperties.body.lastName
      : false;
  const phone =
    typeof requestProperties.body.phone === 'string' &&
    requestProperties.body.phone.trim().length === 11
      ? requestProperties.body.phone
      : false;
  const password =
    typeof requestProperties.body.password === 'string' &&
    requestProperties.body.password.trim().length > 0
      ? requestProperties.body.password
      : false;
  /*
  const tosAgreement =
    typeof requestProperties.body.tosAgreement === 'boolean' &&
    requestProperties.body.tosAgreement.length > 0
      ? requestProperties.body.tosAgreement
      : false;
      */
  const tosAgreement =
    typeof requestProperties.body.tosAgreement === 'boolean' &&
    requestProperties.body.tosAgreement === true;

  if (firstName && lastName && phone && password && tosAgreement) {
    // make sure that the uer doesn't already exists
    data.read('userInfo', phone, err1 => {
      if (err1) {
        let userObject = {
          firstName,
          lastName,
          phone,
          password: hash(password),
          tosAgreement,
        };

        // store the user to db
        data.create('userInfo', phone, userObject, err2 => {
          if (!err2) {
            callBack(200, {
              message: 'user was created successfully!',
            });
          } else {
            console.log('Create error:', err2);
            callBack(500, {
              error: 'Could not create user!',
            });
          }
        });
      } else {
        callBack(500, {
          error: 'There was a problem in server side!',
        });
      }
    });
  } else {
    callBack(400, {
      error: 'You have a problem in your request',
    });
  }
};


handle._users.get = (requestProperties, callBack) => {
  // check the phone number if valid
  const phone =
    typeof requestProperties.queryStringObject.phone === 'string' &&
    requestProperties.queryStringObject.phone.trim().length === 11
      ? requestProperties.queryStringObject.phone
      : false;
  if (phone) {
    // verify the token
    const token =
      typeof requestProperties.headersObject.token === 'string' &&
      requestProperties.headersObject.token.trim().length > 0
        ? requestProperties.headersObject.token
        : false;
    tokenHandler._token.verify(token, phone, tokenIsValid => {
      if (tokenIsValid) {
        // lookup the user
        data.read('userInfo', phone, (err, userData) => {
          const users = { ...parseJSON(userData) };
          if (!err && users) {
            delete users.password;
            callBack(200, users);
          } else {
            callBack(404, {
              error: 'Requested user was not found',
            });
          }
        });
      } else {
        return callBack(403, {
          error: 'Authentication problem! Invalid token.',
        });
      }
    });
  } else {
    callBack(400, {
      error: 'Invalid phone number! Please try again.',
    });
  }
};
// @TODO: Authentication
handle._users.put = (requestProperties, callBack) => {
  const firstName =
    typeof requestProperties.body.firstName === 'string' &&
    requestProperties.body.firstName.trim().length > 0
      ? requestProperties.body.firstName
      : false;
  const lastName =
    typeof requestProperties.body.lastName === 'string' &&
    requestProperties.body.lastName.trim().length > 0
      ? requestProperties.body.lastName
      : false;
  const phone =
    typeof requestProperties.body.phone === 'string' &&
    requestProperties.body.phone.trim().length === 11
      ? requestProperties.body.phone
      : false;
  const password =
    typeof requestProperties.body.password === 'string' &&
    requestProperties.body.password.trim().length > 0
      ? requestProperties.body.password
      : false;

  if (phone) {
    if (firstName || lastName || password) {
      // verify the token
      const token =
        typeof requestProperties.headersObject.token === 'string' &&
        requestProperties.headersObject.token.trim().length > 0
          ? requestProperties.headersObject.token
          : false;
      tokenHandler._token.verify(token, phone, tokenIsValid => {
        if (tokenIsValid) {
          // lookup the user
          data.read('userInfo', phone, (err1, uData) => {
            const user = { ...parseJSON(uData) };
            if (!err1 && user) {
              // update the fields necessary
              if (firstName) {
                user.firstName = firstName;
              }
              if (lastName) {
                user.lastName = lastName;
              }
              if (password) {
                user.password = hash(password);
              }

              // store the new updated user
              data.update('userInfo', phone, user, err2 => {
                if (!err2) {
                  callBack(200, {
                    message: 'User was updated successfully!',
                  });
                } else {
                  callBack(500, {
                    error: 'There was a problem in server side!',
                  });
                }
              });
            } else {
              callBack(400, {
                error: 'You have a problem in your request',
              });
            }
          });
        } else {
          return callBack(403, {
            error: 'Authentication problem! Invalid token.',
          });
        }
      });
    }
  } else {
    callBack(400, {
      error: 'invalid phone number. Please try again.',
    });
  }
};

// @TODO: Authentication
handle._users.delete = (requestProperties, callBack) => {
  const phone =
    typeof requestProperties.queryStringObject.phone === 'string' &&
      requestProperties.queryStringObject.phone.trim().length === 11
      ? requestProperties.queryStringObject.phone
      : false;
  if (phone) {
    // verify the token
    const token =
      typeof requestProperties.headersObject.token === 'string' &&
        requestProperties.headersObject.token.trim().length > 0
        ? requestProperties.headersObject.token
        : false;
    tokenHandler._token.verify(token, phone, tokenIsValid => {
      if (tokenIsValid) {
        // lookup the user
        data.read('userInfo', phone, (err1, userData) => {
          if (!err1 && userData) {
            data.delete('userInfo', phone, err2 => {
              if (!err2) {
                callBack(200, {
                  message: 'User was deleted successfully!',
                });
              } else {
                callBack(500, {
                  error: 'There was a problem in server side!',
                });
              }
            });
          } else {
            callBack(500, {
              error: 'You have a problem in your request',
            });
          }
        });
      } else {
        callBack(400, {
          error: 'There was a problem in your request',
        });
      }
    });
  }
}
module.exports = handle;
