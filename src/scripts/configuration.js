/*global window, navigator, document, importScripts, setTimeout, opera */
'use strict';
(function(){

    var jqui = [ 'accordion', 'autocomplete', 'button', 'core', 'datepicker', 'dialog', 'draggable', 'droppable', 'effect-blind', 'effect-bounce', 'effect-clip', 'effect-drop', 'effect-explode', 'effect-fade', 'effect-fold', 'effect-highlight', 'effect', 'effect-puff', 'effect-pulsate', 'effect-scale', 'effect-shake', 'effect-size', 'effect-slide', 'effect-transfer', 'menu', 'mouse', 'position', 'progressbar', 'resizable', 'selectable', 'selectmenu', 'slider', 'sortable', 'spinner', 'tabs', 'tooltip', 'widget' ];
    var tweendeps = [ 'plugins/gsap/css' ]; //, 'plugins/gsap/ease', 'plugins/gsap/attr', 'plugins/gsap/scroll' ];


    var clone;

    clone = {};
    for(var k in window.packadic) clone[k] = window.packadic[k];
    console.log('pre-rjs config', clone);


    window.packadic.start = new Date();
    window.packadic.rjs = {
        baseUrl: window.packadic.site.scriptsPath,
        paths  : {
            // custom build with jsbuild
            'lodash'                  : 'plugins/lodash.custom.min',
            'plugins/bootstrap'       : 'plugins/bootstrap.custom.min',
            'jquery'                  : 'plugins/jquery/dist/jquery.min',
            // dont prefix jade, template amd loader require it, same as jquery
            'jade'                    : 'plugins/jade/runtime',
            'string'                  : 'plugins/underscore.string/dist/underscore.string.min',
            'code-mirror'             : 'plugins/requirejs-codemirror/src/code-mirror',
            // custom uglified and moved
            'plugins/bootbox'         : 'plugins/bootbox',
            'plugins/modernizr'       : 'plugins/modernizr',
            'plugins/mscrollbar'      : 'plugins/mscrollbar',
            // default vendor paths
            'plugins/impromptu'       : 'plugins/jquery-impromptu/dist/jquery-impromptu.min',
            'plugins/moment'          : 'plugins/moment/moment/min/moment.min',
            'plugins/marked'          : 'plugins/marked/marked.min',
            'plugins/highlightjs'     : 'plugins/highlightjs/highlight.pack',
            'plugins/cryptojs'        : 'plugins/cryptojslib/components',
            'plugins/toastr'          : 'plugins/toastr/toastr',
            'plugins/mousewheel'      : 'plugins/jquery-mousewheel/jquery.mousewheel.min',
            'plugins/gtreetable'      : "plugins/bootstrap-gtreetable/dist/bootstrap-gtreetable",
            'plugins/jquery-migrate'  : 'plugins/jquery-migrate/jquery-migrate',
            'plugins/bs-modal'        : 'plugins/bootstrap-modal/js/bootstrap-modal',
            'plugins/bs-modal-manager': 'plugins/bootstrap-modal/js/bootstrap-modalmanager',
            'plugins/bs-select'       : 'plugins/bootstrap-select/dist/js/bootstrap-select.min',
            'plugins/cookie'          : 'plugins/jquery-cookie/jquery.cookie',
            'plugins/events'          : 'plugins/eventEmitter/EventEmitter.min',
            // gsap
            'plugins/gsap/lite'       : 'plugins/gsap/src/minified/TweenLite.min',
            'plugins/gsap/max'        : 'plugins/gsap/src/minified/TweenMax.min',
            'plugins/gsap/attr'       : 'plugins/gsap/src/minified/plugins/AttrPlugin.min',
            'plugins/gsap/color'      : 'plugins/gsap/src/minified/plugins/ColorPropsPlugin.min',
            'plugins/gsap/scroll'     : 'plugins/gsap/src/minified/plugins/ScrollToPlugin.min',
            'plugins/gsap/text'       : 'plugins/gsap/src/minified/plugins/TextPlugin.min',
            'plugins/gsap/jquery-lite': 'plugins/gsap/src/minified/jquery.gsap.min',
            'plugins/gsap/jquery-max' : 'plugins/gsap/src/minified/jquery.gsap.min'

        },

        shim: {
            'lodash'                : {
                exports: '_'
            },
            'jade'                  : {
                exports: 'jade'
            },
            'string'                : {
                exports: 's'
            },
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

            'plugins/gsap/lite'       : [ 'plugins/gsap/scroll' ],
            'plugins/gsap/max'        : [ 'plugins/gsap/scroll' ],
            'plugins/gsap/jquery-lite': [ 'jquery', 'plugins/gsap/lite' ],
            'plugins/gsap/jquery-max' : [ 'jquery', 'plugins/gsap/max' ],

            // packadic scripts
            'config'                  : [ 'jquery', 'lodash' ],
            'eventer'                 : [ 'jquery', 'plugins/events', 'config' ],
            'autoloader'              : [ 'config' ],
            'theme'                   : [ 'plugins/gsap/jquery-lite', 'config', 'plugins/bootstrap', 'jade', 'plugins/cookie', 'plugins/events' ],
            'demo'                    : [ 'theme' ]
        },


        waitSeconds: 5,

        config: {
            debug: true
        },

        cm: {
            // baseUrl to CodeMirror dir
            baseUrl: 'plugins/codemirror',
            // path to CodeMirror lib
            path   : 'lib/codemirror',
            // path to CodeMirror css file
            css    : '/path/to/code-mirror/css/file',
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

    jqui.forEach(function( name ){
        window.packadic.rjs.paths[ 'plugins/jquery-ui/' + name ] = 'plugins/jquery-ui/ui/minified/' + name + '.min'
    });


    window.packadic.__onLoadedCallbacks = [];
    window.packadic.loaded = function(cb){
        window.packadic.__onLoadedCallbacks.push(cb);
    }


    window.logDebug = window.logDebugEvent = function(){
        return;
        // Placeholder
        var loadTime = (new Date()).getTime() - packadicStartTime.getTime();
        var args = [];
        args.push(loadTime / 1000);
        args.push($.makeArray(arguments));
        console.log(typeof args, args);
        console.debug.apply(console, args);
    };

    console.log('post-rjs config', window.packadic);

    for(var k in window.packadic) clone[k] = window.packadic[k];
    console.log('postcd -rjs config', clone);
}.call());

