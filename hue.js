/* Notes by Gorlenah
N.B: This is a test file, used in a safe enviroment, no consideration 
was given to the security of the code for use outside the LAN, moreover, 
the code is not optimised because I wanted to test operation 
between a shelly relay / browser and the hue bridge first

HUE API : https://developers.meethue.com/develop/get-started-2/
*/
const http = require('http');

const hostname = 'SERVER-IP';
const port = 3000;
//Stateful Variable, is the state of light by hue api (philips hue api)
var state = true;

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  
//hue require https
const https = require('https');

var jsonObject = {
    "on" : state
};
var putData = JSON.stringify(jsonObject);

var optionsLight1 = {
  hostname: 'HUE-BRIDGE-IP',
  port: 443,
  //api key is an unique generated key by hue bridge (see philips hue api)
  path: '/api/HUE-API-KEY/lights/1/state',
  method: 'PUT',
  headers: {
       'Content-Type': 'application/json',
       'Content-Length': putData.length
     }
};

//Skip TLS CA verification, hue have an self signed CA
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

var reqLight1 = https.request(optionsLight1, (res) => {
  console.log('statusCode:', res.statusCode);
  console.log('headers:', res.headers);

  res.on('data', (d) => {
    process.stdout.write(d);
  });
});

reqLight1.on('error', (e) => {
  console.error(e);
});

reqLight1.write(putData);
reqLight1.end();

//Same with the second light or more
var optionsLight2 = {
  hostname: 'HUE-BRIDGE-IP',
  port: 443,
  path: '/api/HUE-API-KEY/lights/2/state',
  method: 'PUT',
  headers: {
       'Content-Type': 'application/json',
       'Content-Length': putData.length
     }
};

var reqLight2 = https.request(optionsLight2, (res) => {
  console.log('statusCode:', res.statusCode);
  console.log('headers:', res.headers);

  res.on('data', (d) => {
    process.stdout.write(d);
  });
});

reqLight2.on('error', (e) => {
  console.error(e);
});

reqLight2.write(putData);
reqLight2.end();


var temp = state;
//Change boolean to turn off light next time (Can improve by reading current state from Hue Bridge)
state = !state;

res.end('State sent = ' + temp + '\n' + 'Next State = ' + state + '\n');
  
});

//Console reminder for hostname and port used
server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});

/*
P.S:
To check PID port utilization use :
lsof -i :3000
will return a list of PID using that port on linux

kill -9 (PID)
to kill that process and free your Server Port

Use cmd+C to close the process, so you don't have to kill it by PID
*/