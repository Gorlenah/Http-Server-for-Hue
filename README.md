# Http-Server-for-Hue

The project arose from the need to control Philips Hue lights in a local network isolated from the internet, allowing them to be controlled via network protocol via shelly relays (IoT) thus leaving the lights always powered by the AC network, this configuration was tested on a server with Node.js, the server receives GET requests from a client (via HTTP) which sends commands to the hue bridge according to its API, via https (http is not allowed by the bridge, whereas shelly requires http)

This allows unlimited functionality of commands according to the Hue API, hence the project is expandable

In case of further tests I will try to publish them here on GitHub

How to start with HUE API : https://developers.meethue.com/develop/get-started-2/

---

Browser Example:

![Immagine 2023-01-17 184359](https://user-images.githubusercontent.com/34067164/212973194-0d04202a-2338-4cd5-9ed0-1b6f023d255e.jpg)

---

On Server, Port occupied by the same process or others, e.g.:

launch with `node /YOUR-PATH/hue.js &`

![Immagine 2023-01-17 184903](https://user-images.githubusercontent.com/34067164/212973985-e0f5c812-e361-4df8-8ced-0de3c725fe44.jpg)

To check PID port utilization use :
`lsof -i :3000`
will return a list of PID using that port on linux

`kill -9 (PID)`
to kill that process and free your Server Port

Use cmd+C to close the process, so you don't have to kill it by PID

---
<sub>Testing an Http Server for controlling Hue Lights, with a Hue Bridge, server Receive an Http GET and update lights with a Https PUT, Tested with Node.js</sub>

<sub>Depending on the configuration of your server environment, you may have to change the application start-up to make it persistent</sub>
