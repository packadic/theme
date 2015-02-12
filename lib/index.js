var radic         = require('radic'),
    util          = radic.util,
    path          = require('path'),
    fse           = require('fs-extra'),
    fs            = require('fs'),
    async         = require('async'),
    _             = require('lodash'),
    jsyaml        = require('js-yaml'),
    globule       = require('globule'),
    EventEmitter2 = require('eventemitter2').EventEmitter2,
    rimraf        = require('rimraf'),
    preprocess    = require('preprocess'),
    jade          = require('jade'),
    marked        = require('marked'),
    marktoc       = require('markdown-toc'),
    uglify        = require('uglify-js'),
    tmp           = require('tmp'),
    _s             = require('underscore.string');

function log(){
    _.toArray(arguments).forEach(function( vl ){
        process.stdout.write(util.inspect(vl, {hidden: true, depth: 5, colors: true}) + "\n")
    })
}
function rootpath( rootPath ){
    return path.resolve(__dirname, '..', rootPath);
}

function getyml( path ){
    return jsyaml.safeLoad(fs.readFileSync(rootpath(path), 'utf-8'));
}


var lib = module.exports = function( lib ){
    require('./' + lib);
};


lib.getyml = getyml;
lib.rootpath = rootpath;

/**
 * @property
 * @type {{project: Function}}
 */
lib.path = {
    project: function(){
        return path.resolve.apply(path, [ __dirname, '..' ].concat(_.toArray(arguments)));
    }
};

/**
 *
 * @type {EventEmitter2}
 * @private
 */
lib._events = {};

radic.eventer(lib, {
    classOptions : {
        wildcard    : true,
        delimiter   : ':',
        newListener : true,
        maxListeners: 50
    },
    eventClass   : EventEmitter2,
    assignMethods: [ 'on', 'emit', 'once', 'off' ]
});

/**
 * @static
 * @returns {*}
 */
lib.getConfig = function(){
    return jsyaml.safeLoad(fs.readFileSync(lib.path.project('config.yml')));
};

/**
 * @memberOf lib
 * @returns {*}
 */
lib.getPackage = function(){
    return fse.readJSONFileSync(lib.path.project('package.json'));
};
lib.getBower = function(){
    return fse.readJSONFileSync(lib.path.project('bower.json'));
};
lib.getBowerRc = function(){
    return fse.readJSONFileSync(lib.path.project('.bowerrc'));
};
lib.getJshintRc = function(){
    return fse.readJSONFileSync(lib.path.project('.jshintrc'));
};
lib.getTravis = function(){
    return jsyaml.safeLoad(fs.readFileSync(lib.path.project('.travis.yml')));
};


/**
 * @method validateConfig
 * @param config {object}
 */
lib.validateConfig = function( config ){
    if( _.isUndefined(config) ){
        config = lib.getConfig();
    }
    var validate = lib('validate-config');
};

lib.makeBuild = function( name, grunt ){
    var taskName = name + 'make';
    grunt.registerTask(taskName, function(){
        _.merge(grunt.config, config);
    });
};

lib.replaceArrayByMap = function(arr, map){
    log('replace array by map', arr)
    _.each(map, function(to, from){
        arr = arr.join('|||').replace(new RegExp(from, 'g'), to).split('|||');
    });
    return arr;
};
lib.replaceStringByMap = function(str,map){
    _.each(map, function(to, from){
        str = str.replace(new RegExp(from, 'g'), to);
    })
    return str;
};
lib.replaceObjectArrayValueByMap = function(obj, map){
    _.each(obj, function(val, name){
        obj[name] = lib.replaceArrayByMap(obj[name], map);
    });
    return obj;
};

lib.getAvailableTaskReporter = function(opts){
    var config = _.merge({
        markdown: false,
        markdownDest: 'TASKS.md',
        console: true,
        color: 'cyan'
    }, opts);
    return function(options) {
        var meta        = options.meta,
            task        = options.currentTask,
            targets     = '',
            indentlevel = '';

        if(config.markdown === true){
            var str = '';
            if( meta.header && meta.groupCount ){
                indentlevel = '#';
                str += '## ' + task.group + '\n';
            }

            if( task.targets.length > 1 ){
                targets = indentlevel + '### Targets: `' + task.targets.join('`, `') + '`';
            }
            str += indentlevel + '## ' + task.name + '\n' + targets + '\n' + task.info + '\n';

            // update if
            var tskstr = fs.readFileSync(config.markdownDest, 'utf-8');
            if( tskstr.indexOf(str) === -1 ){
                str = tskstr + str;
            }
            fs.outputFileSync(config.markdownDest, str);
        }

        if(config.console === true){
            if( meta.header && meta.groupCount ){
                console.log('\n' + radic.cli.bold(task.group));
            }

            if( task.targets.length > 1 ){
                targets = '(' + task.targets.join('|') + ')';
            }


            console.log(
                radic.cli[config.color](_s.rpad(task.name, meta.longest)),
                radic.cli.cyan(_s.center(task.type, 4)),
                task.info,
                radic.cli.green(targets)
            );
        }
    }
};

// grunt:jade
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

lib.getJadeData = function(grunt){

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



    var build = {
        bower  : {},
        package: {},
        config : {},
        plugins: {}
    };
    if( grunt.config.get('builder.type') !== 'dev' ){
        build.bower = fse.readJSONFileSync(rootpath('bower.json'));
        _.each(build.bower.dependencies, function( version, name ){
            build.plugins[ name ] = getBowerDep(name);
        });
        build.package = fse.readJSONFileSync(rootpath('package.json'));
        build.config = getyml('config.yml');
    }

    function J(str){
        return '{{ ' + str + ' }}';
    }
    function JT(str){
        return '{% ' + str + ' %}';
    }
    return {build: build, assetPath: '/assets', J:J, JT: JT};
};



