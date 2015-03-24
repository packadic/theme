define([ 'jquery', 'config', 'eventer', 'autoloader', 'plugins/cookie', 'plugins/bs-material-ripples' ],
    function( $, config, eventer, autoloader ){
        'use strict';

        function defined( obj ){
            return !_.isUndefined(obj);
        }

        function cre( name ){
            if( !defined(name) ){
                name = 'div';
            }
            return $(document.createElement(name));
        }

        var theme = {
            options: {}
        };

        eventer('theme', theme);

        // hack to make slideUp and slideDown work with animate, so it uses GSAP
        if( typeof TweenLite !== 'undefined' || typeof TweenMax !== 'undefined' ){
            var slideAnimation = function( type, speed, cb ){
                if( typeof cb !== 'function' ){
                    cb = function(){
                    };
                }
                var margin = function( what ){
                    parseInt(sub.css('margin-' + what).replace('px', ''))
                };
                var attrs = {
                    height: type
                };
                for( var i = 0; i < 4; i += 2 ){
                    var which = [ "Top", "Right", "Bottom", "Left" ][ i ];
                    attrs[ "margin" + which ] = attrs[ "padding" + which ] = type;
                }
                attrs.easing = "easeOutStrong";
                return this.animate(attrs, speed).animate({overflow: 'visible'}, {duration: 0, complete: cb});
            };
            $.fn.slideUp = function( speed, cb ){
                slideAnimation.apply(this, [ 'hide', speed, cb ]);
            };
            $.fn.slideDown = function( speed, cb ){
                slideAnimation.apply(this, [ 'show', speed, cb ]);
            };
        }
        // endhack

        (function Options(){

            theme.setOption = function( option, value ){

            };

            theme.getOption = function( option ){

            };

            theme.setOptions = function( options ){
                theme.options = _.merge(theme.options, options);
                // console.log('theme.setOptions options=', options, 'theme.options=', theme.options);
            };

            theme.isDebug = function(){
                return theme.options.debug;
            }

        }.call());

        (function Helpers(){

            /**
             * checks is a property is supported on the browser
             * @param propertyName
             * @returns {boolean}
             * @example
             * var supported = theme.isSupported('animation')
             */
            theme.isSupported = function( propertyName ){
                var elm = document.createElement('div');
                propertyName = propertyName.toLowerCase();

                if( elm.style[ propertyName ] != undefined ){
                    return true;
                }

                var propertyNameCapital = propertyName.charAt(0).toUpperCase() + propertyName.substr(1),
                    domPrefixes = 'Webkit Moz ms O'.split(' ');

                for( var i = 0; i < domPrefixes.length; i++ ){
                    if( elm.style[ domPrefixes[ i ] + propertyNameCapital ] != undefined ){
                        return true;
                    }
                }

                return false;
            };

            theme.createLoader = function( name ){
                return cre().addClass('loader').addClass('loader-' + name)
            };

            theme.getTemplate = function( name, cb ){
                //   logDebug('getting template', name, cb);
                require([ 'templates/' + name ], function( template ){
                    //      logDebug('gott template', name, template);
                    cb(template);
                });
            };

            theme.getViewPort = function(){
                var e = window,
                    a = 'inner';
                if( !('innerWidth' in window) ){
                    a = 'client';
                    e = document.documentElement || document.body;
                }

                return {
                    width : e[ a + 'Width' ],
                    height: e[ a + 'Height' ]
                };
            };

            theme.isTouchDevice = function(){
                try {
                    document.createEvent("TouchEvent");
                    return true;
                } catch(e) {
                    return false;
                }
            };

            theme.getRandomId = function( length ){
                if( !_.isNumber(length) ){
                    length = 15;
                }
                var text = "";
                var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
                for( var i = 0; i < length; i++ ){
                    text += possible.charAt(Math.floor(Math.random() * possible.length));
                }
                return text;
            };

            theme.getBreakpoint = function( which ){
                return parseInt(config.scss.breakpoints[ 'screen-' + which + '-min' ].replace('px', ''));
            };


        }.call());

        (function Events(){


            theme._initResizeEvent = function(){
                theme._defineEvent('resize');
                var resize;
                theme.$window.on('resize', function(){
                    if( resize ){
                        clearTimeout(resize);
                    }
                    resize = setTimeout(function(){
                        theme._trigger('resize');
                    }, 50);
                });
            };

            theme.initEvents = function(){
                theme._initResizeEvent();
            }
        }.call());

        (function Loaders(){

            theme.notify = theme.toastr = function( fnName, message, title ){
                require([ 'plugins/toastr' ], function( toastr ){
                    toastr[ fnName ].apply(toastr, [ message, title ]);
                });
            };

            theme.alert = function( opt ){
                var type = opt.type || 'success',
                    message = opt.message || '',
                    delay = opt.delay || 3000,
                    title = opt.title || false,
                    target = opt.target || 'main > div.content',
                    insertFnName = opt.insertFnName || 'prepend';

                var $alert = cre('div');
                var $close = cre('button');

                $alert
                    .addClass('alert alert-' + type + ' alert-dismissible')
                    .append($close
                        .attr('type', 'button')
                        .attr('data-dismiss', 'alert')
                        .attr('aria-label', 'Close')
                        .addClass('close')
                        .html('<span aria-hidden="true">×</span>'));

                if( title !== false ){
                    $alert.append(cre('strong').text(title));
                }

                $alert.append(cre('p').text(message));

                $('main > div.content').first()[ insertFnName ]($alert);
                setTimeout(function(){
                    $alert.hide('slow');
                    $alert.fadeOut('slow');
                }, delay);
            };


        }.call());

        (function Tasks(){
            var $taskList = $('ul.dropdown-task-list');
            var $taskListContainer = $taskList.parent('li');
            var $taskListLink = $taskList.parent().find(' > a.dropdown-toggle').first();

            function _prependTask( $el ){
                $taskList.find('li.header').after($el);
            }

            function _appendTask( $el ){
                $taskList.append($el);
            }

            function _makeTask( $li ){
                $li.$a = $li.find('> a').first();
                $li.$task = $li.$a.find('> .task');
                $li.$title = $li.$task.find('> span').not('.percent').first();
                $li.$percent = $li.$task.find('> span.percent').first();
                $li.$progress = $li.$a.find('> .progress').first();
                $li.$bar = $li.$progress.find('> .progress-bar').first();
                return $li;
            }

            function isOpen(){
                return $taskListContainer.hasClass('open');
            }

            function showTasks(){
                if( !isOpen() ){
                    $taskListContainer.addClass('open');
                    $taskListLink.attr('aria-expanded', 'true');
                }
            }

            function hideTasks(){
                if( isOpen() ){
                    $taskListContainer.removeClass('open');
                    $taskListLink.attr('aria-expanded', 'false');
                }
            }

            function addTask( id, title, percent, href, type, method ){
                if( !defined(href) ){
                    href = '#';
                }
                if( !defined(type) ){
                    type = 'info';
                }
                if( !defined(method) ){
                    method = 'prepend';
                }

                var $li = cre('li').attr('id', 'task_' + id);
                $li.$a = cre('a').attr('href', href);
                $li.$task = cre().addClass('task');
                $li.$title = cre('span').text(title);
                $li.$percent = cre('span').addClass('percent').text(percent + '%');
                $li.$progress = cre().addClass('progress');
                $li.$bar = cre()
                    .attr('role', 'progressbar')
                    .attr('aria-valuenow', percent)
                    .attr('aria-valuemin', 0)
                    .attr('aria-valuemax', 100)
                    .css('width', percent + '%')
                    .addClass('progress-bar progress-bar-' + type);

                if( method === 'prepend' ){
                    _prependTask($li);
                } else {
                    _appendTask($li);
                }

                return $li.append(
                    $li.$a.append(
                        $li.$task.append($li.$title, $li.$percent),
                        $li.$progress.append($li.$bar)
                    )
                );
            }

            function getTask( id ){
                return _makeTask($taskList.find('#task_' + id));
            }

            function _makeEl( $el ){
                if( typeof $el === 'string' ){
                    $el = getTask($el);
                } else if( !defined($el.$a) ){
                    $el = _makeTask($el);
                }
                return $el;
            }

            function setProgress( $el, percent ){
                $el = _makeEl($el);
                $el.$percent.text(percent + '%');
                $el.$bar.attr('aria-valuenow', percent).css('width', percent + '%');
                return $el;
            }

            function setTitle($el, title){
                $el = _makeEl($el);
                $el.$title.text(title);
                return $el;
            }

            function setType($el, type){
                $el = _makeEl($el);
                $el.$bar.removeAttr('class').addClass('progress-bar progress-bar-' + type);
                return $el;
            }

            theme.tasks = {
                add        : addTask,
                show       : showTasks,
                hide       : hideTasks,
                isOpen     : isOpen,
                setProgress: setProgress,
                setType    : setType,
                setTitle   : setTitle,
                get        : getTask
            }

        }.call());


        theme.init = function( options ){
            options = _.isUndefined(options) ? {} : options;
            // console.log('theme.init', options);
            theme.setOptions(options);
            theme.$window = $(window);
            theme.$document = $(window.document);
            console.log('theme', theme);
            theme.initEvents();

            console.log(theme);


            $([
                ".btn:not(.btn-link)",
                ".card-image",
                ".navbar a:not(.withoutripple)",
                ".dropdown-menu a",
                ".nav-tabs a:not(.withoutripple)",
                ".withripple"
            ].join(",")).addClass('withripple').ripples();

            autoloader.detect('form', 'theme/forms', function( forms ){
                forms.init();
            });

            autoloader.detect('#page-svg-logo', 'theme/logo', function( logo ){
                logo.init();
            })

        };

        return theme;
    });
