# magic-hue-controller
A nodejs library for controlling a magic hue (magic home) lamp.
Based on the work of [kirillsimin magichue](https://github.com/kirillsimin/magichue) python cli tool.

# Installation
```bash
npm i magic-hue-controller
```
---
# Example
In this example we check if the bulb is online. After this we power it on and after a second it will turn purple and print the status.
```javascript
const BulbController = require("magic-hue-controller");

const bulbController = new BulbController("192.168.0.15");
bulbController.isOnline().then(async (status) => {
    if(status) {
        await bulbController.sendPower(true)
        setTimeout(async () => {
            await bulbController.sendRGB("255,0,255")
            console.log(await bulbController.getStatus())
        }, 1000)
    }else {
        console.log("offline")
    }
})
```
---
# API
### Contructor 
throws an Error if this is not an ip
```javascript
new BulbController("bulb ip");
```

### isOnline() 
returns a promise with a boolean if the bulb is online
```javascript
bulbController.isOnline().then((status) => console.log(status))
```

### getStatus() 
gets the status of the bulb (power, rgb values, warm value)
returns a promise with a [BulbStatus](#BulbStatus)
```javascript
bulbController.getStatus().then((bulbStatus) => console.log(bulbStatus))
```

### sendPower(boolean) 
turn the bulb on or off
returns a void promise
```javascript
// on
bulbController.sendPower(true)

// off
bulbController.sendPower(false)
```

### sendRGB(string, string?) 
set the rgb color of the bulb, the rgb values must be between 0 - 255
returns a void promise
```javascript
bulbController.sendRGB("r,g,b")
```
optional value is a version string of the bulb.
```javascript
bulbController.sendRGB("r,g,b", "version")
```

### sendWarmLevel(number) 
set the warm level of the bulb this is a value between 0 - 255
returns a void promise
```javascript
bulbController.sendWarmLevel(255)
```

### BulbStatus
```typescript
interface BulbStatus {
    power: string;
    rgb: number[];
    warm: number;
}
```