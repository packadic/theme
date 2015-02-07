define([ 'jquery', 'plugins/lodash' ],
    function( $, _ ){
        'use strict';
        function strColor( str, color ){
            return '<span class="text-' + color + '">' + str + '</span>';
        }

        /**
         * @returns {jQuery}
         */
        function getEl(){
            if( typeof window.packadic_show_class === 'undefined' ){
                var $el = window.packadic_show_class = $(document.createElement('div'));
                $el.appendTo('body');
                $el.hide();
                $el.css({
                    position  : 'fixed',
                    top       : '-2px',
                    right      : '0',
                    width     : 'auto',
                    'z-index' : '1200',
                    background: 'rgb(255, 255, 255)',
                    border    : '1px solid #D2CFCF',
                    padding   : '6px'
                });
            }
            return window.packadic_show_class;
        }

        function createClassString(el){

            var str = '<strong>' + strColor(el.tagName.toLowerCase(), 'green') + '</strong>';
            var dot = strColor('.', 'blue');
            $.each(el.classList, function( i, className ){
                if( className === 'show-class' || className === 'show-class-parent' ){
                    return;
                }
                str += dot + strColor(className, 'orange');
            });

            return str;
        }

        return function( $els ){
            console.log('button-icon-showcase', $els);


            $els.each(function(){
                var $el = $(this);
                var str = '';
                if($el.hasClass('show-class-parent')){
                    str += createClassString($el.parent()[0]) + strColor('&nbsp;&nbsp;<strong>&gt;</strong>&nbsp;&nbsp;', 'red-dark');
                }
                str += createClassString(this);

                $el.on('mouseenter', function(){
                    getEl().html(str).show();
                }).on('mouseleave', function(){
                    getEl().hide();
                });
                /*
                 $(this).popover({
                 content  : '<span style="font-size: 16px; font-family: \'Source Code Pro\', \'Consolas\', \'Courier\', monospace">' + str + '</span>',
                 template : '<div class="popover popover-full-width" role="tooltip"><div class="arrow"></div><h3 class="popover-title"></h3><div class="popover-content"></div></div>',
                 container: '#content-wrapper',
                 placement: 'top',
                 trigger  : 'hover',
                 html     : true,
                 viewport : {
                 selector: "#content-wrapper",
                 padding : 0
                 }

                 });*/
            });
        };
    });
