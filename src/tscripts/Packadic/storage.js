/**
 * @module storage
 */

/** @returns {exports} */
exports.on = function (callback) {
    if (window.addEventListener) {
        window.addEventListener("storage", callback, false);
    } else {
        window.attachEvent("onstorage", callback);
    }
    return exports;
};

/** @returns {exports} */
exports.set = function (key, val, options) {
    options = $.extend({json: false, expires: false}, options);
    if (options.json) {
        val = json.stringify(val);
    }
    if (options.expires) {
        var now = Math.floor((Date.now() / 1000) / 60);
        window['localStorage'].setItem(key + ':expire', now + options.expires);
    }
    window['localStorage'].setItem(key, val);
    return exports;
};

/** @returns {exports} */
exports.get = function (key, options) {
    options = $.extend({json: false, default: null}, options);

    if (_.isUndefined(key)) {
        return options.default;
    }

    if (_.isString(window['localStorage'].getItem(key))) {
        if (_.isString(window['localStorage'].getItem(key + ':expire'))) {
            var now = Math.floor((Date.now() / 1000) / 60);
            var expires = parseInt(window['localStorage'].getItem(key + ':expire'));
            if (now > expires) {
                exports.del(key);
                exports.del(key + ':expire');
            }
        }
    }

    var val = window['localStorage'].getItem(key);

    if (_.isUndefined(val)) {
        return options.default;
    }

    if (options.json) {
        return json.parse(val);
    }
    return val;
};

/** @returns {exports} */
exports.del = function (key) {
    window['localStorage'].removeItem(key);
    return exports;
};

exports.clear = function () {
    window.localStorage.clear();
    return exports;
};

/**
 * Get total localstorage size in MB. If key is provided,
 * it will return size in MB only for the corresponding item.
 * @param [key]
 * @returns {string}
 */
exports.getSize = function (key) {
    key = key || false;
    if (key) {
        return ((localStorage[x].length * 2) / 1024 / 1024).toFixed(2);
    } else {
        var total = 0;
        for (var x in localStorage) {
            total += (localStorage[x].length * 2) / 1024 / 1024;
        }
        return total.toFixed(2);
    }
};

