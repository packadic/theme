/*global window, navigator, document, importScripts, setTimeout, opera */
'use strict';

require.config({
    baseUrl    : '/assets/vendor',
    paths      : {
        moment          : 'moment/moment',
        bootbox         : 'bootbox/bootbox',
        lodash          : 'lodash/lodash.min',
        jquery          : 'jquery/dist/jquery.min',
        modernizr       : 'modernizr/modernizr',
        'jquery-ui'     : 'jquery-ui/jquery-ui.min',
        bootstrap       : 'bootstrap/dist/js/bootstrap.min',
        cryptojs        : 'cryptojslib/components',
        toastr          : 'toastr/toastr',
        mscrollbar      : 'malihu-custom-scrollbar-plugin/jquery.mCustomScrollbar',
        mousewheel      : 'jquery-mousewheel/jquery.mousewheel.min',
        'jquery-migrate': 'jquery-migrate/jquery-migrate',

        'bs-modal': 'bootstrap-modal/js/bootstrap-modal',
        'bs-modal-manager': 'bootstrap-modal/js/bootstrap-modalmanager',

        'bs-select': 'bootstrap-select/js/bootstrap-select'
    },
    shim: {
        lodash: {
            exports: '_'
        },
        'jade/runtime': {
            exports: 'jade'
        },
        'jquery': {
            exports: '$',
            init: function(){
                this.jquery.noConflict();
            }
        },
        'jquery-migrate': ['jquery'],
        'jquery-ui': ['jquery', 'jquery-migrate'],
        'bootstrap': ['jquery-ui'],
        'mscrollbar': ['bootstrap', 'mousewheel'],
        'packadic/packadic': ['jquery', 'jquery-migrate', 'jquery-ui', 'jade/runtime'],
        'packadic/demo': ['packadic/packadic'],
        'bs-modal': ['bootstrap', 'bs-modal-manager']
    },
    waitSeconds: 15
});

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
