/*
 * Title: Not Found Handler
 * Description: 404 Not Found Handler
 * Date: 26/5/2025
 * Learn by "Learn with Sumit"
 */
// module scaffolding
const handle = {};

handle.notFoundHandler = (requestProperties, callBack) => {
  callBack(404, {
    message: 'Your requested URL was not found',
  });
};

module.exports = handle;