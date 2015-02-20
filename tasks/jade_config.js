var radic  = require('radic'),
    util   = radic.util,
    _      = require('lodash'),
    jsyaml = require('js-yaml'),
    fse     = require('fs-extra'),
    fs     = require('fs-extra'),
    globule       = require('globule'),
    path   = require('path');

var grunt;

function defined(val){
    return ! _.isUndefined(val);
}

function log(){
    _.toArray(arguments).forEach(function( vl ){
        process.stdout.write(util.inspect(vl, {hidden: true, depth: 5, colors: true}) + "\n")
    })
}

function dd(){
    log.apply(log, _.toArray(arguments));
    process.exit()
}


module.exports = function( grunt ){

    var target, ok, line, cwd;
    ok = grunt.log.ok;
    line = grunt.log.writeln;
    cwd = process.cwd();

    grunt.registerTask('jade_config', 'Set jade configuration. Run before jade tasks.', function(full){
        grunt.event.emit('task.start', 'jade_config');
        var self = this;
        var taskDone = this.async();
        target = grunt.config('target'); // should be done within the task

        this.requiresConfig('jade_config');
        this.requiresConfig('jade.dev');
        this.requiresConfig('jade.dist');
        this.requiresConfig('target.name');


        var jadeFilters = {
            code: function( block ){
                return block
                    .replace(/&/g, '&amp;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;')
                    .replace(/"/g, '&quot;')
                    .replace(/#/g, '&#35;')
                    .replace(/\\/g, '\\\\');
            }
        };

        var options = grunt.config('jade_config');
        var data = getJadeData(full || options[target.type].full);
        log(options, target.type, data)
        grunt.config('jade.' + target.type + '.options.filters', jadeFilters);
        grunt.config('jade.' + target.type + '.options.data', function(){
            data.assetPath = '/assets';
            return data;
        }.call());

        grunt.event.emit('task.done', 'jade_config', full);
        log('task.done', 'jade_config', full);
        taskDone();
    });

    function rootpath( rootPath ){
        return path.resolve(__dirname, '..', rootPath);
    }

    function getyml( path ){
        return jsyaml.safeLoad(fs.readFileSync(rootpath(path), 'utf-8'));
    }

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

    function getBowerDep( name ){
        var dep = {name: name, bw: {}, pkg: {}, md: {}};
        var p = rootpath('src/plugins/' + name);

        if( fs.existsSync(p + '/.bower.json') ){
            dep.bw = fse.readJSONFileSync(p + '/.bower.json');
        } else if( fs.existsSync(p + '/bower.json') ){
            dep.bw = fse.readJSONFileSync(p + '/bower.json');
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

        if( fs.existsSync(p + '/package.json') ){
            dep.pkg = fse.readJSONFileSync(p + '/package.json');
        } else if( fs.existsSync(p + '/bower.json') ){
            dep.pkg = fse.readJSONFileSync(p + '/bower.json');
        }

        dep.data = _.merge(dep.bw, dep.pkg);
        dep.authors = getAuthors(dep.data);

        return dep;
    }

    function getNpmDep( name ){
        return fse.readJSONFileSync(rootpath('node_modules/' + name + '/package.json'));
    }

    var getJadeData = function(full){
        full = full || true;

        var build = {
            bower  : {},
            package: {},
            config : {},
            plugins: {}
        };
        if( full !== true ){
            build.bower = fse.readJSONFileSync(rootpath('bower.json'));
            _.each(build.bower.dependencies, function( version, name ){
                build.plugins[ name ] = getBowerDep(name);
            });
            build.package = fse.readJSONFileSync(rootpath('package.json'));
        }

        // get the config.yml into build.config
        var defaultConfig = getyml('config.yml');
        var defaultTargetConfig = defaultConfig.targets[defaultConfig.target];
        var projectConfigPath = path.resolve(process.cwd(), 'config.yml');
        var hasProjectConfig = false;
        if(fs.existsSync(projectConfigPath)){
            hasProjectConfig = true;
            build.config = _.merge(defaultConfig, jsyaml.safeLoad(fs.readFileSync(projectConfigPath)));
        } else {
            build.config = getyml('config.yml');
        }

        // get the data/*.yml into site.data.*
        var site = getyml('src/data/site.yml');
        site.data = {};
        [ 'navigation', 'author', 'main', 'social', 'widgets', 'theme' ].forEach(function( fileName ){
            site.data[ fileName ] = getyml('src/data/' + fileName + '.yml');
        });


        // override/merge site.data.* from config.ymlea
        if(defined(target.site)){
            _.each(target.site, function(obj, key){
                site.data[key] = target.site[key];
            });
        }

        return {build: build, site: site, site_json: JSON.stringify(site)};
    };






};
