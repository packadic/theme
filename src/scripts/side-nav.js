'use strict';

define(['jquery', 'jquery-ui/widget', '../../tpls/side-nav'], function($){


    function defined( obj ){
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


    $.widget('packadic.sideNav', {
        version: '1.0.0',
        options: {
            toggle            : true,
            doubleTapToGo     : false,
            transitionDuration: 350
        },

        _create : function(){
            var self = this;
            console.log('init sidemenu', this);


            this.transitioning = null;
            var data = self.element.data('sidemenu');
            self.options = _.merge(self.options, data);
            if (!data) {
                self.element.data('mm', (data = self));
            }

            self.$body = $('body');
            self.$navToggle = $('#side-nav-toggle');

            //self.element.find('li').not('.active').has('ul').children('ul').addClass('collapse');

            self.element.find('li').has('ul').children('a').on('click.' + self.widgetName, function (e){
                var $el = $(this);
                var $parent = $el.parent('li');
                var $list = $parent.children('ul');
                e.preventDefault();

                if ($parent.hasClass('active')) {
                    self.hide($list);
                } else {
                    self.show($list);
                }

                $parent.siblings('.active').removeClass('active');
            });

            self.element.find('li.active').parents('ul').each(function(){
                var $el = $(this);
                var $parentLi = $el.parent('li');
                if(!$parentLi.hasClass('active')){
                    //$parentLi.addClass('active');
                }
                $el.addClass('collapse in');
            });

            self.element.find('li').not('.active').has('ul').children('ul').addClass('collapse');
            self.element.find('li.active').has('ul').children('ul').addClass('collapse in');
            self.$navToggle.on('click', function(e){
                e.preventDefault();
                self.toggle();
            });
        },
        _destroy: function(){
            this.element.off("." + this.widgetName);
            this.element.removeData(this.widgetName);
        },

        close: function(){
            if(this.isClosed()){
                return;
            }
            this.$body.addClass('sidebar-closed');
        },

        open: function(){
            this.$body.removeClass('sidebar-closed');
        },

        toggle: function(){
            if(this.isClosed()){
                this.open();
            } else {
                this.close();
            }
        },

        isClosed: function(){
            return this.$body.hasClass('sidebar-closed');
        },

        show: function ($el) {
            var $parent = $el.parent('li');
            if (this.transitioning || $el.hasClass('in')) {
                return;
            }


            $parent.addClass('active');

            if (this.options.toggle) {
                this.hide($parent.siblings().children('ul.in'));
            }

            $el
                .removeClass('collapse')
                .addClass('collapsing')
                .height(0);

            this.transitioning = 1;
            var complete = function () {
                $el
                    .removeClass('collapsing')
                    .addClass('collapse in')
                    .height('');
                this.transitioning = 0;
            }.bind(this);

            if (!$transition) {
                return complete();
            }
            $el
                .one('mmTransitionEnd', $.proxy(complete, this))
                .emulateTransitionEnd(this.options.transitionDuration)
                .height($el[0].scrollHeight);
        },


        hide: function ($el) {
            if (this.transitioning || !$el.hasClass('in')) {
                return;
            }


            $el.parent('li').removeClass('active');
            $el.height($el.height())[0].offsetHeight;

            $el
                .addClass('collapsing')
                .removeClass('collapse')
                .removeClass('in');

            this.transitioning = 1;

            var complete = function () {
                this.transitioning = 0;
                $el
                    .removeClass('collapsing')
                    .addClass('collapse');
            }.bind(this);

            if (!$transition) {
                return complete();
            }
            $el
                .height(0)
                .one('mmTransitionEnd', $.proxy(complete, this))
                .emulateTransitionEnd(this.options.transitionDuration);
        },


        createFromJSON: function (json) {
            this._destroy();
            var html = Packadic.getTemplate('side-nav', { items: json, location: window.location });
            this.element.html('').html(html);
            this._create();
        }
    });


});
