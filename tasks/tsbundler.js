var radic     = require('radic'),
    async     = require('async'),
    util      = radic.util,
    _         = require('lodash'),
    jsyaml    = require('js-yaml'),
    fse       = require('fs-extra'),
    fs        = require('fs'),
    globule   = require('globule'),
    path      = require('path'),
    tmp       = require('tmp'),
    requirejs = require('requirejs'),
    exec      = require('child_process').exec;



function log() {
    _.toArray(arguments).forEach(function (vl) {
        process.stdout.write(util.inspect(vl, {hidden: true, depth: 5, colors: true}) + "\n")
    })
}

function dd() {
    log.apply(log, _.toArray(arguments));
    process.exit()
}


module.exports = function (grunt) {

    grunt.registerMultiTask('tsbundler', 'Creates a bundle of typescript files using requireJS (AMD only)', function () {
        grunt.event.emit('task.start', 'tsbundler');
        var self = this;
        var taskDone = this.async();
        var cwd = process.cwd();
        var ok = grunt.log.ok;
        var defaults = {
            paths    : {},
            modules  : [],
            name     : '',
            startFile: "src/scripts/wrap-open.js",
            endFile  : "src/scripts/wrap-close.js",
            optimize : "none",
            target   : 'ES5',
            dest     : ''
        };

        function convertOptions(opts) {
            _.each(opts.paths, function (val, key) {
                opts.paths[key] = path.join(cwd, val)
            });
            var externals = {
                dest     : opts.dest,
                name     : opts.name,
                compiler : {
                    "module"            : "amd",
                    "removeComments"    : opts.optimize != "none" ? true : false,
                    "preserveConstEnums": true,
                    "declaration"       : false,
                    "outDir"            : "", //tmp dir
                    "sourceMap"         : false,
                    "target"            : opts.target
                },
                optimizer: {
                    //appDir:
                    paths                     : opts.paths,
                    baseUrl                   : "", //tmp dir
                    optimizeCss               : false,
                    modules                   : [{
                        name   : opts.name,
                        include: opts.modules
                    }
                    ],
                    optimize                  : opts.optimize,
                    dir                       : "", //tmp dir / subdir,
                    wrap                      : {
                        startFile: opts.startFile,
                        endFile  : opts.endFile
                    },
                    allowSourceOverwrites     : false,
                    skipDirOptimize           : true,
                    preserveLicenseComments   : false,
                    removeCombined            : false,
                    optimizeAllPluginResources: false,
                    onModuleBundleComplete    : function (data) {
                        grunt.verbose.writeln('onModuleBundleComplete', data.name, data.path);
                    },

                    onBuildWrite: function (moduleName, path, contents) {
                        grunt.verbose.writeln('onBuildWrite', moduleName, path);
                        return contents;
                    }
                }
            };
            return externals;
        }

        var target = grunt.config.get('target');
        var options = convertOptions(this.options(defaults));


        async.waterfall([
            // dir create
            function (done) {
                var tmpDir = tmp.dir(function tmpdircreated(err, path, cleanupCallback) {
                    if ( err ) throw err;
                    done(null, {
                        path   : path,
                        cleanup: cleanupCallback
                    })
                });
            },
            // typescript compile
            function (dir, done) {
                var o = options.compiler;
                var command = 'tsc --module ' + o.module + ' -t ' + o.target + ' --outDir ' + dir.path;
                if ( o.optimize != "none" ) {
                    command += ' --removeComments'
                }
                exec(command, function (error, stdout, stderr) {
                    if ( error !== null ) {
                        grunt.log.error('exec error: ' + error);
                        grunt.log.error(command);
                        grunt.log.error(stdout);
                        grunt.fail.fatal(stderr);
                        done(error);
                    } else {
                        grunt.verbose.ok('Compiled successfully, Starting optimization and bundling')
                        done(null, dir);
                    }
                });
            },
            // r.js optimize
            function (dir, done) {
                options.optimizer.baseUrl = dir.path;   // READ
                options.optimizer.dir = path.join(dir.path, '_written');       // WRITE TO
                requirejs.optimize(options.optimizer, function (msg) {
                    grunt.verbose.writeln(msg);
                    var outFile = fs.readFileSync(path.join(options.optimizer.dir, options.name + '.js'));
                    var outFilePath = path.join(cwd, options.dest);
                    fs.writeFileSync(outFilePath, outFile);
                    grunt.log.ok('Generated ' + outFilePath);
                    taskDone();
                }, function (err) {
                    grunt.fail.fatal(err);
                    throw err;
                })
            }
        ]);


        grunt.event.emit('task.done', 'tsbundler', self);
    });

};
