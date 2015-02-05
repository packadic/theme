define([ 'jquery', 'packadic/demo', 'packadic/packadic' ],
    function( $, demo, Packadic ){
        'use strict';

        var modals = {};

        return function($els){
            $els.on('click', function(e){
                e.preventDefault();
                var $el = $(this);
                var modal = $el.data('demo-modal');

            });
        };
    });
