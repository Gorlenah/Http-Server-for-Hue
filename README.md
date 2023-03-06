# Http-Server-for-Hue

The project arose from the need to control Philips Hue lights in a local network isolated from the internet, allowing them to be controlled via network protocol via shelly relays (IoT) thus leaving the lights always powered by the AC network, this configuration was tested on a server with Node.js, the server receives GET requests from a client (via HTTP) which sends commands to the hue bridge according to its API, via https (http is not allowed by the bridge, whereas shelly requires http)

This allows unlimited functionality of commands according to the Hue API, hence the project is expandable

In case of further tests I will try to publish them here on GitHub

How to start with HUE API : https://developers.meethue.com/develop/get-started-2/

---

With the latest update you can find the settings essential for server operation in PARAMETERS :

![parameters](https://user-images.githubusercontent.com/34067164/220471876-8e05d02a-4d6a-4512-9840-06b680014398.jpg)

You only have to change the data in upper case and highlighted, with your data, depending on your configuration, the api key can be obtained by following the philips guide

Without these parameters the server cannot function!!!

- HUE-API-KEY: api key for hue bridge access
- HUE-BRIDGE-IP: hue bridge ip, recommended to have it static
- SERVER-IP: ip on which you want the server to respond
- title: server graphic title
- myTimezone: represents the timezone in which the lights are to be controlled, it will be useful in the event of an update, for now it is not necessary for correct operation
- lightsArray: contains the identification numbers of the lights to be controlled (each number must be separated by a comma, except the last)

---

Browser Example:

![browser-ex](https://user-images.githubusercontent.com/34067164/218744089-3993d8e6-557d-4e31-8c04-b1770af3acaa.png)

Console Example:

![console-ex](https://user-images.githubusercontent.com/34067164/218744369-0aa6655e-a185-4683-ac71-dc59a6e8626b.png)

---

## Persistent Server

This Project can be implemented as a persistant server (always running even after server reboot)

I implemented in my Ubuntu Server with CronTab but you can use other methods

What you have to do?

1) Insert in CronTab new scripts, `sudo EDITOR=nano crontab -e` will open crontab as root with nano editor
2) Add CronTab rule for reboot `@reboot sleep 60 && /home/<your-username>/startServerHue.sh > /dev/null 2>&1`<br>
- with reboot you tell crontab to execute on every boot
- with sleep 60, tells to execute the command after 60 seconds from the boot
- /home/username/startServerHue.sh path to your script (command)
- /dev/null 2>&1 don't log STD, you can change /dev/null to /home/<your-username>/log.txt to log crontab errors
3) Write Your Script in the path choosen before, EX:<br>
```
#!/bin/bash
nodemon /home/fc/Downloads/Http-Server-for-Hue-main/hue.js > /home/fc/Downloads/Http-Server-for-Hue-main/logHue.txt
```

- I used nodemon but you can use node
- `> /home/fc/Downloads/Http-Server-for-Hue-main/logHue.txt` logs STDOUT to file, so you can see errors and logs

<sub>I will put my test files in the persistance folder, look at the repo, with those i runned 2 servers</sub>

---
My Crontab example:

![persistance](https://user-images.githubusercontent.com/34067164/223135409-dfbe8322-7b94-4f94-9e93-3cab325ef9ff.png)

---

## Potential Problems

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
<sub>Depending on the configuration of your server environment, you may have to change the application start-up to make it persistent</sub>
