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
            this.$sidemenu = this.element.closest('aside.sidemenu');
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

                if($this.isClosed()){
                    $this.open(); // maximize width
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

        close: function(){
            if(this.$sidemenu.hasClass('closed')){
                return;
            }
            this.$sidemenu.animate({width:'50px'},'slow', function(){
                this.element.find('a.sidemenu-toggle span.sidemenu-nav-item-icon').removeClass('fa-chevron-left').addClass('fa-chevron-right');
            }.bind(this));
            this.$sidemenu.addClass('closed');
        },

        open: function(){
            this.$sidemenu.animate({width:'250px'},'slow', function(){
                this.$sidemenu.removeClass('closed');
                this.element.find('a.sidemenu-toggle span.sidemenu-nav-item-icon').removeClass('fa-chevron-right').addClass('fa-chevron-left');
            }.bind(this));
        },

        toggle: function(){
            if(this.isClosed()){
                this.open();
            } else {
                this.close();
            }
        },

        isClosed: function(){
            return this.$sidemenu.hasClass('closed');
        },

        createFromJSON: function (json) {
            this._destroy();
            this.element.html('').html(tpls.sidemenu({ items: json }));
            this._create();
        }
    });



}));
