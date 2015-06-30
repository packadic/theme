///<reference path="definitions.d.ts"/>
var def = require('fn/default');
var defined = require('fn/defined');
var async = require('plugins/async');
var autoloader;
(function (autoloader) {
    var Autoload = (function () {
        function Autoload() {
            this._plugins = [];
            this._custom = [];
        }
        Autoload.prototype.add = function (fnName, selector, requires, dataName, options, preInitFn) {
            this._plugins.push({
                fnName: fnName,
                selector: selector,
                requires: requires,
                dataName: def(dataName, fnName),
                options: def(options, {}),
                preInitFn: preInitFn
            });
            return this;
        };
        Autoload.prototype.addCustom = function (customFn) {
            this._custom.push(customFn);
            return this;
        };
        Autoload.prototype.scan = function ($el, callback) {
            var self = this;
            var detected = [];
            $.each(this._plugins, function (index, data) {
                $el.find(data.selector).each(function () {
                    var $target = $(this);
                    // skip if already initialized
                    if (defined($target.data(data.dataName))) {
                        return;
                    }
                    // allow strings, will be transformed to array
                    var requires = typeof data.requires !== 'array' ? [data.requires] : data.requires;
                    detected.push(function (cb) {
                        // require the plugin
                        require(requires, function () {
                            // If defined, call the pre init function that allows altering the target before initialisation
                            if (typeof data.preInitFn === 'function') {
                                var retval = data.preInitFn($target, data);
                                if (defined(retval))
                                    data = retval;
                            }
                            // and initialize target element with the plugin
                            $target[data.fnName](data.options);
                            cb(null);
                        });
                    });
                });
            });
            $.each(this._custom, function (index, customFn) {
                customFn($el);
            });
            if (detected.length > 0) {
                async.parallel(detected, function (err, results) {
                    if (defined(callback)) {
                        callback(err, results);
                    }
                });
            }
            else {
                if (defined(callback)) {
                    callback(null, {});
                }
            }
        };
        return Autoload;
    })();
    autoloader.Autoload = Autoload;
})(autoloader || (autoloader = {}));
module.exports = autoloader;
