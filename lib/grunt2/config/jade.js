/* jshint camelcase: false */

var radic   = require('radic'),
    toc     = require('markdown-toc'),
    _       = require('lodash'),
    jsyaml  = require('js-yaml'),
    fs      = require('fs-extra'),
    path    = require('path'),
    jade    = require('jade'),
    lib     = require('../../'),
    globule = require('globule'),
    marked  = require('marked');


function getAuthors( pluginData ){
    // will match if the author string is:
    // Maciej Kłak <klak.maciej@gmail.com>
    // returns ['Maciej Kłak', 'klak.maciej@gmail.com']
    var regMatch2 = /^(.*)\s<(.*)>$/m;
    // will match if the author string is:
    // Maciej Kłak <klak.maciej@gmail.com> (http://gilek.net)
    // returns ['Maciej Kłak', 'klak.maciej@gmail.com', 'http://gilek.net']
    var regMatch3 = /^(.*)\s<(.*)>\s\((.*)\)$/m;
    var authors = {};

    function setAuthor( name, details ){
        if( _.isUndefined(authors[ name ]) ){
            authors[ name ] = {};
        }
        authors[ name ] = _.merge(authors[ name ], details);
    }

    function _get( obj ){
        if( _.isString(obj) ){
            if( obj.match(regMatch3) ){
                var m3 = obj.match(regMatch3);
                setAuthor(m3[ 1 ], {name: m3[ 1 ], email: m3[ 2 ], homepage: m3[ 3 ]});
            } else if( obj.match(regMatch2) ){
                var m2 = obj.match(regMatch2);
                setAuthor(m2[ 1 ], {name: m2[ 1 ], email: m2[ 2 ]});
            } else {
                setAuthor(obj, {name: obj});
            }
        } else if( _.isArray(obj) ){
            _.each(obj, function( ob ){
                _get(ob);
            })
        } else if( _.isObject(obj) ){
            if( _.isString(obj.name) ){
                setAuthor(obj.name, obj);
            }
        }
    }

    _get(pluginData.author);
    _get(pluginData.authors);
    return _.values(authors);
}

function getJadeData( skipBuildData ){
    skipBuildData = _.isUndefined(skipBuildData) ? false : skipBuildData;
    function rootpath( rootPath ){
        return path.resolve(__dirname, '../../..', rootPath);
    }

    function getyml( path ){
        return jsyaml.safeLoad(fs.readFileSync(rootpath(path), 'utf-8'));
    }

    function getBowerDep( name ){
        var dep = {name: name, bw: {}, pkg: {}, md: {}};
        var p = rootpath('src/plugins/' + name);

        if( fs.existsSync(p + '/.bower.json') ){
            dep.bw = fs.readJSONFileSync(p + '/.bower.json');
        } else if( fs.existsSync(p + '/bower.json') ){
            dep.bw = fs.readJSONFileSync(p + '/bower.json');
        }

        globule.find(p + '/*.md').forEach(function( filePath ){
            var name = path.basename(filePath, '.md').toLowerCase();
            var doc = fs.readFileSync(filePath, 'utf-8');
            dep.md[ name ] = {
                body: doc
            };
            try {
                var tdoc = toc(doc, {
                    firsth1: false // skip the first header
                }).content;
            } catch(e) {
            } finally {
                dep.md[ name ].toc = tdoc;
            }

        });

        /*
         if( fs.existsSync(p + '/README.md')){
         dep.md.readme = fs.readFileSync(p + '/README.md');
         } else if( fs.existsSync(p + '/readme.md')){
         dep.md.readme = fs.readFileSync(p + '/readme.md');
         }*/

        if( fs.existsSync(p + '/package.json') ){
            dep.pkg = fs.readJSONFileSync(p + '/package.json');
        } else if( fs.existsSync(p + '/bower.json') ){
            dep.pkg = fs.readJSONFileSync(p + '/bower.json');
        }

        dep.data = _.merge(dep.bw, dep.pkg);
        dep.authors = getAuthors(dep.data);

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
        config : {},
        plugins: {}
    };
    if( skipBuildData !== true ){
        build.bower = fs.readJSONFileSync(rootpath('bower.json'));
        _.each(build.bower.dependencies, function( version, name ){
            build.plugins[ name ] = getBowerDep(name);
        });
        build.package = fs.readJSONFileSync(rootpath('package.json'));
        build.config = getyml('config.yml');
    }

    return {site_json: JSON.stringify(site), site: site, build: build, assetPath: '/assets'};
}
function getConfig( config, grunt, target, dir ){
        'use strict';
        target = target || 'dev';
        dir = dir || 'dev';

        var includePlugins = true;

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
                {expand: true, cwd: 'src/views/pages', src: (config.includeJadePlugins ? '**/*.jade' :  [ '**/*.jade', '!plugins/**' ]), ext: '.html', dest: dir}
            ]
        };
        opts[ target + '_templates' ] = {
            options: {
                client: true,
                pretty: false,
                amd   : true,
                namespace: false
            },
            files  : [
                {expand: true, cwd: 'src/views/tpls', src: '**/*.jade', ext: '.js', dest: dir + '/assets/scripts/templates'}
            ]
        };

        config = _.merge(config, {jade: opts});

        return config;
    }

module.exports = {
    getData: getJadeData,
    getConfig: getConfig
};


function run(){
    _.each(getJadeData().build.plugins, function( plugin ){
        var authors = getAuthors(plugin.data);
        console.log(plugin.data.name, 'authors result:', authors);
    })


}
//run()
