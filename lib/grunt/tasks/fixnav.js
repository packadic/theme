var radic  = require('radic'),
    util   = radic.util,
    _      = require('lodash'),
    jsyaml = require('js-yaml'),
    fs     = require('fs-extra'),
    path   = require('path'),
    jekyll = require('../../lib/jekyll'),
    lib    = require('../../index');


module.exports = function( grunt ){


    grunt.registerTask('fixnav', 'frontmatter.', function(target){
        var self = this;
        var taskDone = this.async();
        var cwd = process.cwd();
        var ok = grunt.log.ok;

        //var data = grunt.config.get('config.data.navigation');
        //grunt.inspect(data);

        function fix(obj){
            _.each(obj, function(val,key){
                if(key === 'href'){
                    obj[key] = obj[key]
                }
            })
        }

        grunt.event.on('jade.data', function(a, b, c){
            ok('jade.data.');
        })
        ok('fixnav done');
        taskDone();
    });


};
