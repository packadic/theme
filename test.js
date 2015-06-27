'use strict';

var
    _      = require('lodash'),
    util   = require('util');


function log() {
    _.toArray(arguments).forEach(function (vl) {
        process.stdout.write(util.inspect(vl, {hidden: true, depth: 5, colors: true}) + "\n")
    })
}


var def = {
    animate : 1000,
    onStep  : function (value) {
        this.$el.find('span').text(~ ~ value);
    },
    barColor: '#aaa',
    size    : 85,
    child: {
        first: 'first',
        second: 'second'
    }
};

var given = {
    barColor: 'teal',
    percent: '88',
    label: 'haai',
    child: {
        second: 'yep',
        third: 'third'
    }
};


var out = _.merge(def, given);


log(out);
