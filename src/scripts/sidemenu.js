(function (factory) {
    factory(jQuery, _, window);
}(function ($, _, window) {
    'use strict';

    function defined(obj){
        return typeof obj !== 'undefined';
    }

    function transitionEnd() {
        var el = document.createElement('mm');

        var transEndEventNames = {
            WebkitTransition: 'webkitTransitionEnd',
            MozTransition: 'transitionend',
            OTransition: 'oTransitionEnd otransitionend',
            transition: 'transitionend'
        };

        for (var name in transEndEventNames) {
            if (el.style[name] !== undefined) {
                return {
                    end: transEndEventNames[name]
                };
            }
        }
        return false;
    }

    $.fn.emulateTransitionEnd = function (duration) {
        var called = false;
        var $el = this;
        $(this).one('mmTransitionEnd', function () {
            called = true;
        });
        var callback = function () {
            if (!called) {
                $($el).trigger($transition.end);
            }
        };
        setTimeout(callback, duration);
        return this;
    };

    var $transition = transitionEnd();
    if (!!$transition) {
        $.event.special.mmTransitionEnd = {
            bindType: $transition.end,
            delegateType: $transition.end,
            handle: function (e) {
                if ($(e.target).is(this)) {
                    return e.handleObj.handler.apply(this, arguments);
                }
            }
        };
    }


    $.widget('packadic.sideMenu', {
        version: '1.0.0',
        options: {
            toggle: true,
            doubleTapToGo: false,
            transitionDuration: 350
        },

        _create: function () {
            console.log('init sidemenu', this);
            this.transitioning = null;

            var $this = this;
            var data = this.element.data('sidemenu');
            this.options = _.merge(this.options, data);
            if (!data) {
                this.element.data('mm', (data = this));
            }

            this.element.find('li.active').has('ul').children('ul').addClass('collapse in');
            this.element.find('li').not('.active').has('ul').children('ul').addClass('collapse');

            //add the 'doubleTapToGo' class to active items if needed
            if (this.options.doubleTapToGo) {
                this.element.find('li.active').has('ul').children('a').addClass('doubleTapToGo');
            }

            this.element.find('li').has('ul').children('a').on('click.' + this.widgetName, function (e) {
                var self = $(this);
                var $parent = self.parent('li');
                var $list = $parent.children('ul');
                e.preventDefault();

                if ($parent.hasClass('active')) {
                    $this.hide($list);
                } else {
                    $this.show($list);
                }

                //Do we need to enable the double tap
                if ($this.options.doubleTapToGo) {
                    //if we hit a second time on the link and the href is valid, navigate to that url
                    if ($this.doubleTapToGo(self) && self.attr('href') !== '#' && self.attr('href') !== '') {
                        e.stopPropagation();
                        document.location = self.attr('href');
                        return;
                    }
                }
            });
        },
        _destroy: function () {
            this.element.off("." + this.widgetName);
            this.element.removeData(this.widgetName);
        },
        _doubleTapToGo: function (elem) {
            var $this = this.element;

            //if the class 'doubleTapToGo' exists, remove it and return
            if (elem.hasClass('doubleTapToGo')) {
                elem.removeClass('doubleTapToGo');
                return true;
            }
            //does not exists, add a new class and return false
            if (elem.parent().children('ul').length) {
                //first remove all other class
                $this.find('.doubleTapToGo').removeClass('doubleTapToGo');
                //add the class on the current element
                elem.addClass('doubleTapToGo');
                return false;
            }
        },

        show: function (el) {
            var $this = $(el);
            var $parent = $this.parent('li');
            if (this.transitioning || $this.hasClass('in')) {
                return;
            }


            $parent.addClass('active');

            if (this.options.toggle) {
                this.hide($parent.siblings().children('ul.in'));
            }

            $this
                .removeClass('collapse')
                .addClass('collapsing')
                .height(0);

            this.transitioning = 1;
            var complete = function () {
                $this
                    .removeClass('collapsing')
                    .addClass('collapse in')
                    .height('');
                this.transitioning = 0;
            };
            if (!$transition) {
                return complete.call(this);
            }
            $this
                .one('mmTransitionEnd', $.proxy(complete, this))
                .emulateTransitionEnd(this.options.transitionDuration)
                .height($this[0].scrollHeight);
        },

        hide: function (el) {
            var $this = $(el);

            if (this.transitioning || !$this.hasClass('in')) {
                return;
            }


            $this.parent('li').removeClass('active');
            $this.height($this.height())[0].offsetHeight;

            $this
                .addClass('collapsing')
                .removeClass('collapse')
                .removeClass('in');

            this.transitioning = 1;

            var complete = function () {
                this.transitioning = 0;
                $this
                    .removeClass('collapsing')
                    .addClass('collapse');
            };

            if (!$transition) {
                return complete.call(this);
            }
            $this
                .height(0)
                .one('mmTransitionEnd', $.proxy(complete, this))
                .emulateTransitionEnd(this.options.transitionDuration);
        },

        createFromJSON: function (json) {
            function createEl(tag) {
                return $(document.createElement(tag));
            }

            function loopItems(items, $parentUl, level) {
                $parentUl.attr('data-level', level);
                $.each(items, function (key, item) {
                    // LI
                    var $li = createEl('li');
                    if(defined(item.default) && item.default){
                        $li.addClass('active');
                    }

                    // A
                    var $a = createEl('a').attr('href', defined(item.href) ? item.href : '#');

                    // A>span.icon
                    if(defined(item.icon)) {
                        $a.append(createEl('span').addClass('sidemenu-nav-item-icon fa ' + item.icon));
                        $a.append(createEl('span').addClass('sidemenu-nav-item').text(item.name));
                    } else {
                        $a.append(item.name);
                    }

                    if(defined(item.children)){
                        $a.append(createEl('span').addClass('fa arrow'));
                    }

                    $li.append($a);
                    $parentUl.append($li);

                    if(defined(item.children)){
                        var $ul = createEl('ul');
                        $li.append($ul);
                        loopItems(item.children, $ul, level + 1);
                    }
                });
            }
            this._destroy();
            this.element.html('');
            loopItems(json, this.element, 0);
            this._create();
        }
    });



}));
