/*global window, navigator, document, importScripts, setTimeout, opera */
'use strict';

require.config({
    baseUrl    : '/assets/vendor',
    paths      : {
        //lodash          : 'lodash/lodash.min',
        //jquery          : 'jquery/dist/jquery.min',
        //bootstrap       : 'bootstrap/dist/js/bootstrap.min',
        //'jquery-ui'     : 'jquery-ui/jquery-ui.min',
        lodash          : 'lodash.custom.min',
        bootstrap       : 'bootstrap.custom.min',
        jquery          : 'jquery.min',
        'jquery-ui'     : 'jquery-ui.custom.min',

        moment          : 'moment/moment/min/moment.min',
        bootbox         : 'bootbox.min',
        modernizr       : 'modernizr.min',

        cryptojs        : 'cryptojslib/components',
        toastr          : 'toastr/toastr',
        mscrollbar      : 'mscrollbar.min',
        mousewheel      : 'jquery-mousewheel/jquery.mousewheel.min',
        'jquery-migrate': 'jquery-migrate/jquery-migrate',

        'bs-modal': 'bootstrap-modal/js/bootstrap-modal',
        'bs-modal-manager': 'bootstrap-modal/js/bootstrap-modalmanager',

        'bs-select': 'bootstrap-select/dist/js/bootstrap-select.min'
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
        'jquery-ui': ['jquery'], //, 'jquery-migrate'],
        'bootstrap': ['jquery-ui'],
        'mscrollbar': ['bootstrap', 'mousewheel'],
        'packadic/packadic': ['jquery', 'jquery-ui', 'jade/runtime'],
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
