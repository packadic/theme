


/*
 * CONFIG
 */
(function Config() {

    var packadic = (window.packadic = window.packadic || {});
    packadic.config = {
        debug                 : false,
        pageLoadedOnAutoloaded: true,
        paths                 : {
            assets : '/assets',
            images : '/assets/images',
            scripts: '/assets/scripts',
            fonts  : '/assets/fonts',
            styles : '/assets/styles'
        },
        requireJS             : {}
    };


    var jqui = ['accordion', 'autocomplete', 'button', 'core', 'datepicker', 'dialog', 'draggable', 'droppable', 'effect-blind', 'effect-bounce', 'effect-clip', 'effect-drop', 'effect-explode', 'effect-fade', 'effect-fold', 'effect-highlight', 'effect', 'effect-puff', 'effect-pulsate', 'effect-scale', 'effect-shake', 'effect-size', 'effect-slide', 'effect-transfer', 'menu', 'mouse', 'position', 'progressbar', 'resizable', 'selectable', 'selectmenu', 'slider', 'sortable', 'spinner', 'tabs', 'tooltip', 'widget'];
    var tweendeps = ['plugins/gsap/css']; //, 'plugins/gsap/ease', 'plugins/gsap/attr', 'plugins/gsap/scroll' ];

    packadic.config.jQueryUI = jqui;

    packadic.config.requireJS = {
        baseUrl: packadic.config.paths.scripts,
        map    : {
            '*': {
                'css': 'plugins/require-css/css'
            }
        },

        paths: {
            // custom build with jsbuild
            'jquery'                     : 'plugins/jquery/dist/jquery.min',
            'plugins/bootstrap'          : 'plugins/bootstrap.custom.min',
            'jquery-ui'                  : 'plugins/jquery-ui/ui',

            // dont prefix jade, template amd loader require it, same as jquery
            'jade'                       : 'plugins/jade/runtime',
            'string'                     : 'plugins/underscore.string/dist/underscore.string.min',
            'code-mirror'                : 'plugins/requirejs-codemirror/src/code-mirror',
            'ace'                        : 'plugins/ace/lib/ace',
            'Q'                          : 'plugins/q/q',

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
            'plugins/pace'               : 'plugins/pace/pace.min',
            'plugins/speakingurl'        : 'plugins/speakingurl/speakingurl.min',

            // jquery
            'plugins/jquery-rest'        : 'plugins/jquery.rest/dist/1/jquery.rest.min',
            'plugins/jquery-migrate'     : 'plugins/jquery-migrate/jquery-migrate',
            'plugins/jquery-slimscroll'  : 'plugins/jquery-slimscroll/jquery.slimscroll.min',
            'plugins/jquery-slugify'     : 'plugins/jquery-slugify/dist/slugify.min',
            'plugins/mousewheel'         : 'plugins/jquery-mousewheel/jquery.mousewheel.min',
            'plugins/uniform'            : 'plugins/jquery.uniform/jquery.uniform.min',
            'plugins/impromptu'          : 'plugins/jquery-impromptu/dist/jquery-impromptu.min',
            'plugins/cookie'             : 'plugins/jquery-cookie/jquery.cookie',
            'plugins/validation'         : 'plugins/jquery-form-validator/form-validator/jquery.form-validator.min',
            'plugins/tag-it'             : 'plugins/tag-it/js/tag-it.min',

            // bootstrap
            'plugins/bs-datepicker'      : 'plugins/bootstrap-datepicker/js/bootstrap-datepicker',
            'plugins/bs-progressbar'     : 'plugins/bootstrap-progressbar/bootstrap-progressbar',
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


            // Datatables
            'datatables'                 : 'plugins/datatables/media/js/jquery.dataTables.min',
            'datatables/plugins'         : 'plugins/datatables-plugins',
            'datatables/bs-plugins'      : 'plugins/datatables-plugins',

            // stylesheets
            'plugins/select2css'         : '../styles/components/select2',
            'plugins/highlightjscss'     : 'plugins/highlightjs/styles/zenburn'
        },





        shim: {
            // stand-alone and exports
            'plugins/svg'       : {exports: 'SVG'},
            'jade'              : {exports: 'jade'},
            'string'            : {exports: '_s'},
            'plugins/github-api': {exports: 'Github'},
            'plugins/oauth2'    : {exports: 'oauth2'},
            'plugins/oauth-io'  : {exports: 'OAuth'},

            // jquery
            'jquery'            : {
                exports: '$',
                init   : function () {
                    this.jquery.noConflict();
                }
            },

            'plugins/jquery-migrate'  : ['jquery'],
            'jquery-ui'               : ['jquery'], //, 'jquery-migrate'],
            'plugins/jquery-slugify'  : ['jquery', 'plugins/speakingurl'],
            'plugins/tag-it'          : ['jquery-ui/core', 'jquery-ui/widget', 'jquery-ui/position', 'jquery-ui/menu', 'jquery-ui/autocomplete'],
            // bootstrap
            'plugins/bootstrap'       : ['jquery'],
            'plugins/gtreetable'      : ['plugins/jquery-migrate', 'plugins/jquery-ui/core', 'plugins/jquery-ui/draggable', 'plugins/jquery-ui/droppable'],
            'plugins/mscrollbar'      : ['plugins/bootstrap', 'plugins/mousewheel'],
            'plugins/bs-modal'        : ['plugins/bootstrap', 'plugins/bs-modal-manager'],
            'plugins/bs-material'     : ['plugins/bootstrap', 'plugins/bs-material-ripples'],
            'plugins/bs-confirmation' : ['plugins/bootstrap'],

            // misc
            'plugins/gsap/lite'       : ['plugins/gsap/scroll'],
            'plugins/gsap/max'        : {exports: 'TweenMax', deps: ['plugins/gsap/scroll']},
            'plugins/gsap/jquery-lite': ['jquery', 'plugins/gsap/lite'],
            'plugins/gsap/jquery-max' : ['jquery', 'plugins/gsap/max'],

            'vendor/dataTables.bootstrap': ['datatables'],

            'plugins/select2'    : ['css!plugins/select2css'],
            'plugins/highlightjs': ['css!plugins/highlightjscss'],

            // packadic scripts
            'config'             : ['jquery'],
            'eventer'            : ['jquery', 'plugins/events'],
            'autoload'           : ['jquery'],
            'theme'              : ['plugins/bootstrap', 'jade', 'plugins/cookie', 'plugins/events'],
            'demo'               : ['theme']
        },


        waitSeconds: 5,

        config: {
            debug: true
        },

        cm: {
            // baseUrl to CodeMirror dir
            baseUrl: 'plugins/codemirror/',
            // path to CodeMirror lib
            path   : 'lib/codemirror',
            // path to CodeMirror css file
            css    : packadic.config.requireJS.basePath + '/lib/codemirror.css',
            // define themes
            themes : {
                monokai : '/path/to/theme/monokai.css',
                ambiance: '/path/to/theme/ambiance.css',
                eclipse : '/path/to/theme/eclipse.css'
            },
            modes  : {
                // modes dir structure
                path: 'mode/{mode}/{mode}'
            }
        }


    };

    jqui.forEach(function (name) {
        packadic.config.requireJS.paths['plugins/jquery-ui/' + name] = 'plugins/jquery-ui/ui/minified/' + name + '.min'
    });
}.call());
