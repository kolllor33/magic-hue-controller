const net = require("net");

const port = 5577;

// send a array of int values to a lamp
function send(ip, values, cb) {
    if(Array.isArray(values)){
        const socket = new net.Socket();
        socket.setTimeout(1500);
        socket.on("data", (data) => {
            const response = data.toString("hex");
            socket.end();
            cb(response, null)
        })
        socket.on("error", (err) => {
            socket.destroy();
            cb(null, err)
        })
        socket.on("timeout", () => {
            socket.destroy();
            cb(null, new Error("timed out"))
        })
        socket.connect(port, ip);
        socket.write(Uint8Array.from(addCheckSum(values)), (err) => {
            if(err){
                console.log(err)
                socket.destroy();
                cb(null, err);
            } else{
                cb(null, null);
            }
        })
    } else {
        console.log("values to send is not an array")
    }
}

function hexToArray(hexString){
    return hexString.split(":").map((el) => parseInt(`0x${el}`));
}

function addCheckSum(values) {
    const total = values.reduce((prev, curr) => prev + curr, 0);
    const checksum = total & 0xff;
    values.push(checksum);
    return values;
}

class BulbController {
    constructor(ip) {
        this.ip = ip;
        if (!net.isIP(this.ip)){
            throw new Error("give ip in constructor is not an ip.")
        }
    }

    /**
     * check the status of the lemp
     */
    isOnline() {
        return new Promise((resolve, reject) => {
            send(this.ip, [0], (data, err) => {
                resolve(!!!err);
            })
        })
    }
    
    /**
     * return a promise of the returned status of the lamp
     */
    getStatus() {
        return new Promise((resolve, reject) => {
            // send hex code for getting the status of power,rgb,warm
            send(this.ip, hexToArray("81:8a:8b:96"), (data, err) => {
                if (err)
                    reject(err)
                else {
                    if(data) {
                        const status = [];
                        for(let i = 0; i < data.length; i+=2){
                            status.push(data[i].concat(data[i+1]))
                        }
                        const power = status[2] === "23" ? "on" : "off"
                        
                        const rgb = status.slice(6,9).map((el) => parseInt(el, 16));
                        
                        const warm = parseInt(status[9], 16)
                        const out = {"power" : power, "rgb" : rgb, "warm" : warm}
                        resolve(out)
                    }
                }
            });
        })
    }
    
    /**
     * this function does not support version AK001-ZJ2101 of the lamps
     * @param {String} rgbString a string of numbers between 0 -255 (R,G,B)
     * @param {String} version a string with the version of the lamp this is optional
     */
    sendRGB(rgbString, version = "") {
        return new Promise((resolve, reject) => {
            const rgb = rgbString.split(",")
            if(rgb.length < 3)
                reject(new Error("Must have three color values (0-255) for R,G,B"));
            const values = [49];
            values.push(...rgb.map((el) => parseInt(el)))
    
            // this version has an extra zero in the body
            if (version == "AK001-ZJ2101")
                values.push(0)
            
                values.push(0,240,15)
            send(this.ip, values, (data, err) => {
                if(err)
                    reject(new Error(err));
            });
            resolve();
        })
    }
    
    /**
     * this function turns on or off the lamp
     * @param {boolean} isOn power status (true or false)
     */
    sendPower(isOn) {
        return new Promise((resolve, reject) => {
            const powerHex = isOn ? "71:23:0f" : "71:24:0f";
            send(this.ip, hexToArray(powerHex), (data, err) => {
                if(err)
                    reject(new Error(err));
            });
            resolve();
        });
    }
    
    /**
     * set the warm level of the lamp
     * @param {number} level (number 0 - 255)
     */
    sendWarmLevel(level) {
        return new Promise((resolve, reject) => {
            const warmLevel = parseInt(level).toString(16)
            send(this.ip, hexToArray(`31:00:00:00:${warmLevel}:0f:0f`), (data, err) => {
                if(err)
                    reject(err);
            })
            resolve();
        });
    }
}

module.exports = BulbController;
