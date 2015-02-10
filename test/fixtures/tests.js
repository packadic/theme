'use strict';


var units = (function(){

    QUnit.test( "hello test", function( assert ) {
        assert.ok( 1 == "1", "Passed!" );
    });
}.call());

console.log(units);
