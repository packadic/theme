
module.exports = function(builderConfig, grunt){


    var tasks = {
        clean: ['clean:all'], // ok
        templates: [ 'clean:templates', 'jade:templates', 'string-replace:templates' ], // ok
        scripts: [ 'clean:scripts', 'copy:plugins',  'copy:scripts', 'dev:templates' ], //'uglify:', //ok
        copy: [ 'copy:images', 'copy:fonts', 'copy:misc', 'copy:demo' ], // ok
        assets: [ 'clean:assets', 'copy', 'dev:scripts', builderConfig.type + ':jsbuild', 'copy:scripts', 'sass:' + builderConfig.type ], // 'jsbuild',
        build: [
            'clean:all', 'dev:copy',
            'sass:' + builderConfig.type, 'jade:' + builderConfig.type,
            'dev:scripts', builderConfig.type + ':jsbuild'
        ],
        watch: [
            'styles', 'scripts', 'views',
            'views_pages', 'images', 'templates',
            'vendor', 'demo', 'livereload'
        ]
    };

    if(builderConfig.type !== 'dev'){
        tasks.build.push('uglify:' + builderConfig.type)
    }

    return tasks;

};
