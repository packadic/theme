define([ 'jquery', 'demo', 'plugins/bootbox', 'plugins/bs-modal' ],
    function( $, demo, bootbox ){
        'use strict';

        var modals = {
            'information': {
                message: 'Some message here',
                title: 'Information for you',
                buttons: {
                    success: {
                        label: "Success!",
                        className: "btn-success"
                    },
                    danger: {
                        label: "Danger!",
                        className: "btn-danger"
                    },
                    main: {
                        label: "Click ME!",
                        className: "btn-primary"
                    }
                }
            }
        };


        return function($els){
            console.log('modals', $els);
            $els.on('click', function(e){
                e.preventDefault();
                var $el = $(this);
                var modal = $el.data('demo-modal');
                console.log('demo/modals', modal);
                bootbox.dialog(modals[modal]);
            });
        };
    });
