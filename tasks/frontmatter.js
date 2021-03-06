var util  = require('util'),
    _      = require('lodash'),
    jsyaml = require('js-yaml'),
    fs     = require('fs-extra'),
    path   = require('path');


module.exports = function( grunt ){

    function inspect( val ){
        process.stdout.write(util.inspect(val, {colors: true, depth: 5, hidden: true}) + '\n');
    }

    grunt.registerMultiTask('frontmatter', 'frontmatter.', function(){
        var self = this;
        var taskDone = this.async();
        var cwd = process.cwd();
        var ok = grunt.log.ok;
        var options = this.options({
            options: 'page'
        });


        function writeFrontMatter( p, obj ){
            var fm = '---\n' + '' + '\n---\n';
            fm += fs.readFileSync(p, 'utf-8');
            fs.writeFileSync(p, fm);
            inspect('written');
        }

        this.filesSrc.forEach(function( filepath ){
            //inspect(filepath)
            //inspect(self.options());
            //var permalink = filepath.replace('dev/', '/').replace('.html', '').replace('index', '')
            //inspect(permalink);
            writeFrontMatter(filepath, self.options());

        })


        ok('fm done');
        taskDone();
    });


};
