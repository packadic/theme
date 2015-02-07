define([ 'jquery', 'plugins/lodash', 'config' ],
    function( $, _, config ){
        'use strict';

        function defined( obj ){
            return !_.isUndefined(obj);
        }

        var theme = {};

        (function Helpers(){
            // Statics
            theme.getTemplate = function( name, data ){
                return window.tpls[ name ](data);
            };

            theme.getRandomId = function( length ){
                if(!_.isNumber(length)){
                    length = 15;
                }
                var text = "";
                var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
                for( var i = 0; i < length; i++ ){
                    text += possible.charAt(Math.floor(Math.random() * possible.length));
                }
                return text;
            };

            theme.toastr = function( callback ){
                var args = _.toArray(arguments);
                console.log(args);
                require([ 'toastr' ], callback);
            };

            theme.CodeMirror = function( options, callback ){
                var load = [ 'codemirror/lib/codemirror', 'codemirror/mode/javascript/javascript', 'codemirror/mode/css/css', 'codemirror/mode/xml/xml', 'codemirror/mode/htmlmixed/htmlmixed' ];

                if( defined(options) ){
                    if( defined(options.modes) ){
                        $.each(options.modes, function( i, mode ){
                            mode = 'codemirror/mode/' + mode + '/' + mode;
                            if( load.indexOf(mode) === -1 ){
                                load.push(mode);
                            }
                        });
                    }

                    if( defined(options.addons) ){
                        $.each(options.addons, function( i, addon ){
                            addon = 'codemirror/addon/' + addon;
                            if( load.indexOf(addon) === -1 ){
                                load.push(addon);
                            }
                        });
                    }
                } else {
                    callback = options;
                }
                require(load, function( CodeMirror ){
                    callback(CodeMirror);
                });
            };

            theme.showCode = function( options ){
                options.title = options.title || 'Viewing code';
                options.load = options.load || {};
                options.editor = options.editor || {};

                theme.CodeMirror(options.load, function( CodeMirror ){
                    require([ 'bootbox' ], function( bootbox ){

                        var id = theme.getRandomId();
                        var $container = $(document.createElement('div'));
                        var $textarea = $(document.createElement('textarea'));
                        $textarea.attr('id', id).html(options.code);
                        $container.append($textarea);
                        bootbox.dialog({
                            title    : options.title,
                            className: 'bootbox-full-width',
                            message  : $container.html(),
                            buttons  : {
                                success: {
                                    label    : 'Close',
                                    className: 'btn-primary'
                                }
                            }
                        });

                        // create the codmirror in bootbox
                        var editor = CodeMirror.fromTextArea(document.getElementById(id), _.merge({
                            mode        : 'htmlmixed',
                            lineNumbers : true,
                            lineWrapping: true,
                            theme       : 'zenburn'
                        }, options.editor));

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
                });
            };
        }.call());

        (function Initialisers(){
            theme.initSidebar = function(){
                var $el = $(config.selectors.sidebar);
            };

            // @todo move to demo
            theme.initShowHtml = function(){
                $('.show-html')
                    .on('click', function( e ){
                        e.preventDefault();
                        var $el = $(this);
                        var code = $el[ 0 ].outerHTML;
                        theme.showCode({
                            title : 'Showing code',
                            code  : code,
                            editor: {
                                mode: 'htmlmixed'
                            }
                        });
                    })
                    .tooltip({
                        title: 'Click to view HTML code'
                    });
            };
        }.call());

        theme.init = function(){
            theme.$window = $(window);
            theme.$document = $(window.document);

            // @todo move to demo
            theme.initShowHtml();
            theme.initSidebar();
        };

        return theme;
    });
