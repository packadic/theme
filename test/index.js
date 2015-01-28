var path         = require('path'),
    fs           = require('fs-extra'),

    async        = require('async'),
    _            = require('lodash'),

    chai         = require('chai'),
    expect       = chai.expect,
    assert       = chai.assert,
    should       = chai.should(),

    sinon        = require('sinon'),
    EventEmitter = require('eventemitter2').EventEmitter,

    radic        = require('radic'),
    util         = radic.util;

describe('index', function(){
    'use strict';
    it('should be awesome', function( done ){
        assert.ok(true);
    });
});
