define([ 'jquery', 'plugins/highlightjs' ],
    function( $, highlightjs ){
        'use strict';

        return {
            applyTo: function($els){
                $els.each(function(){
                    var $el = $(this);
                    var classes = $el[0 ].classList;
                    $.each(classes, function(i, className){
                        if(className.indexOf("lang-") !== -1){
                            var lang = className.replace('lang-', '');
                            var newContent = highlightjs.highlight(lang, $el.html()).value;
                            $el.html(newContent);
                        }
                    });
                })
            }
        };
    });
