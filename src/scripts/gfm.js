define([ 'highlightjs', 'marked' ],
    function( highlightjs, marked ){
        'use strict';

        marked.setOptions({

            breaks: true,
            highlight: function(code, lang) {
                console.log('highlighting ', lang, code);
                return highlightjs.highlightAuto(code).value;
            }
        });
        return marked;
    });
