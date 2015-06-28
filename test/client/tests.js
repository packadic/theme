
QUnit.test( "hello test", function( assert ) {
    assert.ok( 1 == "1", "Passed!" );
});

QUnit.test('packadic config test', function(assert){
    assert.ok(typeof(window.packadic) == 'object', 'passed');
})
