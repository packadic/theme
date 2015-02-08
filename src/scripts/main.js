/*global window, navigator, document, importScripts, setTimeout, opera */
'use strict';
(function(){

    var jqui = [ 'accordion', 'autocomplete', 'button', 'core', 'datepicker', 'dialog', 'draggable', 'droppable', 'effect-blind', 'effect-bounce', 'effect-clip', 'effect-drop', 'effect-explode', 'effect-fade', 'effect-fold', 'effect-highlight', 'effect', 'effect-puff', 'effect-pulsate', 'effect-scale', 'effect-shake', 'effect-size', 'effect-slide', 'effect-transfer', 'menu', 'mouse', 'position', 'progressbar', 'resizable', 'selectable', 'selectmenu', 'slider', 'sortable', 'spinner', 'tabs', 'tooltip', 'widget' ];
    var tweendeps = [ 'plugins/gsap/css' ]; //, 'plugins/gsap/ease', 'plugins/gsap/attr', 'plugins/gsap/scroll' ];

    var config = {
        baseUrl: '/assets/scripts',
        paths  : {
            // custom build with jsbuild
            'plugins/lodash'          : 'plugins/lodash.custom.min',
            'plugins/bootstrap'       : 'plugins/bootstrap.custom.min',
            'jquery'                  : 'plugins/jquery/dist/jquery.min',
            // dont prefix jade, template amd loader require it, same as jquery
            'jade'                    : 'plugins/jade/runtime',
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
            'plugins/gsap/max'        : 'plugins/gsap/src/minified/TweenMax.min',
            'plugins/gsap/attr'       : 'plugins/gsap/src/minified/plugins/AttrPlugin.min',
            'plugins/gsap/color'      : 'plugins/gsap/src/minified/plugins/ColorPropsPlugin.min',
            'plugins/gsap/scroll'     : 'plugins/gsap/src/minified/plugins/ScrollToPlugin.min',
            'plugins/gsap/text'       : 'plugins/gsap/src/minified/plugins/TextPlugin.min',
            'plugins/gsap/jquery'     : 'plugins/gsap/src/minified/jquery.gsap.min'
        },

        shim: {
            'plugins/lodash'        : {
                exports: '_'
            },
            'jade'                  : {
                exports: 'jade'
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

            'plugins/gsap/max'   : [ 'plugins/gsap/scroll' ],
            'plugins/gsap/jquery': [ 'jquery', 'plugins/gsap/max' ],

            // packadic scripts
            'config'             : [ 'jquery', 'plugins/lodash' ],
            'autoloader'         : [ 'config' ],
            'theme'              : [ 'plugins/gsap/jquery', 'config', 'plugins/bootstrap', 'jade', 'plugins/cookie', 'plugins/events' ],
            'demo'               : [ 'theme' ]
        },


        waitSeconds: 15
    };

    jqui.forEach(function( name ){
        config.paths[ 'plugins/jquery-ui/' + name ] = 'plugins/jquery-ui/ui/minified/' + name + '.min'
    });

    require.config(config);

    require(
        [ 'jquery', 'jade', 'config', 'theme', 'demo', 'plugins/modernizr' ],
        function( $, jade, config, theme, demo ){

            window.jade = jade;

            config.init({
                site     : window.PACKADIC_SITE_DATA,
                selectors: {
                    sidebar: 'ul.sidebar-nav-menu'
                },
                scss     : JSON.parse(theme.unquote($('head').css('font-family'), "'"))
            });

            console.log(config);
            theme.init();
            demo.init();

        });

}.call());

