#!/usr/bin/env node
var requirejs = require('requirejs');


requirejs.optimize({
    //appDir:
    paths: {
        'async'            : '../../plugins/async/lib/async',
        'eventemitter2'            : '../../plugins/eventemitter2/lib/eventemitter2'
    },
    baseUrl                : "src/compiled/loose",
    optimizeCss               : false,
    modules                   : [
        {
            name: 'packadic', include: [
            'autoloader', 'core/application', 'core/config', 'core/util',

            'async'
        ]
        }
    ],
    optimize: "none",
    dir: "src/compiled/optimized",
    wrap: {
        startFile: "src/scripts/wrap-open.js",
        endFile: "src/scripts/wrap-close.js"
    },
    allowSourceOverwrites: false,
    skipDirOptimize           : true,
    preserveLicenseComments   : false,
    removeCombined            : false,
    optimizeAllPluginResources: false
})
