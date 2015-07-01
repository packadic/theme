///<reference path="../typings/tsd.d.ts"/>

var kindsOf:any = {};
'Number String Boolean Function RegExp Array Date Error'.split(' ').forEach(function (k) {
    kindsOf['[object ' + k + ']'] = k.toLowerCase();
});

export function def( val, def ){
    return defined(val) ? val : def;
}

export function defined( obj?:any ){
    return !_.isUndefined(obj);
}

export function cre(name?:string) {
    if (!defined(name)) {
        name = 'div';
    }
    return $(document.createElement(name));
}

export function getParts(str):any {
    return str.replace(/\\\./g, '\uffff').split('.').map(function (s) {
        return s.replace(/\uffff/g, '.');
    });
}

export function objectGet(obj?:any, parts?:any, create?:any):any {
    if (typeof parts === 'string') {
        parts = getParts(parts);
    }

    var part;
    while (typeof obj === 'object' && obj && parts.length) {
        part = parts.shift();
        if (!(part in obj) && create) {
            obj[part] = {};
        }
        obj = obj[part];
    }

    return obj;
}

export function objectSet(obj, parts, value) {
    parts = getParts(parts);

    var prop = parts.pop();
    obj = objectGet(obj, parts, true);
    if (obj && typeof obj === 'object') {
        return (obj[prop] = value);
    }
}

export function objectExists(obj, parts) {
    parts = getParts(parts);

    var prop = parts.pop();
    obj = objectGet(obj, parts);

    return typeof obj === 'object' && obj && prop in obj;
}

export function kindOf(value:any):any {
    // Null or undefined.
    if (value == null) {
        return String(value);
    }
    // Everything else.
    return kindsOf[kindsOf.toString.call(value)] || 'object';
}

export function recurse(value:Object, fn:Function, fnContinue?:Function):any {
    function recurse(value, fn, fnContinue, state) {
        var error;
        if (state.objs.indexOf(value) !== -1) {
            error = new Error('Circular reference detected (' + state.path + ')');
            error.path = state.path;
            throw error;
        }

        var obj, key;
        if (fnContinue && fnContinue(value) === false) {
            // Skip value if necessary.
            return value;
        } else if (kindOf(value) === 'array') {
            // If value is an array, recurse.
            return value.map(function (item, index) {
                return recurse(item, fn, fnContinue, {
                    objs: state.objs.concat([value]),
                    path: state.path + '[' + index + ']',
                });
            });
        } else if (kindOf(value) === 'object') {
            // If value is an object, recurse.
            obj = {};
            for (key in value) {
                obj[key] = recurse(value[key], fn, fnContinue, {
                    objs: state.objs.concat([value]),
                    path: state.path + (/\W/.test(key) ? '["' + key + '"]' : '.' + key),
                });
            }
            return obj;
        } else {
            // Otherwise pass value into fn and return.
            return fn(value);
        }
    }

    return recurse(value, fn, fnContinue, {objs: [], path: ''});
}

export function copyObject<T> (object:T):T {
    var objectCopy = <T>{};

    for (var key in object) {
        if (object.hasOwnProperty(key)) {
            objectCopy[key] = object[key];
        }
    }

    return objectCopy;
}




/**
 * Stringify a JSON object, supports functions
 * @param {object} obj - The json object
 * @returns {string}
 */
export function jsonStringify (obj:any) {

    return JSON.stringify(obj, function (key, value) {
        if (value instanceof Function || typeof value == 'function') {
            return value.toString();
        }
        if (value instanceof RegExp) {
            return '_PxEgEr_' + value;
        }
        return value;
    });
};

/**
 * Parse a string into json, support functions
 * @param {string} str - The string to parse
 * @param date2obj - I forgot, sorry
 * @returns {object}
 */
export function jsonParse(str:string, date2obj?:any) {

    var iso8061 = date2obj ? /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/ : false;

    return JSON.parse(str, function (key, value) {
        var prefix;


        if (typeof value != 'string') {
            return value;
        }
        if (value.length < 8) {
            return value;
        }


        prefix = value.substring(0, 8);

        if (iso8061 && value.match(iso8061)) {
            return new Date(value);
        }
        if (prefix === 'function') {
            return eval('(' + value + ')');
        }
        if (prefix === '_PxEgEr_') {
            return eval(value.slice(8));
        }

        return value;
    });
};

/**
 * Clone an object
 * @param {object} obj
 * @param {boolean} date2obj
 * @returns {Object}
 */
export function jsonClone(obj:any, date2obj?:any) {
    return jsonParse(jsonStringify(obj), date2obj);
};
