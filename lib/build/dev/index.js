var Builder = require('../builder').Builder,
    radic = require('radic'),
    util = radic.util,
    _ = require('lodash');

function DevBuilder(){



}
util.inherits(DevBuilder, Builder);
module.exports = DevBuilder;
DevBuilder.DevBuilder = DevBuilder;

_.extend(DevBuilder.prototype, {
});
