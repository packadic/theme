var path   = require('path'),
    fs     = require('fs-extra'),

    async  = require('async'),
    _      = require('lodash'),

    chai   = require('chai'),
    expect = chai.expect,
    assert = chai.assert,
    should = chai.should(),

    sinon  = require('sinon'),

    radic  = require('radic'),
    util   = radic.util,

    lib    = require('../tasks/lib');

describe('index', function(){
    'use strict';
    it('should be awesome', function( done ){
        assert.ok(true);
        done();
    });
});
