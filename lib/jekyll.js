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

function inspect( val ){
    process.stdout.write(util.inspect(val, {colors: true, depth: 5, hidden: true}) + '\n');
}
function makePath(p){
    return path.resolve(__dirname, '..', p);
}
function loadYml(p){
    return jsyaml.safeLoad(fs.readFileSync(makePath(p)));
}

function config(){
    return loadYml('config.yml');
}

function getYmlStub(p){
    return loadYml(path.resolve(config().paths.stubs, p));
}

/**
 *
 * @param {string} p - Path
 * @param {object} obj - Data
 */
function writeFrontMatter(p, obj){
    var fm = '---\n' + jsyaml.safeDump(obj) + '\n---\n';
    fm += fs.readFileSync(makePath(p), 'utf-8');
    fs.writeFileSync(makePath(p), fm);
    inspect('written');
}

exports.writeFm = writeFrontMatter;
exports.getYmlStub = getYmlStub;
exports.loadYml = loadYml;


if(!module.parent){
    var files = globule.find({
        src: [makePath('dev/**/*.html'), '!' + makePath('dev/assets/**')]
    });
    files.forEach(function(filepath){
        writeFrontMatter(filepath, {});
    });

    console.log(files);
    //writeFrontMatter('jekyll/index.html', {title: 'hai'});
}
