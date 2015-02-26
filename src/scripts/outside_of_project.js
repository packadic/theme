(function(){
    function addPath(key, val)
    {
        window.packadic.rjs.paths[key] = 'af';
    }
    window.packadic.loaded(function(){

        require(['jquery'], function($){
            console.log('loaded and got jquery', $);
        })
    })

}.call());
