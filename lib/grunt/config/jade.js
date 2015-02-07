/* jshint camelcase: false */

var radic  = require('radic'),
    _      = require('lodash'),
    jsyaml = require('js-yaml'),
    fs     = require('fs-extra'),
    path   = require('path'),
    jade   = require('jade'),
    lib    = require('../../'),
    marked = require('marked');


module.exports = function( config, grunt, target, dir ){
    'use strict';
    target = target || 'dev';
    dir = dir || 'dev';

    function getJadeData(){
        function rootpath( rootPath ){
            return path.resolve(__dirname, '../../..', rootPath);
        }

        function getyml( path ){
            return jsyaml.safeLoad(fs.readFileSync(rootpath(path), 'utf-8'));
        }

        function getBowerDep( name ){
            var dep = { name: name };
            var p = rootpath('src/vendor/' + name);

            if( fs.existsSync(p + '/.bower.json') ){
                dep = fs.readJSONFileSync(p + '/.bower.json');
            } else if (fs.existsSync(p + '/bower.json')){
                dep = fs.readJSONFileSync(p + '/bower.json');
            }

            if( fs.existsSync(p + '/README.md')){
                dep.readmemd =fs.readFileSync(p + '/README.md');
            } else if( fs.existsSync(p + '/readme.md')){
                dep.readmemd = fs.readFileSync(p + '/readme.md');
            }

            return dep;
        }

        function getNpmDep( name ){
            return fs.readJSONFileSync(rootpath('node_modules/' + name + '/package.json'));
        }


        var site = getyml('src/data/site.yml');
        site.data = {};
        [ 'navigation', 'author', 'main', 'social', 'widgets', 'theme' ].forEach(function( fileName ){
            site.data[ fileName ] = getyml('src/data/' + fileName + '.yml');
        });


        var build = {
            bower  : {},
            package: {},
            config : {}
        };
        build.bower = fs.readJSONFileSync(rootpath('bower.json'));
        build.bower.packages = {};
        _.each(build.bower.dependencies, function( version, name ){
            build.bower.packages[ name ] = getBowerDep(name);
        });
        build.package = fs.readJSONFileSync(rootpath('package.json'));
        build.config = getyml('config.yml');

        var globals = {};
        function setGlobal(key, val){
            globals[key] = val;
        }
        function getGlobal(key){
            return globals[key];
        }
        return {site_json: JSON.stringify(site), site: site, build: build, globals: globals, setGlobal: setGlobal, getGlobal: getGlobal };
    }

    var opts = {
        options: {
            pretty: true

        }
    };
    opts[ target ] = {
        options: {
            data   : getJadeData,
            filters: {
                code: function( block ){
                    return block
                        .replace(/&/g, '&amp;')
                        .replace(/</g, '&lt;')
                        .replace(/>/g, '&gt;')
                        .replace(/"/g, '&quot;')
                        .replace(/#/g, '&#35;')
                        .replace(/\\/g, '\\\\');
                }
            }
        },
        files  : [
            {expand: true, cwd: 'src/views/pages', src: '**/*.jade', ext: '.html', dest: dir}
        ]
    };
    opts[ target + '_tpls' ] = {
        options: {
            client   : true,
            pretty   : false,
            namespace: 'tpls'
        },
        files  : [
            {expand: true, cwd: 'src/views/tpls', src: '**/*.jade', ext: '.js', dest: dir + '/assets/tpls'}
        ]
    };

    config = _.merge(config, {jade: opts});

    return config;
};
