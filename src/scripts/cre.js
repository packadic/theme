define([ 'jquery' ], function( $ ){
    'use strict';

    return function( name ){
        if( !defined(name) ){
            name = 'div';
        }
        return $(document.createElement(name));
    }
});
