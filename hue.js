/* Notes by Gorlenah
N.B: This is a test file, used in a safe enviroment, no consideration 
was given to the security of the code for use outside the LAN

HUE API : https://developers.meethue.com/develop/get-started-2/

INSTRUCTIONS / GIT: https://github.com/Gorlenah/Http-Server-for-Hue
*/

//PARAMETERS
const http = require('http');
//hue require https
const https = require('https');
//hue requires your Api Key
const hueApiKey = 'HUE-API-KEY';
//hue bridge IP
const bridgeIp = 'HUE-BRIDGE-IP';
//hue bridge port
const bridgePort = 443;
//server IP
const hostname = 'SERVER-IP';
//server port
const port = 3000;
//response title, used in console and http response
const title = 'Philips Hue Change Status Server made by Gorlenah\n';
//set your timezone
const myTimezone = 'Europe/Berlin';
//light numbers (Hue Bridge classification), which will be controlled [lightN1,lightN2]
const lightsArray = [ 1, 2];
//Build Base Url's - https://IP:PORT/api/API-KEY
const hueBaseUrl = `https://${bridgeIp}:${bridgePort}/api/${hueApiKey}`;
const hueLightsUrl = `${hueBaseUrl}/lights/`;


//Skip TLS CA verification, hue bridge have an self signed CA
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

/* With this function you ask the bridge the boolean status of the light, true = on,

This function will return the light boolean state
var lightNumber -> is the light number in hue bridge
var hueLightsUrl -> is https://IP:PORT/api/API-KEY/lights/
*/
function lightStatus(lightNumber, hueLightsUrl) {
    
    return fetch(hueLightsUrl + lightNumber).then((response) => {
      if (response.ok) {
        return response.json();
      }
      throw `HTTP error ${response.status} , failed requesting light: ${lightNumber} status`;
    })
    .then((responseJson) => {
      return responseJson.state.on;
    })
    .catch((error) => {
      throw ('Error in lightStatus: ' + error);
    });
}

/* With this function you send to the bridge the new boolean status of the light, true = on,

The return is needed for throwing errors outside fetch
var lightNumber -> is the light number in hue bridge
var newState -> is the new boolean state
var hueLightsUrl -> https://IP:PORT/api/API-KEY/lights/
*/
function putLightData(lightNumber, newStatus, hueLightsUrl){
  let putData = { "on" : newStatus };

  return fetch(`${hueLightsUrl}${lightNumber}/state`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(putData),
  })
  .then((response) => {
    if(!response.ok){
      throw `HTTP error ${response.status} , PUT failed, light number: ${lightNumber}`;
    }
  })
  .catch((error) => {
    throw ('Error in putLightData: ' + error);
  });
}

/*Return Current Date formatted with UTC, based on myTimezone parameter

en-GB = 24h day/month/year format
en-US = 12h month/day/year format
need global var:
myTimezone
*/
function consoleDate(){
  let nDate = new Date().toLocaleString('en-GB', {
    timeZone: myTimezone
  });
  
  return nDate;
}

//Server Code
const server = http.createServer(async(req, res) => {

  var statusArray = [];
  var newStatus;
  var oldStatus;
  var errorStatus = false;
  
  for (let i=0; i < lightsArray.length; i++) {
    //Get lights current status
    statusArray[i] = await lightStatus(lightsArray[i], hueLightsUrl)
    .catch((error) => {
      console.error(consoleDate(), error);
      errorStatus = true;
    });
  }
  
  /*Turn off lights if they have different status, or change status
  The function in the if, checks that each element is equal to the first element in the array, at the first dissimilarity returns false
  Arrow function: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/every
  */
  if ( statusArray.every( (elem, index, arr) => elem === arr[0] ) ) {
    newStatus = !statusArray[0];
    oldStatus = statusArray[0];
  } else {
    newStatus = false;
    oldStatus = 'not the same';
  }
  
  //Send Put HTTPS to hue bridge, changing the status for each light
  for (let i=0; i < lightsArray.length; i++) {
    //await needed for reporting 500 status in the response
    await putLightData(lightsArray[i], newStatus, hueLightsUrl)
    .catch((error) => {
      console.error(consoleDate(), error);
      errorStatus = true;
    });
  }
  
  console.log(consoleDate()+'| old status: '+oldStatus+' | new status: '+!oldStatus+' |');
  
  res.setHeader('Content-Type', 'text/plain');
  
  if(errorStatus){
    res.statusCode = 500;
    res.end(title + 'Server Error 500 - See Console\n');
  } else{
    res.statusCode = 200;
    res.end(title+'\n old status: '+oldStatus+'\n new status: '+!oldStatus+'\n\n'+consoleDate());
  }
  
});

//Console reminder for hostname and port used
server.listen(port, hostname, () => {
  console.log(title + `Server running at http://${hostname}:${port}/`);
});

