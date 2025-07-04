/*
 * Title: Utilities
 * Description: Important utility functions
 * Date: 30/5/2025
 * Learn by "Learn with Sumit"
 */

// dependencies
const dotenv = require('dotenv');
dotenv.config();
// module scaffolding
const crypto = require('crypto');
const uitilities = {};
const environments = require('./environments');

// parse JSON string to Object
uitilities.parseJSON = jsonString => {
  let output;
  try {
    output = JSON.parse(jsonString);
  } catch {
    output = {};
  }
  return output;
};



// hash string
/*
uitilities.hash = str => {
  if (typeof str === 'string' && str.length > 0) {
    const hash = crypto
      .createHmac('sho256', environments.secretkey)
      .update(str)
      .digest('hex');
    return hash;
  }
  return false;
};
*/

uitilities.hash = str => {
  if (typeof str === 'string' && str.length > 0) {
    try {
      const hash = crypto
        .createHmac('sha256', environments.secretkey)
        .update(str)
        .digest('hex');
      return hash;
    } catch (err) {
      console.error('Hashing failed:', err);
      return false;
    }
  }
  return false;
};

uitilities.createRandomString = (strlength) => {
  let length = strlength
  length = typeof length === 'number' && length > 0 ? length : false;
  if (length) {
    let possibleCharacters = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let output = '';
    for (let i = 1; i <= length; i++) {
      // get a random character from the possible characters
      const randomCharacter = possibleCharacters.charAt(
        Math.floor(Math.random() * possibleCharacters.length)
      );
      output += randomCharacter;
    }
    return output;
  }else {
    return false;
  }
}

// export the module
module.exports = uitilities;
