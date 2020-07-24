declare interface BulbStatus {
    power: string;
    rgb: number[];
    warm: number;
}

declare class BulbController {
    public ip: string

    constructor(ip: string);

    /**
     * check the status of the lemp
     */
    isOnline(): Promise<boolean>;
    
    /**
     * return a promise of the returned status of the lamp
     */
    getStatus(): Promise<BulbStatus>;
    
    /**
     * this function does not support version AK001-ZJ2101 of the lamps
     * @param {String} rgbString a string of numbers between 0 -255 (R,G,B)
     * @param {String} version a string with the version of the lamp this is optional
     */
    sendRGB(rgbString: string, version?: string): Promise<void>;
    
    /**
     * this function turns on or off the lamp
     * @param {boolean} isOn power status (true or false)
     */
    sendPower(isOn: boolean): Promise<void>;
    
    /**
     * set the warm level of the lamp
     * @param {number} level (number 0 - 255)
     */
    sendWarmLevel(level: number): Promise<void>;
}

export = BulbController;