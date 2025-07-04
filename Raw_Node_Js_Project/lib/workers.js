/*
 * Title: Workers library
* Description: workers library for the node server
 * Date:03/7/2025
 * Learn by "Learn with Sumit"
 */
//dependencies
const url = require('url');
const { parseJSON } = require('../helpers/utilites');
const data = require('./data');
const https = require('https');
const http = require('http');
const {sendTwilioSms} = require('../helpers/notifications');


//workers object - module scaffolding
const worker = {};

// lookup all the checks 
worker.gatherAllChecks = () => {
  // get all the checks from the data store 
  data.list('checks', (err1, checks) => {
    if (!err1 && checks && checks.length > 0) {
      checks.forEach(check => {
        data.read('checks', check, (err2, checkData) => {
          if (!err2 && checkData) {
            // pass the data to the check validator
            worker.validateCheckData(parseJSON(checkData));
          } else {
            console.log('Error reading one of the checks');
          }
        })
      })
      
      
      }else {
        console.log('Error: Could not find any checks to process');
    }
  })
}  
      
// validate indvidual check data 
worker.validateCheckData = (checkData) => {
  let originalCheckData = checkData;
  if (originalCheckData && originalCheckData.id) {
    originalCheckData.state = typeof (originalCheckData.state) == 'string' && ['up', 'down'].indexOf(originalCheckData.state) > -1 ? originalCheckData.state : 'down';

    originalCheckData.lastChecked = typeof (originalCheckData.lastChecked) == 'number' && originalCheckData.lastChecked > 0 ? originalCheckData.lastChecked : false;

    // pass the data to the next process
    worker.performCheck(originalCheckData);
  } else {
    console.log('Error: Check data is not properly formatted');
  }
}

// perform the check 
worker.performCheck = (checkData) => {
  // prepare the initial check outcome
  let checkOutcome = {
    'error': false,
    'responseCode': false
  };
  // mark the check as not executed yet
  let outcomeSent = false;
  // parse the hostname and ful url from the check data 
  const parseUrl = url.parse(checkData.protocol + '://' + checkData.url, true);
  const hostName = parseUrl.hostname;
  const path = parseUrl.path;

  // construct the request object
  const requestDetails = {
    protocol: checkData.protocol + ':',
    hostname: hostName,
    method: checkData.method.toUpperCase(),
    path: path,
    timeout: checkData.timeoutSeconds * 1000

  }
  const protocolToUse = checkData.protocol == 'http' ? http : https;
  let req = protocolToUse.request(requestDetails, (res) => {
    // grab the status of the response
    const status = res.statusCode; 
    // update the check outcome and pass the data along
    checkOutcome.responseCode = status;
    if (!outcomeSent) {
     worker.processCheckOutcome(checkData, checkOutcome);
      outcomeSent = true;
   }
  })
  req.on('error', (e) => {
    checkOutcome = {
      error: true,
      value: e,
    };
    if (!outcomeSent) {
      worker.processCheckOutcome(checkData, checkOutcome);
      outcomeSent = true;
    }
  })
  req.on('timeout', () => {
    checkOutcome = {
      error: true,
      value: 'timeout',
    };
    if (!outcomeSent) {
      worker.processCheckOutcome(checkData, checkOutcome);
      outcomeSent = true;
    }
  })
  // req send
  req.end()
}

// save check outcome to the database and send to next process
worker.processCheckOutcome = (checkData, checkOutcome) => {
  // check if the check outcome is up or down 
  let state = !checkOutcome.error && checkOutcome.responseCode && checkData.successCodes.indexOf(checkOutcome.responseCode) > -1 ? 'up' : 'down';

  // decide whether we should alert the user or not
  let alertWanted = checkData.lastChecked && checkData.state !== state ? true : false; 

  // update the check data
  const newCheckData = checkData;
  newCheckData.state = state;
  newCheckData.lastChecked = Date.now();

  // update the check data in the data store
  data.update('checks', newCheckData.id, newCheckData, (err1) => {
    if(!err1) {
      if (alertWanted) {
        // send the new check data to the next process
        worker.alertUserToStatusChange(newCheckData);
      } else {
        console.log('Check outcome not changed, no alert needed');
      }
    } else {
      console.log('Error: Could not update the check data');
    }
  })

}

// send notification sms to the user if state chanes
worker.alertUserToStatusChange = (newCheckData) => {
  const msg = `Alert: Your check for ${newCheckData.method.toUpperCase()} ${newCheckData.protocol}://${newCheckData.url} is currently ${newCheckData.state}`;
  sendTwilioSms(newCheckData.userPhone, msg, (err) => {
    if (!err) {
      console.log(`User was alerted to a status via SMS: ${msg}`)
    } else {
      console.log('There was an error sending the SMS to one of the users');
    }
  })
}
// timer to execute the worker process once per minute 
worker.loop = () => {
  setInterval(() => {
    // execute the worker process
    worker.gatherAllChecks();
  }, 5000); // 60 seconds
}

// start the workers
worker.init = () => {
  // gather all checks
  worker.gatherAllChecks();
  // call th loop to execute checks
  worker.loop();
};

//export the module
module.exports = worker;