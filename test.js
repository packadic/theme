var mm = require('minimatch'),
    radic  = require('radic'),
    _      = require('lodash'),
    jsyaml = require('js-yaml'),
    fs     = require('fs'),
    path   = require('path'),
    jade   = require('jade'),
    lib    = require('./lib'),
    globule = require('globule'),
    marked = require('marked');

require('conventional-changelog')({
    repository: 'https://github.com/packadic/theme',
    version: require('./package.json').version
}, function(err, log) {
    console.log('Here is your changelog!', log);
});


