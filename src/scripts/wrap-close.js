

require(['packadic'], function(packadic){
    // Create new instance and bind to App
    window['App'] = new packadic.App();
    // Execute all buffered callbacks, cause now, we can App
    _.each(window['__app_cbs'], function(cb, i){
        if(typeof(cb) == 'function'){
            cb();
        }
    });
    // Remove it
    delete window['__app_cbs'];
    // We ready to App, so execute immidieately
    window['App'].ready = function(cb){
        cb();
    };

});

}.call(this));



