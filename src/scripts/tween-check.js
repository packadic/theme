define(['jquery'], function($){
    function check() {
// hack to make slideUp and slideDown work with animate, so it uses GSAP
        if (typeof TweenLite !== 'undefined' || typeof TweenMax !== 'undefined') {
            var slideAnimation = function (type, speed, cb) {
                if (typeof cb !== 'function') {
                    cb = function () {
                    };
                }
                var margin = function (what) {
                    parseInt(sub.css('margin-' + what).replace('px', ''))
                };
                var attrs = {
                    height: type
                };
                for (var i = 0; i < 4; i += 2) {
                    var which = ["Top", "Right", "Bottom", "Left"][i];
                    attrs["margin" + which] = attrs["padding" + which] = type;
                }
                attrs.easing = "easeOutStrong";
                return this.animate(attrs, speed).animate({overflow: 'visible'}, {duration: 0, complete: cb});
            };
            $.fn.slideUp = function (speed, cb) {
                slideAnimation.apply(this, ['hide', speed, cb]);
            };
            $.fn.slideDown = function (speed, cb) {
                slideAnimation.apply(this, ['show', speed, cb]);
            };
        }
        // endhack
    }

    return {
        check: check
    }
});
