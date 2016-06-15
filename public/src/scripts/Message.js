/**
 * Created by wesley on 6/15/16.
 */
class Message {
    /** @returns {number} */
    static get STATUS_SUCCESS() {
        return 0;
    }

    /** @returns {number} */
    static get STATUS_FAILURE() {
        return 1;
    }

    /** @returns {number} */
    static get STATUS_ERROR() {
        return 2;
    }

    /** @returns {string} */
    static get TYPE_MESSAGE() {
        return 'message';
    }

    /** @returns {string} */
    static get TYPE_VERIFICATION() {
        return 'verify';
    }

    /** @returns {string} */
    static get TYPE_SNACKBAR() {
        return 'snackbar';
    }

    constructor() {
        // Class variables
        this.common_name = '';
        this.flags = [];
        this.payload = '';
        this.status = this.STATUS_FAILURE;
        this.timestamp = -1;
        this.type = this.TYPE_MESSAGE;
        this.username = '';
    }

    /**
     * Create the Message object from either a string or parsed json
     * @param {string|object} json
     * @returns {Message}
     * @constructor
     */
    static Build(json) {
        let obj = (typeof json === 'string') ? JSON.parse(json) : json,
            msg = new this();

        msg.type = obj.type || Message.TYPE_MESSAGE;
        msg.status = obj.status || Message.STATUS_FAILURE;
        msg.common_name = obj.common_name || undefined;
        msg.username = obj.username || undefined;
        msg.flags = obj.flags || [];
        msg.timestamp = obj.timestamp || Math.floor(Date.now() / 1000);
        msg.payload = obj.payload || undefined;

        msg.verify();

        return msg;
    }

    /**
     * Check if the Message has no empty properties
     * @returns {boolean}
     */
    verify() {
        let valid = true;
        Object.keys(this).forEach((key) => {
            // Warn if any of the properties are empty
            if (!this[key] && this[key] !== 0) {
                console.warn(key, 'is empty! value:', this[key]);
                valid = false;
            }
        });
        return valid;
    }

    hasFlag(flag) {
        console.log(this.flags);
        if (typeof this.flags.constructor === Array) // flags is an array
            return this.flags.includes(flag);
        else // flags is an object
            return this.flags.hasOwnProperty(flag);
    }
}
