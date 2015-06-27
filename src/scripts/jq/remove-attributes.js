define([
    'jquery', 'fn/defined', 'fn/default', 'fn/cre'
], function($, defined, def, cre){
    "use strict";

    $.fn.removeAttributes = function(){
        return this.each(function(){
            var attributes = $.map(this.attributes, function(item) {
                return item.name;
            });
            var img = $(this);
            $.each(attributes, function(i, item) {
                img.removeAttr(item);
            });
        });
    }
});
