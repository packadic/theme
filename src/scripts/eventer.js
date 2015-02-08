define(['jquery', 'plugins/events', 'config'], function($, EventEmitter, config){
    var make = function(name, obj, prop){
        if(typeof prop !== 'string'){
            prop = '_events';
        }
        obj[prop] = new EventEmitter();
        obj.on = obj[prop].on;
        obj.once = obj[prop].once;
        obj.off = obj[prop].off;
        obj._trigger = function(){
            var args = $.makeArray(arguments);
            if(config.get('debug') === true){
                console.debug('DEBUG::' + name + ':event:' + args[0])
            }
            obj[prop].trigger.apply(obj[prop], args);
        };
        obj._defineEvent = function(){

            obj[prop].defineEvent.apply(obj[prop], $.makeArray(arguments));
        };
        return obj;
    };


    function eventer(name, obj, prop){
        return make(name, obj, prop);
    }
    eventer.get = function(){
        return new EventEmitter();
    };

    return eventer;
});
