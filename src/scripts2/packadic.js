(function( factory ){
    'use strict';
    factory(jQuery, _, window);
}(function( $, _, window ){
    'use strict';


    function defined( obj ){
        return typeof obj !== 'undefined';
    }

    /**
     *
     * @param options
     * @constructor
     * @property {$} $el - used for event handlers within Packadic
     * @property {$} $sideNav - the side menu
     */
    var Packadic = window.Packadic = function( options ){

        this.options = _.merge({
            data     : {},
            debug    : true,
            selectors: {
                site   : '#site-wrapper',
                top    : '#top-wrapper',
                page   : '#page-wrapper',
                side   : '#sidebar-wrapper',
                content: '#content-wrapper',

                topnav : 'nav.navbar-topmenu',
                sideNav: '.side-nav ul',
                topmenu: '#topmenu'
            },
            sideNav  : {},
            topMenu  : {},
            site     : {} // site data
        }, options);

        this.init();
    }

    // Statics
    Packadic.init = function( options ){
        return window.packadic = new Packadic(options);
    };

    Packadic.getTemplate = function( name, data ){
        return window.tpls[ name ](data);
    };

    Packadic.getRandomId = function( length ){
        var text = ""
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        for( var i = 0; i < 15; i++ ){
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
    };

    Packadic.prototype = {

        // Handlers
        handleResize : function(){

        },

        // Data
        getNavigation: function( which ){
            return this.site.data.navigation[ which ];
        },


        // Events
        _trigger     : function( type, data ){
            this.$el.trigger(_.merge({type: type}, data));
        },

        _on        : function( type, cb ){
            this.$el.on(type, cb);
        },


        // Initialisers
        initSideNav: function(){
            this.$sideNav.sideNav(this.options.sideNav);
            this.$sideNav.sideNav('createFromJSON', this.getNavigation('sidenav'));
        },

        initDebug: function(){
            if( this.options.debug === true ){
                $('.site-debug').show();
                $('*[data-debug]').each(function(){
                    var $this = $(this);
                    debug[ $this.data('debug') ]($this);
                });
            } else {
                $('.site-debug').hide();
            }
        },

        initCodeview: function(){
            $('.codeviewer-button').on('click', function( e ){
                e.preventDefault();
                var $btn = $(this);

                // get original textarea
                var $editorOrig = $($btn.attr('href'));
                console.log('orig', $editorOrig);

                // create a clone to use in bootbox
                var $editorNew = $editorOrig.clone();
                var newId = $editorOrig.attr('id') + '_new';
                $editorNew.attr('id', newId);
                console.log('new', $editorNew);

                // append to bootbox
                var $container = $(document.createElement('div'));
                $container.append($editorNew);
                bootbox.dialog({
                    title  : 'Viewing code',
                    message: $container.html()
                });

                // create the codmirror in bootbox
                var editor = CodeMirror.fromTextArea(document.getElementById(newId), {
                    mode : 'jade',
                    theme: 'zenburn'
                });

                // adjust the size
                var width = $btn.data('width') || '100%';
                var height = $btn.data('height') || 70;
                editor.setSize(width, height);

                // export to global;
                window.cmeditor = window.cmeditor || {};
                window.cmeditor[ newId ] = editor;

                setTimeout(function(){
                    window.cmeditor[ newId ].refresh();
                }, 400);
            });
        },


        initShowHtml: function(){
            $('.show-html').on('click', function( e ){
                e.preventDefault();
                var $el = $(this);
                var id = Packadic.getRandomId();
                var code = $el[ 0 ].outerHTML;
                var $container = $(document.createElement('div'));
                var $textarea = $(document.createElement('textarea'));
                $textarea.attr('id', id).html(code);
                $container.append($textarea);
                bootbox.dialog({
                    title  : 'Viewing code',
                    className: 'bootbox-full-width',
                    message: $container.html()
                });

                // create the codmirror in bootbox
                var editor = CodeMirror.fromTextArea(document.getElementById(id), {
                    mode       : 'htmlmixed',
                    lineNumbers: true,
                    lineWrapping: true,
                    theme      : 'zenburn'
                });

                // adjust the size
                editor.setSize('100%', 200);
                CodeMirror.commands.selectAll(editor);
                CodeMirror.commands.indentAuto(editor);
                CodeMirror.commands.goDocStart(editor);
                editor.refresh();
                setTimeout(function(){
                    editor.refresh();
                }, 400);
            });
        },

        initShowClass: function(){
            function strColor( str, color ){
                return '<span class="text-' + color + '">' + str + '</span>';
            }

            $('.show-class').each(function(){
                var str = '<strong>' + strColor(this.tagName.toLowerCase(), 'green') + '</strong>';
                var dot = strColor('.', 'blue');
                $.each(this.classList, function( i, className ){
                    if( className === 'show-class' ){
                        return;
                    }
                    str += dot + strColor(className, 'orange');
                });
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

                });
            });
        },

        init: function(){
            this.$element = $(document.createElement('div'));
            this.$window = $(window);
            this.$document = $(window.document);
            $.each(this.options.selectors, function( name, selector ){
                this[ '$' + name ] = $(selector);
            }.bind(this));
            this.$sideNav = this.$sideNav.first();

            this.site = this.options.site;

            this.initShowHtml();
            this.initShowClass();
            this.initSideNav();
            this.initCodeview();
            this.initDebug();

            console.log(this);
        }
    };

}))
;
