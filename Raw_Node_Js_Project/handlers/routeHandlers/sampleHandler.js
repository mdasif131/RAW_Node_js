/*
 * Title: Sample Handler
 * Description: Sample Handler
 * Date: 25/5/2025
 * Learn by "Learn with Sumit"
 */

// module scaffolding
const handle = {};

handle.sampleHandler = (requestProperties, callBack) => {
  console.log(requestProperties);
  callBack(200, {
    message: 'This is a sample url',

  });
};

module.exports = handle;