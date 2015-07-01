define(["require", "exports", 'core/util'], function (require, exports, util_1) {
    var Config = (function () {
        function Config(obj) {
            this.allDelimiters = {};
            this.addDelimiters('config', '<%', '%>');
            this.data = obj || {};
        }
        Config.getPropString = function (prop) {
            return Array.isArray(prop) ? prop.map(this.escape).join('.') : prop;
        };
        Config.escape = function (str) {
            return str.replace(/\./g, '\\.');
        };
        Config.makeProperty = function (config) {
            var cf = function (prop) {
                return config.get(prop);
            };
            cf.get = config.get.bind(config);
            cf.set = config.set.bind(config);
            cf.merge = config.merge.bind(config);
            cf.raw = config.raw.bind(config);
            cf.process = config.process.bind(config);
            return cf;
        };
        Config.prototype.raw = function (prop) {
            if (prop) {
                return util_1.objectGet(this.data, Config.getPropString(prop));
            }
            else {
                return this.data;
            }
        };
        Config.prototype.get = function (prop) {
            return this.process(this.raw(prop));
        };
        Config.prototype.set = function (prop, value) {
            util_1.objectSet(this.data, Config.getPropString(prop), value);
            return this;
        };
        Config.prototype.merge = function (obj) {
            this.data = _.merge(this.data, obj);
            return this;
        };
        Config.prototype.process = function (raw) {
            var self = this;
            return util_1.recurse(raw, function (value) {
                if (typeof value !== 'string') {
                    return value;
                }
                var matches = value.match(Config.propStringTmplRe);
                var result;
                if (matches) {
                    result = self.get(matches[1]);
                    if (result != null) {
                        return result;
                    }
                }
                return self.processTemplate(value, { data: self.data });
            });
        };
        Config.prototype.addDelimiters = function (name, opener, closer) {
            var delimiters = this.allDelimiters[name] = {};
            delimiters.opener = opener;
            delimiters.closer = closer;
            var a = delimiters.opener.replace(/(.)/g, '\\$1');
            var b = '([\\s\\S]+?)' + delimiters.closer.replace(/(.)/g, '\\$1');
            delimiters.lodash = {
                evaluate: new RegExp(a + b, 'g'),
                interpolate: new RegExp(a + '=' + b, 'g'),
                escape: new RegExp(a + '-' + b, 'g')
            };
        };
        Config.prototype.setDelimiters = function (name) {
            var delimiters = this.allDelimiters[name in this.allDelimiters ? name : 'config'];
            _.templateSettings = delimiters.lodash;
            return delimiters;
        };
        Config.prototype.processTemplate = function (tmpl, options) {
            if (!options) {
                options = {};
            }
            var delimiters = this.setDelimiters(options.delimiters);
            var data = Object.create(options.data || this.data || {});
            var last = tmpl;
            try {
                while (tmpl.indexOf(delimiters.opener) >= 0) {
                    tmpl = _.template(tmpl)(data);
                    if (tmpl === last) {
                        break;
                    }
                    last = tmpl;
                }
            }
            catch (e) {
            }
            return tmpl.toString().replace(/\r\n|\n/g, '\n');
        };
        Config.propStringTmplRe = /^<%=\s*([a-z0-9_$]+(?:\.[a-z0-9_$]+)*)\s*%>$/i;
        return Config;
    })();
    exports.Config = Config;
});
