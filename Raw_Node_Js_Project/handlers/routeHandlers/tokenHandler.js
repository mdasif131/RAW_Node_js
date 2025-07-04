/*
 * Title: Token Handler
 * Description: Handler to handle token related routes
 * Date: 02/06/2025
 * Learn by "Learn with Sumit"
 */

// dependensies
const { hash, createRandomString, parseJSON } = require('../../helpers/utilites');
const data = require('../../lib/data')


// module scaffolding
const handle = {};

handle.tokenHandler = (requestProperties, callBack) => {
  const accepteMethods = ['get', 'post', 'put', 'delete'];
  if (accepteMethods.indexOf(requestProperties.method) > -1) {
    handle._token[requestProperties.method](requestProperties, callBack);
  } else {
    callBack(405);
  }
};
handle._token = {};
handle._token.post = (requestProperties, callBack) => {
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
  if (phone && password) {
    data.read('userInfo', phone, (err1, userData) => {
      let hashedPassword = hash(password);
      if (hashedPassword === parseJSON(userData).password) {
        let tokenId = createRandomString(20);
        let expires = Date.now() + 60 * 60 * 1000;
        let tokenObject = {
          phone,
          id: tokenId,
          expires,
        };
        // store the token
        data.create('tokens', tokenId, tokenObject, err2 => {
          if (!err2) {
            callBack(200, tokenObject);
          } else {
            callBack(500, {
              error: 'There was a problem in the server side',
            });
          }
        });
      } else {
        callBack(400, {
          error: 'Password did not match',
        });
      }  
})
  }else{
    callBack(400, {
      error: 'You have a problem in your request',
    });
  }

};

handle._token.get = (requestProperties, callBack) => {
  // check the id  if valid
    const id =
      typeof requestProperties.queryStringObject.id === 'string' &&
      requestProperties.queryStringObject.id.trim().length === 20
        ? requestProperties.queryStringObject.id
        : false;
    if (id) {
      // lookup the token
      data.read('tokens', id, (err, tokenData) => {
        const token = { ...parseJSON(tokenData) };
        if (!err && token) {
          callBack(200, token);
        } else{
          callBack(404, {
            error: 'Requested token was not found',
          });
        }
      });
    } else {
      callBack(400, {
        error: 'Invalid token! Please try again.',
      });
    }
};
handle._token.put = (requestProperties, callBack) => {
  const id =
    typeof requestProperties.body.id === 'string' &&
    requestProperties.body.id.trim().length === 20
      ? requestProperties.body.id
      : false;
      const extend =
        typeof requestProperties.body.extend === 'boolean' &&
        requestProperties.body.extend === true
          ? true
          : false;
  
  if (id && extend) { 
    data.read('tokens', id, (err1, tokenData) => {
      let tokenObject = parseJSON(tokenData) ;
      if (tokenObject.expires > Date.now()) {
        tokenObject.expires = Date.now() + 60 * 60 * 1000;

        // store the updated token
        data.update('tokens', id, tokenObject, err2 => { 
          if (!err2) {
          callBack(200, {
            message: 'Token updated successfully',
          });
          } else {
            callBack(500, {
              error: 'There was a problem in the server side',
            });
        }
        })
      } else {
        callBack(400, {
          error: 'Token already expired',
        });
      }
  })
  } else {
    callBack(400, {
      error: 'You have a problem in your request',
    });
  }
};
handle._token.delete = (requestProperties, callBack) => {
  // check the token  if valid
  const id =
      typeof requestProperties.queryStringObject.id === 'string' &&
      requestProperties.queryStringObject.id.trim().length === 20
        ? requestProperties.queryStringObject.id
        : false;
    if (id) { 
      // lookup the user
      data.read('tokens', id, (err1, tokenData) => {
        if (!err1 && tokenData) {
          data.delete('tokens', id, err2 => {
            if (!err2) {
              callBack(200, {
                message: 'token was deleted successfully!',
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
    }else{
  callBack(400, {
        error: 'There was a problem in your request',
      });
    }
};
handle._token.verify = (id, phone, callBack) => { 
  data.read('tokens', id, (err, tokenData) => {
    if (!err && tokenData) {
      if (parseJSON(tokenData).phone === phone && parseJSON(tokenData).expires > Date.now()) {
        callBack(true);
      } else {
        callBack(false);
      }
   
    } else {
      callBack(false);
    }
  })
}

// export the handler
module.exports = handle;
