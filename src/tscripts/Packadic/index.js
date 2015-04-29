var mootools = require('./../vendor/mootools'),
    _        = require('lodash'),
    yepnope  = require('./../vendor/yepnope');


var eventer = require('./eventer'),
    json    = require('./json'),
    storage = require('./storage'),
    $       = require('jquery');

function _dd() {
    _.toArray(arguments).forEach(function (arg) {
        console.log(util.inspect(arg, {hidden: true, depth: 5, colors: true}))
    });
}



var Packadic = Class({
    initialize: function (o) {
        o = _.merge(Packadic.defaults, o);
        this.age = o.age || 11;
        this.scriptPath = o.scriptPath || 'assets/scripts'
    },

    /** @returns {storage} */
    getStorage: function () {
        return storage;
    },
    /** @returns {eventer} */
    getEvents : function () {
        return eventer;
    },
    /** @returns {json} */
    getJson   : function () {
        return json;
    },
    load    : function (o, cb) {
        var load = {
            src    : window.location.origin + '/' + o + '?',
            complete: cb || function(){}
        };
        yepnope(load)
    }

});

Packadic.defaults = {
    age       : 11,
    scriptPath: 'assets/scripts'
};

exports.Packadic = Packadic;
if (!_.isUndefined(window)) {
    window.Packadic = Packadic;
}
