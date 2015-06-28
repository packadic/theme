define([ 'json', 'fn/defined' ], function( json, defined ){

    /**
     * A wrapper around the localStorage, allows expiration settings and JSON in/output
     * @exports storage
     */
    var storage = {};

    /**
     * Add a event listener for the 'onstorage' event
     * @param {function} callback
     */
    storage.on = function( callback ){
        if( window.addEventListener ){
            window.addEventListener("storage", callback, false);
        } else {
            window.attachEvent("onstorage", callback);
        }
    };

    /**
     * @typedef StorageSetOptions
     * @type {object}
     * @property {boolean} [json=false] - Set to true if the value passed is a JSON object
     * @property {number|boolean} [expires=false] - Minutes until expired
     */
    /**
     * Save a value to the storage
     * @param {string|number} key               - The unique id to save the data on
     * @param {*} val                           - The value, can be any datatype. If it's an object, make sure to enable json in the options
     * @param {StorageSetOptions} [options]     - Additional options, check the docs
     */
    storage.set = function( key, val, options ){
        options = $.extend({json: false, expires: false}, options);
        if( options.json ){
            val = json.stringify(val);
        }
        if( options.expires ){
            var now = Math.floor((Date.now() / 1000) / 60);
            window[ 'localStorage' ].setItem(key + ':expire', now + options.expires);
        }
        window[ 'localStorage' ].setItem(key, val);
    };

    /**
     * @typedef StorageGetOptions
     * @type {object}
     * @property {boolean} [json=false]     - Set to true if the value is a JSON object
     * @property {*} [default=false]        - The default value to return if the requested key does not exist
     */
    /**
     * Get a value from the storage
     * @param key
     * @param {StorageGetOptions} [options] - Optional options, check the docs
     * @returns {*}
     */
    storage.get = function( key, options ){
        options = $.extend({json: false, default: null}, options);

        if( !defined(key) ){
            return options.default;
        }

        if( _.isString(window[ 'localStorage' ].getItem(key)) ){
            if( _.isString(window[ 'localStorage' ].getItem(key + ':expire')) ){
                var now = Math.floor((Date.now() / 1000) / 60);
                var expires = parseInt(window[ 'localStorage' ].getItem(key + ':expire'));
                if( now > expires ){
                    storage.del(key);
                    storage.del(key + ':expire');
                }
            }
        }

        var val = window[ 'localStorage' ].getItem(key);

        if( !defined(val) || defined(val) && val == null ){
            return options.default;
        }

        if( options.json ){
            return json.parse(val);
        }
        return val;
    };


    /**
     * Delete a value from the storage
     * @param {string|number} key
     */
    storage.del = function( key ){
        window[ 'localStorage' ].removeItem(key);
    };

    /**
     * Clear the storage, will clean all saved items
     */
    storage.clear = function(){
        window.localStorage.clear();
    };

    /**
     * Get total localstorage size in MB. If key is provided,
     * it will return size in MB only for the corresponding item.
     * @param [key]
     * @returns {string}
     */
    storage.getSize = function( key ){
        key = key || false;
        if( key ){
            return ((localStorage[ x ].length * 2) / 1024 / 1024).toFixed(2);
        } else {
            var total = 0;
            for( var x in localStorage ){
                total += (localStorage[ x ].length * 2) / 1024 / 1024;
            }
            return total.toFixed(2);
        }
    };


    return storage;
});
