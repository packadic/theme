/*global window, navigator, document, importScripts, setTimeout, opera */
'use strict';
(function(){

    var jqui = [ 'accordion', 'autocomplete', 'button', 'core', 'datepicker', 'dialog', 'draggable', 'droppable', 'effect-blind', 'effect-bounce', 'effect-clip', 'effect-drop', 'effect-explode', 'effect-fade', 'effect-fold', 'effect-highlight', 'effect', 'effect-puff', 'effect-pulsate', 'effect-scale', 'effect-shake', 'effect-size', 'effect-slide', 'effect-transfer', 'menu', 'mouse', 'position', 'progressbar', 'resizable', 'selectable', 'selectmenu', 'slider', 'sortable', 'spinner', 'tabs', 'tooltip', 'widget' ];
    var config = {
        baseUrl: '/assets/scripts',
        paths  : {
            // custom build with jsbuild
            'plugins/lodash'          : 'plugins/lodash.custom.min',
            'plugins/bootstrap'       : 'plugins/bootstrap.custom.min',
            'jquery'                  : 'plugins/jquery.min',
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
            'plugins/bs-select'       : 'plugins/bootstrap-select/dist/js/bootstrap-select.min'
        },
        shim   : {
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
            // packadic scripts
            'config'                : [ 'jquery', 'plugins/lodash' ],
            'autoloader'            : [ 'config' ],
            'theme'                 : [ 'config', 'plugins/bootstrap', 'jade' ],
            'demo'                  : [ 'theme' ]
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
                site: window.PACKADIC_SITE_DATA,
                selectors: {
                    sidebar: 'ul.sidebar-nav-menu'
                }
            });
            theme.init();
            demo.init();
        });

}.call());
