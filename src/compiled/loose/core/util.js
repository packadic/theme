///<reference path="../typings/tsd.d.ts"/>
define(["require", "exports"], function (require, exports) {
    var kindsOf = {};
    'Number String Boolean Function RegExp Array Date Error'.split(' ').forEach(function (k) {
        kindsOf['[object ' + k + ']'] = k.toLowerCase();
    });
    function def(val, def) {
        return defined(val) ? val : def;
    }
    exports.def = def;
    function defined(obj) {
        return !_.isUndefined(obj);
    }
    exports.defined = defined;
    function cre(name) {
        if (!defined(name)) {
            name = 'div';
        }
        return $(document.createElement(name));
    }
    exports.cre = cre;
    function getParts(str) {
        return str.replace(/\\\./g, '\uffff').split('.').map(function (s) {
            return s.replace(/\uffff/g, '.');
        });
    }
    exports.getParts = getParts;
    function objectGet(obj, parts, create) {
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
    exports.objectGet = objectGet;
    function objectSet(obj, parts, value) {
        parts = getParts(parts);
        var prop = parts.pop();
        obj = objectGet(obj, parts, true);
        if (obj && typeof obj === 'object') {
            return (obj[prop] = value);
        }
    }
    exports.objectSet = objectSet;
    function objectExists(obj, parts) {
        parts = getParts(parts);
        var prop = parts.pop();
        obj = objectGet(obj, parts);
        return typeof obj === 'object' && obj && prop in obj;
    }
    exports.objectExists = objectExists;
    function kindOf(value) {
        if (value == null) {
            return String(value);
        }
        return kindsOf[kindsOf.toString.call(value)] || 'object';
    }
    exports.kindOf = kindOf;
    function recurse(value, fn, fnContinue) {
        function recurse(value, fn, fnContinue, state) {
            var error;
            if (state.objs.indexOf(value) !== -1) {
                error = new Error('Circular reference detected (' + state.path + ')');
                error.path = state.path;
                throw error;
            }
            var obj, key;
            if (fnContinue && fnContinue(value) === false) {
                return value;
            }
            else if (kindOf(value) === 'array') {
                return value.map(function (item, index) {
                    return recurse(item, fn, fnContinue, {
                        objs: state.objs.concat([value]),
                        path: state.path + '[' + index + ']',
                    });
                });
            }
            else if (kindOf(value) === 'object') {
                obj = {};
                for (key in value) {
                    obj[key] = recurse(value[key], fn, fnContinue, {
                        objs: state.objs.concat([value]),
                        path: state.path + (/\W/.test(key) ? '["' + key + '"]' : '.' + key),
                    });
                }
                return obj;
            }
            else {
                return fn(value);
            }
        }
        return recurse(value, fn, fnContinue, { objs: [], path: '' });
    }
    exports.recurse = recurse;
    function copyObject(object) {
        var objectCopy = {};
        for (var key in object) {
            if (object.hasOwnProperty(key)) {
                objectCopy[key] = object[key];
            }
        }
        return objectCopy;
    }
    exports.copyObject = copyObject;
});
