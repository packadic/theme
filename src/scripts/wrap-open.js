(function(){


    window.App = {};
    window.__app_cbs = [];
    window.App.ready = function(cb){
        window.__app_cbs.push(cb);
    };

