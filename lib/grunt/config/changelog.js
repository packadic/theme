var radic  = require('radic'),
    _      = require('lodash'),
    jsyaml = require('js-yaml'),
    fs     = require('fs-extra'),
    path   = require('path'),

    lib    = require('../../');


module.exports = function( config, grunt, target, dir ){
    var opts = {
        changelog : {
            make: {
                options: {
                    logArguments: [
                        '--pretty=[%ad](https://github.com/packadic/theme/commit/%H): %s',
                        '--no-merges',
                        '--date=short'
                    ],
                    dest        : 'CHANGELOG.md',
                    template    : '\n\n{{> features}}',
                    after       : 'v0.1.0',
                    fileHeader  : '# Changelog',
                    featureRegex: /^(.*)$/gim,
                    partials    : {
                        features: '{{#if features}}{{#each features}}{{> feature}}{{/each}}{{else}}{{> empty}}{{/if}}\n',
                        feature : '- {{this}}  \n'
                    }
                }
            }
        }
    };
    config = _.merge(config, opts);

    return config;
};
