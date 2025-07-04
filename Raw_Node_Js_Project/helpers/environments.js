/*
 * Title: Environments
 * Description: Handle all environments related things
 * Date: 26/5/2025
 * Learn by "Learn with Sumit"
 */

// dependencies
const dotenv = require('dotenv');
dotenv.config();
// module scaffolding
const environments = {};

// staging environment
environments.staging = {
  port: process.env.PORT,
  envName: 'staging',
  secretkey: 'mdasif@123',
  maxChecks: 5,
  twilio: {
    fromPhone: '+15005550006',
    accountSid: 'ACb32d411ad7fe886aac54c665d25e5c5d',
    authToken: '94553eb3109edc12e3d8c92768f7a67',
  },
};

// production environment
environments.production = {
  port: process.env.PORT2,
  envName: 'production',
  secretkey: process.env.PASSWORD,
  maxChecks: 5,
  twilio: {
    fromPhone: '+15005550006',
    accountSid: 'ACb32d411ad7fe886aac54c665d25e5c5d',
    authToken: '94553eb3109edc12e3d8c92768f7a67',
  },
};

// determine which environment was passed
const currentEnvironment =
  typeof process.env.NODE_ENV === 'string' ? process.env.NODE_ENV : 'staging';

// export the corresponding environment object
const environmentToExport =
  typeof environments[currentEnvironment] === 'object'
    ? environments[currentEnvironment]
    : environments.staging;
console.log(environmentToExport);
// export the module
module.exports = environmentToExport;
