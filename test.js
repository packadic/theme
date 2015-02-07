var toc = require('markdown-toc'),
    radic  = require('radic'),
    _      = require('lodash'),
    jsyaml = require('js-yaml'),
    fs     = require('fs-extra'),
    path   = require('path'),
    jade   = require('jade'),
    lib    = require('./lib'),
    globule = require('globule'),
    marked = require('marked');


function getJadeData(){
    function rootpath( rootPath ){
        return path.resolve(__dirname, rootPath);
    }

    function getyml( path ){
        return jsyaml.safeLoad(fs.readFileSync(rootpath(path), 'utf-8'));
    }

    function getBowerDep( name ){
        var dep = { name: name, bw: {}, pkg: {}, md: {} };
        var p = rootpath('src/vendor/' + name);

        if( fs.existsSync(p + '/.bower.json') ){
            dep.bw = fs.readJSONFileSync(p + '/.bower.json');
        } else if (fs.existsSync(p + '/bower.json')){
            dep.bw = fs.readJSONFileSync(p + '/bower.json');
        }

        globule.find(p + '/*.md').forEach(function(filePath){
            var name = path.basename(filePath, '.md').toLowerCase();
            dep.md[name] = fs.readFileSync(filePath);
        });

        /*
         if( fs.existsSync(p + '/README.md')){
         dep.md.readme = fs.readFileSync(p + '/README.md');
         } else if( fs.existsSync(p + '/readme.md')){
         dep.md.readme = fs.readFileSync(p + '/readme.md');
         }*/

        if( fs.existsSync(p + '/package.json') ){
            dep.pkg = fs.readJSONFileSync(p + '/package.json');
        } else if (fs.existsSync(p + '/bower.json')){
            dep.pkg = fs.readJSONFileSync(p + '/bower.json');
        }

        dep.data = _.merge(dep.bw, dep.pkg);

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
    build.bower = fs.readJSONFileSync(rootpath('bower.json'));
    _.each(build.bower.dependencies, function( version, name ){
        build.plugins[ name ] = getBowerDep(name);
    });
    build.package = fs.readJSONFileSync(rootpath('package.json'));
    build.config = getyml('config.yml');


    return {site_json: JSON.stringify(site), site: site, build: build };
}

var d = getJadeData();


var doc = d.build.plugins['bootstrap-contextmenu' ].md.readme.toString();
var tdoc = toc(doc).content;
fs.outputFileSync('./test.md', tdoc + "\n" + doc);
//radic.util.log('md', tdoc);
