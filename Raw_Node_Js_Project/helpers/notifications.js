/*
 * Title: Notifications Library
 * Description: important functions to send notifications
 * Date: 08/6/2025
 * Learn by "Learn with Sumit"
 */

// dependencies
const https = require('https');
const querystring = require('querystring');
const { twilio } = require('./environments');


// module scaffolding
const notifications = {};

// send notification
notifications.sendTwilioSms = (phone, msg, callback) => {
  //input validation
  const userPhone =
    typeof phone === 'string' && phone.trim().length === 11
      ? phone.trim()
      : false;
  const useMsg =
    typeof msg === 'string' &&
    msg.trim().length > 0 &&
    msg.trim().length <= 1600
      ? msg.trim()
      : false;

  if (userPhone && useMsg) {
    // configure the request payload
    const payload = {
      From: twilio.fromPhone,
      To: `+88${userPhone}`,
      Body: useMsg,
    };
    // stringify the payload
    const stringifyPayload = querystring.stringify(payload);

    // configure the request details
    const requestDetails = {
      hostname: 'api.twilio.com',
      method: 'POST',
      path: `/2010-04-01/Accounts/${twilio.accountSid}/Messages.json`,
      auth: `${twilio.accountSid}:${twilio.authToken}`,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    };
    // instantiate the request object
    const req = https.request(requestDetails, res => {
      // get the status code
      const status = res.statusCode;
      // callback successfully if the request went through
      if (status === 200 || status === 201) {
        callback(false);
      } else {
        callback(`Status code returned was ${status}`);
      }
    });

    req.on('error', e => {
      callback(e);
    });
    // write the payload to the request
    req.write(stringifyPayload);
    // end the request
    req.end();
  } else {
    callback('Given parameters were missing or invalid');
    return;
  }
};

//export the module
module.exports = notifications;
