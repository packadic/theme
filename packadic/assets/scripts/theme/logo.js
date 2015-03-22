define([ 'plugins/svg' ], function( SVG ){

    logo = {};

    var $el = $('#svg2');
    var el = $el[0];
    var l;
    var supported = SVG.supported;

    logo.initWithoutSVG = function(){
        console.warn('Browser does not support SVG. What DA FUCK is this use using? Stop using win 3.11 and fix yourself up with some recent fucking Linux distro already');
    };

    logo.initWithSVG = function(){
        console.log('Oh yeah SVG baby', l);


    };

    logo.init = function(){

        if( SVG.supported ){
       //     l = SVG(el);
            logo.initWithSVG();
        } else {
            logo.initWithoutSVG();
        }

    };

    logo.get = function(){
        return l;
    };



    return window.logo = logo;
});
