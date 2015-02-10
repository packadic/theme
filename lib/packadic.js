var log = console.log;
var
    P             = require('path'),
    resolve       = require('path').resolve,
    basename      = require('path').basename,
    extname       = require('path').extname,
    relative      = require('path').relative,

    EventEmitter2 = require('eventemitter2').EventEmitter2,
    fs            = require('fs'),
    async         = require('async'),
    fse           = require('fs-extra'),
    globule       = require('globule'),
    radic         = require('radic'),
    util          = radic.util,
    cli           = radic.cli,
    _             = require('lodash'),
    Q             = require('q');


var R = function( path, paths ){
    return new R.fn.init(path, paths);
};

R.fn = R.prototype = {
    radic      : '1.0.0',
    constructor: R,
    path       : process.cwd(),
    paths      : [],
    __spawn    : function(){
        R.__prev_spawn__ = this;
        return R(this.path, this.paths);
    }
};

function __prev_spawn(fnName){
    return function(){
        if( !_.isUndefined(R.__prev_spawn__) ){
            return R.__prev_spawn__[fnName ].apply(R.__prev_spawn__, _.toArray(arguments));
        }
    }
}

R.extend = R.fn.extend = function(){
    var args = _.toArray(arguments);
    _.extend.apply(this, [ this ].concat(args));
    if( args.length == 1 ){
        _.each(args[ 0 ], function( fn, fnName ){

            console.log('key: ', fnName, 'also being assigned to static');
            R[ fnName ] = __prev_spawn(fnName);
        })
    }
};
radic.eventer(R, {
    debug: true
});
// Iteration
R.fn.extend({
    first: function(){
        return this.__spawn(this.path, this.paths[ 0 ]);
    },
    last : function(){
        return this.__spawn(this.path, this.paths[ this.paths.length - 1 ]);
    },
    each : function( fn ){
        var self = this;
        async.each(this.paths, function( path, done ){
            return fn(path, done).bind(self);
        }, function( err ){
            if( err ){
                self.trigger('error', err)
            }
        });
        return this.__spawn(this.path, this.paths);
    }
});

// Selecting
R.fn.extend({
    find : function(){
        this.paths = globule.find({
            src       : _.toArray(arguments),
            srcBase   : this.path,
            prefixBase: true
        });
        return this.__spawn(this.path, this.paths);
    },
    files: function( glob ){
        console.log('got', glob, 'paths to check');

        if( !_.isUndefined(glob) ){
            this.paths = this.find(glob).paths
        } else {
            this.paths = fs.readdirSync(this.path);
        }

        console.log('got', this.paths.length, 'paths to check');

        if( this.paths.length > 0 ){
            var files = [];
            this.paths.forEach(function( path ){
                if( fs.statSync(path).isFile() ){
                    files.push(path);
                }
            });
            this.paths = files;
        }
        return this.__spawn(this.path, this.paths);
    },
    dirs : function( glob ){
        if( !_.isUndefined(glob) ){
            this.paths = this.find(glob).paths
        } else {
            this.paths = fs.readdirSync(this.path);
        }


        if( this.paths.length > 0 ){
            var dirs = [];
            this.paths.forEach(function( path ){
                if( fs.statSync(path).isDirectory() ){
                    dirs.push(path);
                }
            });
            this.paths = dirs;
        }

        this._my_emit('dirs', dirs);

        return this.__spawn(this.path, this.paths);
    }
});

// Events
R.fn.extend({
    on: function(){
        console.log('my on');
        R.on.apply(R, _.toArray(arguments));
        return this;
    }
});

// Traversing
R.fn.extend({
    up: function(){
        return this.cd('..');
    },
    cd: function( path ){

        if( P.resolve(path) != P.normalize(path) ){
            console.log('normalizeing', P.resolve(path), P.normalize(path))
            path = resolve(this.path, path);
            console.log(path);
        }

        if( fs.existsSync(path) ){
            this.path = path;
            console.log('exists', path);
        }
        return this.__spawn(path, this.paths);
    }
});

// Getters
R.fn.extend({
    count: function(){
        return this.paths.length;
    }
});

// Manipulation: cp,rm,mv,appendContent,prependContent,appendName,prependName
R.fn.extend({
    cp: function(){
        return this.paths.length;
    }
});

var init = R.fn.init = function( path, paths ){
    if( _.isString(path) ){
        this.path = path;
    }
    if( _.isArray(paths) ){
        this.paths = paths;
    }

    radic.eventer(this, {
        assignMethods       : [],
        assignPrivateMethods: [ 'emit', 'on', 'once', 'off' ],
        assignToProperty    : '_my_events',
        privateMethodPrefix : '_my_',
        assignByAliases     : false,
        aliases             : {},
        eventClassOptions   : null,
        //assignToPrototype: false,
        fnCustomReturn      : this,
        debug               : '_my_'
    });
};

init.prototype = R.fn;


var dirs = R(__dirname).find('build/*').on('dirs', function( path, next ){
    // file/dir watcher i
    cli.writeln(cli.red.bold('---- event:') + ' dirs', path);
}).up().find('src/**');

 //.dirs().up().dirs();

console.log('got it now');
console.log('dirs count', dirs.count());
console.log('r count', R.count());

setTimeout(function(){

}, 2000);


/*
 find
 files
 dir

 */
// fs
// selector: path
//radic('fs').with(__dirname).isDir().files().delete().up();


function radhic( type ){
    if( type === 'fs' ){
        return new R();
    }

    return q
        .fcall(function(){
            return path.resolve(process.cwd());
        })
        .then(function( val ){
            return val;
        });
}
