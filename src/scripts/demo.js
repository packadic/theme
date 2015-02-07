define([ 'jquery', 'packadic/packadic' ],
    function( $, Packadic ){
        'use strict';
        var demo = {};

        demo.present = function(selector, module){
            var $els = $(selector);
            if($els.length > 0){
                require(['packadic/demo/' + module], function(mod){
                    mod($els);
                });
            }
        };

        demo.init = function(){
            this.present('.demo-modal', 'modals');
            this.present('.demo-button-editor', 'button-icon-showcase');
            this.present('#gtreetable', 'gtreetable');
            this.present('.show-class', 'show-class');
            this.present('#demo-plugins-docs', 'plugins-docs');
            this.present('.plugin-markdown', 'plugin-markdown');
            this.present('.demo-jq-impromptu', 'jq-impromptu');
        };

        return demo;
    });
