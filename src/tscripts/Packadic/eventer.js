var _            = require('lodash'),
    EventEmitter = require('events').EventEmitter;

var make = function (name, obj, prop) {
    if (typeof prop !== 'string') {
        prop = '_events';
    }
    obj[prop] = new EventEmitter();
    obj.on = function () {
        obj[prop].on.apply(obj[prop], $.makeArray(arguments))
    };
    obj.once = function () {
        obj[prop].once.apply(obj[prop], $.makeArray(arguments))
    };
    obj.off = function () {
        obj[prop].off.apply(obj[prop], $.makeArray(arguments))
    };
    obj._trigger = function () {
        var args = _.toArray(arguments);
        if (config.debug === true) {
            console.debug('DEBUG::event:' + name + ':' + args[0])
        }
        obj[prop].trigger.apply(obj[prop], args);
    };
    obj._defineEvent = function () {
        obj[prop].defineEvent.apply(obj[prop], _.toArray(arguments));
    };
    return obj;
};


exports.eventer = function (name, obj, prop) {
    return make(name, obj, prop);
};

exports.eventer.get = function () {
    return new EventEmitter();
};

