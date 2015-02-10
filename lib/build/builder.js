var radic = require('radic'),
    util = radic.util,
    EventEmitter = require('events').EventEmitter;

function Builder(config, grunt){
    EventEmitter.call(this);
    this.config = config;
    this.validate();
}
util.inherits(Builder, EventEmitter);
module.exports = Builder;
Builder.Builder = Builder;

Builder.prototype = {
    validate: function(){

    },
    build: function(){
        grunt.task.run([this.config.name + ':build']);
    }
};
