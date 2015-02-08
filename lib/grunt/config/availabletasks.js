var radic  = require('radic'),
    _      = require('lodash'),
    jsyaml = require('js-yaml'),
    fs     = require('fs-extra'),
    path   = require('path'),

    _s = require('underscore.string'),
    lib    = require('../../');


module.exports = function( config, grunt, target, dir ){

    if(config.customTaskList !== true){
        return config;
    }

    var opts = {
        availabletasks: {
            tasks: {
                options: {
                    filter: 'include',
                    tasks: ['tasks', 'dev:build', 'dev:watch'],
                    reporter: function(options) {
                        var meta        = options.meta,
                            task        = options.currentTask,
                            targets     = '',
                            indentlevel = '';

                        var str = '';
                        if (meta.header && meta.groupCount) {
                            indentlevel = '#';
                            str += '## ' + task.group + '\n';
                        }

                        if (task.targets.length > 1) {
                            targets = indentlevel + '### Targets: `' + task.targets.join('`, `') + '`';
                        }
                        str += indentlevel + '## ' + task.name + '\n' + targets + '\n' + task.info + '\n';

                        var tskstr = fs.readFileSync('./TASKS.md', 'utf-8')
                        if(tskstr.indexOf(str) === -1){
                            str = tskstr + str;
                        }
                        fs.outputFileSync('./TASKS.md', str);


                        if (meta.header && meta.groupCount) {
                            console.log('\n' + radic.cli.bold(task.group));
                        }

                        if (task.targets.length > 1) {
                            targets = '(' + task.targets.join('|') + ')';
                        }


                        console.log(
                            radic.cli.cyan(_s.rpad(task.name, meta.longest)),
                            radic.cli.white(_s.center(task.type, 4)),
                            task.info,
                            radic.cli.green(targets)
                        );
                    }
                }
            }
        }
    };

    grunt.registerTask('tasks', 'Shows a list of custom tasks and their description, filtering out all individual tasks', ['availabletasks']);

    config = _.merge(config, opts);



    return config;
};
