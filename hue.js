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
const hueApiKey = '/api/HUE-API-KEY';
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


//Skip TLS CA verification, hue bridge have an self signed CA
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

/* With this function you ask the bridge the boolean status of the light, true = on,
This function will return the light boolean state
var lightNumber -> is the light number in hue bridge
*/
async function lightStatus(lightNumber) {
    const url = 'https://'.concat(bridgeIp).concat(hueApiKey).concat(/lights/).concat(lightNumber);
    const response = await fetch(url);
    
    if (await !response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }
    
    const light = await response.json();
    return light.state.on;
}

/* With this function you create the HTTP PUT for the bridge
var lightNumber -> is the light number in hue bridge
var putData -> is the Json Data for the Light Status
*/
function optionsLight(lightNumber, putData){
  return options = {
    hostname: bridgeIp,
    port: bridgePort,
    path: hueApiKey.concat('/lights/').concat(lightNumber).concat('/state'),
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': putData.length
    }
  };
}

/*Return Current Date formatted with UTC, based on myTimezone parameter
en-GB = 24h day/month/year format
en-US = 12h month/day/year format
*/
function consoleDate(){
  const nDate = new Date().toLocaleString('en-GB', {
    timeZone: myTimezone
  });
  
  return nDate;
}

const server = http.createServer(async (req, res) => {

try {
  var statusArray = [];
  var newStatus;
  var oldStatus;
  
  for (let i=0; i < lightsArray.length; i++) {
    //Get lights current status
    statusArray[i] = await lightStatus(lightsArray[i]);
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
    oldStatus = true;
  }
  
  var jsonObject = {
    "on" : newStatus
  };
  
  var putData = JSON.stringify(jsonObject);
  
  //Send Put HTTPS to hue bridge, changing the status for each light
  for (let i=0; i < lightsArray.length; i++) {
    var reqLight = https.request(optionsLight(lightsArray[i], putData));
    reqLight.write(putData);
    reqLight.end();
  }
  
  console.log(consoleDate()+' | old status: '+oldStatus+' | new status: '+!oldStatus+' |');
  
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end(title+'\n old status: '+oldStatus+'\n new status: '+!oldStatus+'\n\n'+consoleDate());
  
} catch (error) {

  console.log(consoleDate() + error);
  res.statusCode = 500;
  res.end(title + 'Server Error 500 - See Console\n');
}
});

//Console reminder for hostname and port used
server.listen(port, hostname, () => {
  console.log(title + `Server running at http://${hostname}:${port}/`);
});

