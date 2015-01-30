(function( factory ){
    'use strict';
    factory(jQuery, _, window);
}(function( $, _, window ){
    'use strict';


    function defined( obj ){
        return typeof obj !== 'undefined';
    }

    var debug = {
        'sidemenu-apply-test-json': function( $el ){
            $el.on('click', function( e ){
                e.preventDefault();
                window.packadic.$sidemenu.sideMenu('createFromJSON', $.test.menuItems);
            });
        }
    };


    /**
     *
     * @param options
     * @constructor
     * @property {$} $el - used for event handlers within Packadic
     * @property {$} $sidemenu - the side menu
     */
    function Packadic( options ){

        this.options = _.merge({
            data     : {},
            debug    : true,
            selectors: {
                sidebar : 'aside.sidemenu',
                topnav  : 'nav.navbar-topmenu',
                sidemenu: '#sidemenu',
                topmenu : '#topmenu'
            },
            sideMenu : {},
            topMenu  : {}
        }, options);

        this.$el = $(document.createElement('div'));

        this.window = $(window);

        this.document = $(window.document);

        $.each(this.options.selectors, function( name, selector ){
            this[ '$' + name ] = $(selector);
        }.bind(this));

        console.log(this);

        this.init();
    }


    Packadic.prototype = {
        init        : function(){
            this.$sidemenu.sideMenu(this.options.sideMenu);
            this.$sidemenu.sideMenu('createFromJSON', this.navigation('sidemenu'));

            this.$topmenu.topMenu(this.options.topMenu);
            this.$topmenu.topMenu('createFromJSON', this.navigation('topmenu'));


            this.window.on('resize', this.handleResize(this));
            this.handleResize(this)();

            this.document.on('click', '.sidemenu-toggle', function( e ){
                e.preventDefault();
                console.log('click .sidemenu-toggle', e, this.$sidemenu);
                this.$sidemenu.sideMenu('toggle');
            }.bind(this));

            this.document.find('.show-class').each(function(){
                $(this).tooltip({
                    title: this.className.replace('show-class', '')
                });
            });

            if(this.document.find('.codeviewer-button').length > 0){
                this.initCodeview();
            }
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
                })

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
                window.cmeditor[newId] = editor;

                setTimeout(function(){
                    window.cmeditor[newId].refresh();
                }, 400);
            });
        },
        destroy     : function(){

        },
        template    : function( name, data ){

        },
        handleResize: function( self ){
            return function( e ){
                console.log('handleREsize', this, 'e', e);
                var height = this.window.outerHeight() - this.$topnav.outerHeight();
                this.$sidebar.height(height);
            }.bind(self);
        },
        navigation  : function( which ){
            return this.options.data.navigation[ which ];
        },
        api         : function( endpoint, cb ){
            var async = defined(cb);
            var config = {
                url     : '/api/' + endpoint,
                dataType: 'json',
                async   : async,
                type    : 'GET'
            };
            if( async ){
                config.success = cb;
            }
            return $.ajax(config);

        },
        _trigger    : function( type, data ){
            this.$el.trigger(_.merge({type: type}, data));
        },
        on          : function( type, cb ){
            this.$el.on(type, cb);
        }
    };

    /**
     * Static init function that instansiates Packadic and puts it into window.packadic
     * @param options
     * @returns {Packadic}
     */
    Packadic.init = function( options ){
        return window.packadic = new Packadic(options);
    };
    window.Packadic = Packadic;
}));
