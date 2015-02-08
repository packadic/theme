define([ 'jquery', 'plugins/lodash' ],
    function( $, _ ){
        'use strict';

        var config = {};

        function init(options){

            config = _.merge(config, options);
        }

        config.init = init;
        config.merge = init;


        config.init({
            site     : window.PACKADIC_SITE_DATA,
            selectors: {
                sidebar: 'ul.sidebar-nav-menu'
            }
        });


        return config;
    });
