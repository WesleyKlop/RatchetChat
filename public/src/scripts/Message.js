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

    /**
     * Message constructor
     * @constructor
     */
    constructor() {
        // Class variables
        this.common_name = undefined;
        this.flags = {};
        this.payload = undefined;
        this.status = this.STATUS_FAILURE;
        this.timestamp = Date.getTimestamp();
        this.type = this.TYPE_MESSAGE;
        this.username = '';
    }

    /**
     * Create the Message object from either a string or parsed json
     * @param {string|object} values
     * @returns {Message}
     * @constructor
     */
    static Build(values) {
        let obj = (typeof values === 'string') ? JSON.parse(values) : values,
            msg = new this();

        msg.type = obj.type || Message.TYPE_MESSAGE;
        msg.status = obj.status;
        msg.common_name = obj.common_name || undefined;
        msg.username = obj.username || undefined;
        msg.flags = obj.flags || {};
        msg.timestamp = obj.timestamp || Date.getTimestamp();
        msg.payload = obj.payload || undefined;

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
                console.warn(key, 'is empty! value:', this[key], "\n", this);
                valid = false;
            }
        });

        if (valid)
            this.status = Message.STATUS_SUCCESS;

        return valid;
    }

    hasFlag(flag) {
        return this.flags.hasOwnProperty(flag);
    }

    addFlag(key, value) {
        if (value) {
            this.flags[key] = value;
        } else {
            this.flags[key] = key;
        }
    }

    toJson() {
        return JSON.stringify(this);
    }
}
