/*global window, navigator, document, importScripts, setTimeout, opera */
'use strict';
(function(){

    var jqui = [ 'accordion', 'autocomplete', 'button', 'core', 'datepicker', 'dialog', 'draggable', 'droppable', 'effect-blind', 'effect-bounce', 'effect-clip', 'effect-drop', 'effect-explode', 'effect-fade', 'effect-fold', 'effect-highlight', 'effect', 'effect-puff', 'effect-pulsate', 'effect-scale', 'effect-shake', 'effect-size', 'effect-slide', 'effect-transfer', 'menu', 'mouse', 'position', 'progressbar', 'resizable', 'selectable', 'selectmenu', 'slider', 'sortable', 'spinner', 'tabs', 'tooltip', 'widget' ];
    var config = {
        baseUrl    : '/assets/vendor',
        paths      : {
            //lodash          : 'lodash/lodash.min',
            //jquery          : 'jquery/dist/jquery.min',
            //bootstrap       : 'bootstrap/dist/js/bootstrap.min',
            //'jquery-ui'     : 'jquery-ui/jquery-ui.min',
            lodash   : 'lodash.custom.min',
            bootstrap: 'bootstrap.custom.min',
            jquery   : 'jquery/dist/jquery.min',

            '$impromptu': 'jquery-impromptu/dist/jquery-impromptu.min',
            moment   : 'moment/moment/min/moment.min',
            bootbox  : 'bootbox.min',
            modernizr: 'modernizr.min',

            marked : 'marked/marked.min',
            highlightjs: 'highlightjs/highlight.pack',
            cryptojs  : 'cryptojslib/components',
            toastr    : 'toastr/toastr',
            mscrollbar: 'mscrollbar.min',
            mousewheel: 'jquery-mousewheel/jquery.mousewheel.min',

            gtreetable      : "bootstrap-gtreetable/dist/bootstrap-gtreetable",
            'jquery-migrate': 'jquery-migrate/jquery-migrate',

            'bs-modal'        : 'bootstrap-modal/js/bootstrap-modal',
            'bs-modal-manager': 'bootstrap-modal/js/bootstrap-modalmanager',

            'bs-select': 'bootstrap-select/dist/js/bootstrap-select.min'
        },
        shim       : {
            lodash             : {
                exports: '_'
            },
            'jade/runtime'     : {
                exports: 'jade'
            },
            'jquery'           : {
                exports: '$',
                init   : function(){
                    this.jquery.noConflict();
                }
            },
            'jquery-migrate'   : [ 'jquery' ],
            'jquery-ui'        : [ 'jquery' ], //, 'jquery-migrate'],
            'bootstrap'        : [ 'jquery' ],
            'gtreetable'       : [ 'jquery-migrate', 'jquery-ui/core', 'jquery-ui/draggable', 'jquery-ui/droppable'],
            'mscrollbar'       : [ 'bootstrap', 'mousewheel' ],
            'packadic/packadic': [ 'jquery', 'jquery-ui/widget', 'jade/runtime' ],
            'packadic/demo'    : [ 'packadic/packadic' ],
            'bs-modal'         : [ 'bootstrap', 'bs-modal-manager' ]
        },

        waitSeconds: 15
    };

    jqui.forEach(function( name ){
        config.paths[ 'jquery-ui/' + name ] = 'jquery-ui/ui/minified/' + name + '.min'
    });

    require.config(config);

    require(
        [ 'jquery', 'jade/runtime', 'packadic/packadic', 'packadic/demo', 'modernizr' ],
        function( $, jade, Packadic, demo ){

            window.jade = jade;

            console.log($, jade, Packadic, demo);

            Packadic.init({
                site: window.PACKADIC_SITE_DATA
            });

            demo.init();

        });

}.call());
