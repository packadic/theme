
window.App = {};
window.__app_cbs = [];
window.App.ready = function(cb){
    window.__app_cbs.push(cb);
};

// placeholder function until app is ready, will then call the real App.when fns
window.App.when = function() {
    var args = arguments;
    window.App.ready(function () {
        window.App.when.apply(window.App, args);
    });
};
