(() => {
    // Timestamp shim
    if (!Date.now) {
        Date.now = () => new Date().getTime();
    }
    Date.getTimestamp = () => Math.floor(Date.now() / 1000);

    // Array.includes polyfill, courtesy of MDN
    if (!Array.prototype.includes) {
        Array.prototype.includes = function (searchElement /*, fromIndex*/) {
            'use strict';
            var O = Object(this);
            var len = parseInt(O.length, 10) || 0;
            if (len === 0) {
                return false;
            }
            var n = parseInt(arguments[1], 10) || 0;
            var k;
            if (n >= 0) {
                k = n;
            } else {
                k = len + n;
                if (k < 0) {
                    k = 0;
                }
            }
            var currentElement;
            while (k < len) {
                currentElement = O[k];
                if (searchElement === currentElement) { // NaN !== NaN
                    return true;
                }
                k++;
            }
            return false;
        };
    }

    //noinspection JSUnresolvedVariable
    if (typeof HTMLDialogElement !== 'function') {
        let allDialogs = document.querySelectorAll('dialog');
        for (let key in allDialogs) {
            if (allDialogs.hasOwnProperty(key)) {
                let dialog = allDialogs[key];
                //noinspection ES6ModulesDependencies
                dialogPolyfill.registerDialog(dialog);
            }
        }
    }
})();

let log = (tag, message) => {
    console.log(`[${tag}] ${message}`);
};
