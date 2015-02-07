define([ 'jquery', 'plugins/lodash' ],
    function( $, _ ){
        'use strict';

        var config = {};

        function init(options){
            config = _.merge(config, options);
        }

        config.init = init;
        config.merge = init;

        return config;
    });
