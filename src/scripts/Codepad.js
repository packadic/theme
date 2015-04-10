define([ 'jquery', 'theme', 'templates/codepad', 'plugins/bs-select' ], function( $, theme, template ){


    (function Helpers(){
    }.call());

    function cre( el ){
        if( _.isUndefined(el) ){
            el = 'div';
        }
        return $(document.createElement(el));
    }

    function Codepad( id ){
        this.id = id;
        this.$el = $('#' + id).html('');

        this.$codepad = $(template({
            id: id
        }));
        this.$el.append(this.$codepad.hide());

        this.$editor = cre('pre').attr('id', 'codepad-editor-' + this.id);

        if(this.options.deferRequireModules === false){
            this.__requireModules(function( reqs ){
                this.reqs = reqs;
            }.bind(this));
        }

        theme.on('resize', function(){
            setTimeout(function(){
                this.adjustHeightToMatch();
            }.bind(this), 200)
        }.bind(this))
    }

    Codepad.prototype = {
        options: {},
        defaults   : {
            deferRequireModules: true
        },
        Constructor: Codepad,

        reqs     : [],
        aceEditor: null,
        themelist: {},
        modelist : {},

        __requireModules: function( cb ){
            var acereq = [ 'ace/ace' ];
            $.each([ 'beautify', 'emmet', 'searchbox', 'settings_menu', 'modelist', 'themelist', 'language_tools' ], function( i, ext ){
                acereq.push('ace/ext/' + ext);
            });
            require(acereq, function( ace, beautify, emmet, searchbox, settings_menu, modelist, themelist, language_tools ){
                this.themelist = themelist;
                this.modelist = modelist;
                cb([ ace, beautify, emmet, searchbox, settings_menu, modelist, themelist, language_tools ]);
            }.bind(this));
            return this;
        },

        __setupEditor: function( ace, beautify, emmet, searchbox, settings_menu, modelist, themelist, language_tools ){
            this.adjustHeightToMatch();
            this.$codepad.find('.codepad-editor-container').html('').append(this.$editor);

            var editor = this.aceEditor = window.aceEditor = ace.edit(this.$editor.attr('id'));
            settings_menu.init(editor);
            editor.setTheme("ace/theme/kuroir");
            editor.setOption("enableEmmet", true);
            editor.setFontSize(14);
            editor.session.setMode("ace/mode/markdown");                                                                                    // enable autocompletion and snippets
            editor.setOptions({
                enableBasicAutocompletion: true,
                enableSnippets           : true,
                enableLiveAutocompletion : false
            });
            editor.commands.addCommands(
                [ {
                      name    : "showSettingsMenu",
                      bindKey : {win: "Ctrl-q", mac: "Command-q"},
                      exec    : function( editor ){
                          editor.showSettingsMenu();
                      },
                      readOnly: true
                  } ]
            );
            return this;
        },

        adjustHeightToMatch: function( height ){
            height = height || parseInt($('main').css('min-height').replace('px', '')) -
                               $('main > header.content').outerHeight() -
                               parseInt($('main > div.content').css('padding-top').replace('px', '')) -
                               parseInt($('main > div.content').css('padding-bottom').replace('px', '')) -
                               $('section#top').outerHeight() -
                               $('section#bottom').outerHeight();
            this.$editor.css({
                height: height
            });
            if( !_.isUndefined(this.aceEditor) && this.aceEditor ){
                this.aceEditor.resize();
            }
            return this;
        },

        isInitialized: false,

        init: function( cb ){
            if( this.isInitialized ){
                if( _.isFunction(cb) ){
                    cb();
                }
                return this
            }
            this.$el.replaceWith(this.$codepad);
            this.__requireModules(function( reqs ){
                this.__setupEditor.apply(this, reqs);

                this.__makeList('theme');
                setTimeout(function(){ // needs to be executed with a delay, otherwise getmode returns text
                    this.__makeList('mode');
                }.bind(this), 400);

                $.each(this.toolbarButtons, function(name, btn){
                    if(btn.hasClass('added')){
                        return;
                    }
                    btn.addClass('added');
                    this.$codepad.find('.codepad-toolbar .codepad-toolbar-left').append(btn);
                }.bind(this));

                this.isInitialized = true;
                if( _.isFunction(cb) ){
                    cb();
                }
            }.bind(this));
            return this;
        },

        show: function(){
            this.$codepad.show();
            return this;
        },

        hide: function(){
            this.$codepad.hide();
            return this;
        },


        setValue: function(val){
            this.aceEditor.session.setValue(val);
        },

        setModeForPath: function(path){
            this.aceEditor.session.setMode(this.modelist.getModeForPath(path).mode);
            this.__makeList('mode');
        },

        toolbarButtons  : {},
        addToolbarButton: function( name, value, classes, cb ){
            var btn = this.toolbarButtons[ name ] = cre('a')
                .addClass('btn ' + classes || '')
                .attr('id', 'codepad-toolbar-button-' + name)
                .html(value);
            if(this.isInitialized){
                btn.addClass('added');
                this.$codepad.find('.codepad-toolbar .codepad-toolbar-left').append(btn);
            }
            if( _.isFunction(cb) ){
                cb(btn);
            }
            return btn;
        },

        enableToolbar: function(){
            this.$codepad.find('.codepad-toolbar').removeClass('hide');
            return this;
        },

        __makeList: function( type ){
            var $select = this.$codepad.find('select.codepad-editor-' + type + 'list').html('');
            $.each(type == 'theme' ? this.themelist.themes : this.modelist.modes, function( i, th ){
                $select.append(
                    cre('option')
                        .attr('value', type == 'theme' ? th.theme : th.mode)
                        .text(th.caption)
                )
            });

            $select.selectpicker();
            $select.on('change', function( e ){
                var val = $select.selectpicker('val');
                if( type == 'theme' ){
                    aceEditor.setTheme(val);
                } else {
                    aceEditor.session.setMode(val)
                }
            });

            if( type == 'theme' ){
                $select.selectpicker('val', this.aceEditor.getTheme());
            } else {
                $select.selectpicker('val', this.aceEditor.session.getMode().$id);
            }
            return this;
        }

    };


    return Codepad;
});
