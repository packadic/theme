'use strict';


var units = (function(){

    function submenu($li){

        var $submenuTitle = $li.children('a').first().clone().prependTo($li).addClass('submenu-title');
        $submenuTitle.on('mouseleave', function(){ $(this).remove(); })
    }

    return {
        submenu: submenu
    }

}.call());

console.log(units);
