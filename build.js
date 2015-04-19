({
    paths: {
        // custom build with jsbuild
        'jquery'                     : 'plugins/jquery/dist/jquery.min',
        'plugins/bootstrap'          : 'plugins/bootstrap.custom.min',

        // dont prefix jade, template amd loader require it, same as jquery
        'jade'                       : 'plugins/jade/runtime',
        'string'                     : 'plugins/underscore.string/dist/underscore.string.min',
        'code-mirror'                : 'plugins/requirejs-codemirror/src/code-mirror',
        'ace'                        : 'plugins/ace/lib/ace',

        // custom uglified and moved
        'plugins/bootbox'            : 'plugins/bootbox',
        'plugins/modernizr'          : 'plugins/modernizr',
        'plugins/mscrollbar'         : 'plugins/mscrollbar',

        // default vendor paths
        'plugins/async'              : 'plugins/async/lib/async',
        'plugins/svg'                : 'plugins/svg.js/dist/svg',
        'plugins/moment'             : 'plugins/moment/moment/min/moment.min',
        'plugins/select2'            : 'plugins/select2/select2.min',
        'plugins/marked'             : 'plugins/marked/marked.min',
        'plugins/highlightjs'        : 'plugins/highlightjs/highlight.pack',
        'plugins/cryptojs'           : 'plugins/cryptojslib/components',
        'plugins/toastr'             : 'plugins/toastr/toastr',
        'plugins/events'             : 'plugins/eventEmitter/EventEmitter.min',
        'plugins/github-api'         : 'plugins/github-api/github',
        'plugins/oauth2'             : 'plugins/javascript-oauth2/oauth2/oauth2',
        'plugins/oauth-io'           : 'plugins/oauth.io/dist/oauth.min',
        'plugins/md5'                : 'plugins/blueimp-md5/js/md5.min',

        // jquery
        'plugins/jquery-migrate'     : 'plugins/jquery-migrate/jquery-migrate',
        'plugins/jquery-slimscroll'  : 'plugins/jquery-slimscroll/jquery.slimscroll.min',
        'plugins/mousewheel'         : 'plugins/jquery-mousewheel/jquery.mousewheel.min',
        'plugins/uniform'            : 'plugins/jquery.uniform/jquery.uniform.min',
        'plugins/impromptu'          : 'plugins/jquery-impromptu/dist/jquery-impromptu.min',
        'plugins/cookie'             : 'plugins/jquery-cookie/jquery.cookie',

        // bootstrap
        'plugins/bs-datepicker'      : 'plugins/bootstrap-datepicker/js/bootstrap-datepicker',
        'plugins/bs-modal'           : 'plugins/bootstrap-modal/js/bootstrap-modal',
        'plugins/bs-modal-manager'   : 'plugins/bootstrap-modal/js/bootstrap-modalmanager',
        'plugins/bs-switch'          : 'plugins/bootstrap-switch/dist/js/bootstrap-switch.min',
        'plugins/bs-select'          : 'plugins/bootstrap-select/dist/js/bootstrap-select.min',
        'plugins/bs-confirmation'    : 'plugins/bootstrap-confirmation2/bootstrap-confirmation',
        'plugins/bs-maxlength'       : 'plugins/bootstrap-maxlength/bootstrap-maxlength.min',
        'plugins/bs-material'        : 'vendor/material',
        'plugins/bs-material-ripples': 'plugins/bootstrap-material-design/scripts/ripples',
        'plugins/contextmenu'        : 'plugins/bootstrap-contextmenu/bootstrap-contextmenu',
        'plugins/gtreetable'         : "plugins/bootstrap-gtreetable/dist/bootstrap-gtreetable",

        // gsap
        'plugins/gsap/lite'          : 'plugins/gsap/src/minified/TweenLite.min',
        'plugins/gsap/max'           : 'plugins/gsap/src/minified/TweenMax.min',
        'plugins/gsap/ease'          : 'plugins/gsap/src/minified/easing/EasePack.min',
        'plugins/gsap/css'           : 'plugins/gsap/src/minified/plugins/CSSPlugin.min',
        'plugins/gsap/attr'          : 'plugins/gsap/src/minified/plugins/AttrPlugin.min',
        'plugins/gsap/color'         : 'plugins/gsap/src/minified/plugins/ColorPropsPlugin.min',
        'plugins/gsap/scroll'        : 'plugins/gsap/src/minified/plugins/ScrollToPlugin.min',
        'plugins/gsap/text'          : 'plugins/gsap/src/minified/plugins/TextPlugin.min',
        'plugins/gsap/jquery-lite'   : 'plugins/gsap/src/minified/jquery.gsap.min',
        'plugins/gsap/jquery-max'    : 'plugins/gsap/src/minified/jquery.gsap.min',


    },


    shim: {

        'plugins/svg'           : {exports: 'SVG'},
        'jade'                  : {exports: 'jade'},
        'string'                : {exports: 's'},
        'plugins/github-api'    : {exports: 'Github'},
        'plugins/oauth2'        : {exports: 'oauth2'},
        'plugins/oauth-io'      : {exports: 'OAuth'},
        'jquery'                : {
            exports: '$',
            init   : function(){
                this.jquery.noConflict();
            }
        },
        'plugins/jquery-migrate': [ 'jquery' ],
        'plugins/jquery-ui'     : [ 'jquery' ], //, 'jquery-migrate'],
        'plugins/bootstrap'     : [ 'jquery' ],
        'plugins/gtreetable'    : [ 'plugins/jquery-migrate', 'plugins/jquery-ui/core', 'plugins/jquery-ui/draggable', 'plugins/jquery-ui/droppable' ],
        'plugins/mscrollbar'    : [ 'plugins/bootstrap', 'plugins/mousewheel' ],
        'plugins/bs-modal'      : [ 'plugins/bootstrap', 'plugins/bs-modal-manager' ],
        'plugins/bs-material'   : [ 'plugins/bootstrap', 'plugins/bs-material-ripples' ],

        'plugins/gsap/lite'       : [ 'plugins/gsap/scroll' ],
        'plugins/gsap/max'        : {exports: 'TweenMax', deps: [ 'plugins/gsap/scroll' ]},
        'plugins/gsap/jquery-lite': [ 'jquery', 'plugins/gsap/lite' ],
        'plugins/gsap/jquery-max' : [ 'jquery', 'plugins/gsap/max' ],


        // packadic scripts
        'config'                  : [ 'jquery' ],
        'eventer'                 : [ 'jquery', 'plugins/events', 'config' ],
        'autoloader'              : [ 'config' ],
        'theme'                   : [ 'config', 'plugins/bootstrap', 'jade', 'plugins/cookie', 'plugins/events' ],
        'demo'                    : [ 'theme' ]
    },

    baseUrl                : "dev/assets/scripts2",
    optimizeCss            : false,
    modules                : [
        {name: "ace-editor"},
        {
            name: 'boot', include: [
                'jquery', 'plugins/async', 'autoloader', 'string', 'jade', 'code-mirror',
                'plugins/cookie', 'theme', 'theme/sidebar', 'templates/sidebar', 'config',
                'eventer', 'plugins/bs-material-ripples', 'storage', 'json'
            ]
        }
    ],
    mainConfigFile: 'dev/assets/scripts2/init.js',
    dir                    : "dist/assets/scripts",
    skipDirOptimize: false,
    preserveLicenseComments: false,
    removeCombined         : true,
    optimizeAllPluginResources: true
})
