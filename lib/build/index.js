var radic = require('radic'),
    util = radic.util,
    fs = require('fs'),
    resolve = require('path').resolve,
    EventEmitter = require('events').EventEmitter;

function Path(str){

}

function Chainer(){

}


function getBuilders(){
    fs.readdirSync(__dirname).forEach(function(item){
        if(fs.existsSync(resolve(__dirname, item, 'index.js'))){

        }

    })
}

exports.Builder = require('./builder');

exports.builders = [];

exports.getBuilder = function(name){
    require('./' + name);
};
