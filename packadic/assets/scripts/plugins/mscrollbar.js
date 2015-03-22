/*
== malihu jquery custom scrollbar plugin == 
Version: 3.0.7 
Plugin URI: http://manos.malihu.gr/jquery-custom-content-scroller 
Author: malihu
Author URI: http://manos.malihu.gr
License: MIT License (MIT)
*/
/*
Copyright 2010 Manos Malihutsakis (email: manos@malihu.gr)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/
/*
The code below is fairly long, fully commented and should be normally used in development. 
For production, use either the minified jquery.mCustomScrollbar.min.js script or 
the production-ready jquery.mCustomScrollbar.concat.min.js which contains the plugin 
and dependencies (minified). 
*/
(function(a, b, c) {
    (function(b) {
        var d = typeof define === "function" && define.amd, /* RequireJS */
        e = "https:" == c.location.protocol ? "https:" : "http:", /* location protocol */
        f = "cdnjs.cloudflare.com/ajax/libs/jquery-mousewheel/3.1.12/jquery.mousewheel.min.js";
        if (!d) {
            /* load jquery-mousewheel plugin (via CDN) if it's not present or not loaded via RequireJS 
		(works when mCustomScrollbar fn is called on window load) */
            a.event.special.mousewheel || a("head").append(decodeURI("%3Cscript src=" + e + "//" + f + "%3E%3C/script%3E"));
        }
        b();
    })(function() {
        /* 
	----------------------------------------
	PLUGIN NAMESPACE, PREFIX, DEFAULT SELECTOR(S) 
	----------------------------------------
	*/
        var d = "mCustomScrollbar", e = "mCS", f = ".mCustomScrollbar", /* 
	----------------------------------------
	DEFAULT OPTIONS 
	----------------------------------------
	*/
        g = {
            /*
			set element/content width/height programmatically 
			values: boolean, pixels, percentage 
				option						default
				-------------------------------------
				setWidth					false
				setHeight					false
			*/
            /*
			set the initial css top property of content  
			values: string (e.g. "-100px", "10%" etc.)
			*/
            setTop: 0,
            /*
			set the initial css left property of content  
			values: string (e.g. "-100px", "10%" etc.)
			*/
            setLeft: 0,
            /* 
			scrollbar axis (vertical and/or horizontal scrollbars) 
			values (string): "y", "x", "yx"
			*/
            axis: "y",
            /*
			position of scrollbar relative to content  
			values (string): "inside", "outside" ("outside" requires elements with position:relative)
			*/
            scrollbarPosition: "inside",
            /*
			scrolling inertia
			values: integer (milliseconds)
			*/
            scrollInertia: 950,
            /* 
			auto-adjust scrollbar dragger length
			values: boolean
			*/
            autoDraggerLength: true,
            /*
			auto-hide scrollbar when idle 
			values: boolean
				option						default
				-------------------------------------
				autoHideScrollbar			false
			*/
            /*
			auto-expands scrollbar on mouse-over and dragging
			values: boolean
				option						default
				-------------------------------------
				autoExpandScrollbar			false
			*/
            /*
			always show scrollbar, even when there's nothing to scroll 
			values: integer (0=disable, 1=always show dragger rail and buttons, 2=always show dragger rail, dragger and buttons), boolean
			*/
            alwaysShowScrollbar: 0,
            /*
			scrolling always snaps to a multiple of this number in pixels
			values: integer
				option						default
				-------------------------------------
				snapAmount					null
			*/
            /*
			when snapping, snap with this number in pixels as an offset 
			values: integer
			*/
            snapOffset: 0,
            /* 
			mouse-wheel scrolling
			*/
            mouseWheel: {
                /* 
				enable mouse-wheel scrolling
				values: boolean
				*/
                enable: true,
                /* 
				scrolling amount in pixels
				values: "auto", integer 
				*/
                scrollAmount: "auto",
                /* 
				mouse-wheel scrolling axis 
				the default scrolling direction when both vertical and horizontal scrollbars are present 
				values (string): "y", "x" 
				*/
                axis: "y",
                /* 
				prevent the default behaviour which automatically scrolls the parent element(s) when end of scrolling is reached 
				values: boolean
					option						default
					-------------------------------------
					preventDefault				null
				*/
                /*
				the reported mouse-wheel delta value. The number of lines (translated to pixels) one wheel notch scrolls.  
				values: "auto", integer 
				"auto" uses the default OS/browser value 
				*/
                deltaFactor: "auto",
                /*
				normalize mouse-wheel delta to -1 or 1 (disables mouse-wheel acceleration) 
				values: boolean
					option						default
					-------------------------------------
					normalizeDelta				null
				*/
                /*
				invert mouse-wheel scrolling direction 
				values: boolean
					option						default
					-------------------------------------
					invert						null
				*/
                /*
				the tags that disable mouse-wheel when cursor is over them
				*/
                disableOver: [ "select", "option", "keygen", "datalist", "textarea" ]
            },
            /* 
			scrollbar buttons
			*/
            scrollButtons: {
                /*
				enable scrollbar buttons
				values: boolean
					option						default
					-------------------------------------
					enable						null
				*/
                /*
				scrollbar buttons scrolling type 
				values (string): "stepless", "stepped"
				*/
                scrollType: "stepless",
                /*
				scrolling amount in pixels
				values: "auto", integer 
				*/
                scrollAmount: "auto"
            },
            /* 
			keyboard scrolling
			*/
            keyboard: {
                /*
				enable scrolling via keyboard
				values: boolean
				*/
                enable: true,
                /*
				keyboard scrolling type 
				values (string): "stepless", "stepped"
				*/
                scrollType: "stepless",
                /*
				scrolling amount in pixels
				values: "auto", integer 
				*/
                scrollAmount: "auto"
            },
            /*
			enable content touch-swipe scrolling 
			values: boolean, integer, string (number)
			integer values define the axis-specific minimum amount required for scrolling momentum
			*/
            contentTouchScroll: 25,
            /*
			advanced option parameters
			*/
            advanced: {
                /*
				auto-expand content horizontally (for "x" or "yx" axis) 
				values: boolean
					option						default
					-------------------------------------
					autoExpandHorizontalScroll	null
				*/
                /*
				auto-scroll to elements with focus
				*/
                autoScrollOnFocus: "input,textarea,select,button,datalist,keygen,a[tabindex],area,object,[contenteditable='true']",
                /*
				auto-update scrollbars on content, element or viewport resize 
				should be true for fluid layouts/elements, adding/removing content dynamically, hiding/showing elements, content with images etc. 
				values: boolean
				*/
                updateOnContentResize: true,
                /*
				auto-update scrollbars each time each image inside the element is fully loaded 
				values: boolean
				*/
                updateOnImageLoad: true
            },
            /* 
			scrollbar theme 
			values: string (see CSS/plugin URI for a list of ready-to-use themes)
			*/
            theme: "light",
            /*
			user defined callback functions
			*/
            callbacks: {
                /*
				Available callbacks: 
					callback					default
					-------------------------------------
					onInit						null
					onScrollStart				null
					onScroll					null
					onTotalScroll				null
					onTotalScrollBack			null
					whileScrolling				null
					onOverflowY					null
					onOverflowX					null
					onOverflowYNone				null
					onOverflowXNone				null
					onImageLoad					null
					onSelectorChange			null
					onUpdate					null
				*/
                onTotalScrollOffset: 0,
                onTotalScrollBackOffset: 0,
                alwaysTriggerOffsets: true
            }
        }, /* 
	----------------------------------------
	VARS, CONSTANTS 
	----------------------------------------
	*/
        h = 0, /* plugin instances amount */
        i = {}, /* live option timers */
        j = b.attachEvent && !b.addEventListener ? 1 : 0, /* detect IE < 9 */
        k = false, l, /* global touch vars (for touch and pointer events) */
        /* general plugin classes */
        m = [ "mCSB_dragger_onDrag", "mCSB_scrollTools_onDrag", "mCS_img_loaded", "mCS_disabled", "mCS_destroyed", "mCS_no_scrollbar", "mCS-autoHide", "mCS-dir-rtl", "mCS_no_scrollbar_y", "mCS_no_scrollbar_x", "mCS_y_hidden", "mCS_x_hidden", "mCSB_draggerContainer", "mCSB_buttonUp", "mCSB_buttonDown", "mCSB_buttonLeft", "mCSB_buttonRight" ], /* 
	----------------------------------------
	METHODS 
	----------------------------------------
	*/
        n = {
            /* 
			plugin initialization method 
			creates the scrollbar(s), plugin data object and options
			----------------------------------------
			*/
            init: function(b) {
                var b = a.extend(true, {}, g, b), c = o.call(this);
                /* validate selector */
                /* 
				if live option is enabled, monitor for elements matching the current selector and 
				apply scrollbar(s) when found (now and in the future) 
				*/
                if (b.live) {
                    var d = b.liveSelector || this.selector || f, /* live selector(s) */
                    j = a(d);
                    /* live selector(s) as jquery object */
                    if (b.live === "off") {
                        /* 
						disable live if requested 
						usage: $(selector).mCustomScrollbar({live:"off"}); 
						*/
                        q(d);
                        return;
                    }
                    i[d] = setTimeout(function() {
                        /* call mCustomScrollbar fn on live selector(s) every half-second */
                        j.mCustomScrollbar(b);
                        if (b.live === "once" && j.length) {
                            /* disable live after first invocation */
                            q(d);
                        }
                    }, 500);
                } else {
                    q(d);
                }
                /* options backward compatibility (for versions < 3.0.0) and normalization */
                b.setWidth = b.set_width ? b.set_width : b.setWidth;
                b.setHeight = b.set_height ? b.set_height : b.setHeight;
                b.axis = b.horizontalScroll ? "x" : r(b.axis);
                b.scrollInertia = b.scrollInertia > 0 && b.scrollInertia < 17 ? 17 : b.scrollInertia;
                if (typeof b.mouseWheel !== "object" && b.mouseWheel == true) {
                    /* old school mouseWheel option (non-object) */
                    b.mouseWheel = {
                        enable: true,
                        scrollAmount: "auto",
                        axis: "y",
                        preventDefault: false,
                        deltaFactor: "auto",
                        normalizeDelta: false,
                        invert: false
                    };
                }
                b.mouseWheel.scrollAmount = !b.mouseWheelPixels ? b.mouseWheel.scrollAmount : b.mouseWheelPixels;
                b.mouseWheel.normalizeDelta = !b.advanced.normalizeMouseWheelDelta ? b.mouseWheel.normalizeDelta : b.advanced.normalizeMouseWheelDelta;
                b.scrollButtons.scrollType = s(b.scrollButtons.scrollType);
                p(b);
                /* theme-specific options */
                /* plugin constructor */
                return a(c).each(function() {
                    var c = a(this);
                    if (!c.data(e)) {
                        /* prevent multiple instantiations */
                        /* store options and create objects in jquery data */
                        c.data(e, {
                            idx: ++h,
                            /* instance index */
                            opt: b,
                            /* options */
                            scrollRatio: {
                                y: null,
                                x: null
                            },
                            /* scrollbar to content ratio */
                            overflowed: null,
                            /* overflowed axis */
                            contentReset: {
                                y: null,
                                x: null
                            },
                            /* object to check when content resets */
                            bindEvents: false,
                            /* object to check if events are bound */
                            tweenRunning: false,
                            /* object to check if tween is running */
                            sequential: {},
                            /* sequential scrolling object */
                            langDir: c.css("direction"),
                            /* detect/store direction (ltr or rtl) */
                            cbOffsets: null,
                            /* object to check whether callback offsets always trigger */
                            /* 
							object to check how scrolling events where last triggered 
							"internal" (default - triggered by this script), "external" (triggered by other scripts, e.g. via scrollTo method) 
							usage: object.data("mCS").trigger
							*/
                            trigger: null
                        });
                        var d = c.data(e), f = d.opt, /* HTML data attributes */
                        g = c.data("mcs-axis"), i = c.data("mcs-scrollbar-position"), j = c.data("mcs-theme");
                        if (g) {
                            f.axis = g;
                        }
                        /* usage example: data-mcs-axis="y" */
                        if (i) {
                            f.scrollbarPosition = i;
                        }
                        /* usage example: data-mcs-scrollbar-position="outside" */
                        if (j) {
                            /* usage example: data-mcs-theme="minimal" */
                            f.theme = j;
                            p(f);
                        }
                        t.call(this);
                        /* add plugin markup */
                        a("#mCSB_" + d.idx + "_container img:not(." + m[2] + ")").addClass(m[2]);
                        /* flag loaded images */
                        n.update.call(null, c);
                    }
                });
            },
            /* ---------------------------------------- */
            /* 
			plugin update method 
			updates content and scrollbar(s) values, events and status 
			----------------------------------------
			usage: $(selector).mCustomScrollbar("update");
			*/
            update: function(b, c) {
                var d = b || o.call(this);
                /* validate selector */
                return a(d).each(function() {
                    var b = a(this);
                    if (b.data(e)) {
                        /* check if plugin has initialized */
                        var d = b.data(e), f = d.opt, g = a("#mCSB_" + d.idx + "_container"), h = [ a("#mCSB_" + d.idx + "_dragger_vertical"), a("#mCSB_" + d.idx + "_dragger_horizontal") ];
                        if (!g.length) {
                            return;
                        }
                        if (d.tweenRunning) {
                            W(b);
                        }
                        /* stop any running tweens while updating */
                        /* if element was disabled or destroyed, remove class(es) */
                        if (b.hasClass(m[3])) {
                            b.removeClass(m[3]);
                        }
                        if (b.hasClass(m[4])) {
                            b.removeClass(m[4]);
                        }
                        x.call(this);
                        /* detect/set css max-height value */
                        v.call(this);
                        /* expand content horizontally */
                        if (f.axis !== "y" && !f.advanced.autoExpandHorizontalScroll) {
                            g.css("width", u(g.children()));
                        }
                        d.overflowed = B.call(this);
                        /* determine if scrolling is required */
                        F.call(this);
                        /* show/hide scrollbar(s) */
                        /* auto-adjust scrollbar dragger length analogous to content */
                        if (f.autoDraggerLength) {
                            y.call(this);
                        }
                        z.call(this);
                        /* calculate and store scrollbar to content ratio */
                        D.call(this);
                        /* bind scrollbar events */
                        /* reset scrolling position and/or events */
                        var i = [ Math.abs(g[0].offsetTop), Math.abs(g[0].offsetLeft) ];
                        if (f.axis !== "x") {
                            /* y/yx axis */
                            if (!d.overflowed[0]) {
                                /* y scrolling is not required */
                                C.call(this);
                                /* reset content position */
                                if (f.axis === "y") {
                                    E.call(this);
                                } else if (f.axis === "yx" && d.overflowed[1]) {
                                    X(b, i[1].toString(), {
                                        dir: "x",
                                        dur: 0,
                                        overwrite: "none"
                                    });
                                }
                            } else if (h[0].height() > h[0].parent().height()) {
                                C.call(this);
                            } else {
                                /* y scrolling is required */
                                X(b, i[0].toString(), {
                                    dir: "y",
                                    dur: 0,
                                    overwrite: "none"
                                });
                                d.contentReset.y = null;
                            }
                        }
                        if (f.axis !== "y") {
                            /* x/yx axis */
                            if (!d.overflowed[1]) {
                                /* x scrolling is not required */
                                C.call(this);
                                /* reset content position */
                                if (f.axis === "x") {
                                    E.call(this);
                                } else if (f.axis === "yx" && d.overflowed[0]) {
                                    X(b, i[0].toString(), {
                                        dir: "y",
                                        dur: 0,
                                        overwrite: "none"
                                    });
                                }
                            } else if (h[1].width() > h[1].parent().width()) {
                                C.call(this);
                            } else {
                                /* x scrolling is required */
                                X(b, i[1].toString(), {
                                    dir: "x",
                                    dur: 0,
                                    overwrite: "none"
                                });
                                d.contentReset.x = null;
                            }
                        }
                        /* callbacks: onImageLoad, onSelectorChange, onUpdate */
                        if (c && d) {
                            if (c === 2 && f.callbacks.onImageLoad && typeof f.callbacks.onImageLoad === "function") {
                                f.callbacks.onImageLoad.call(this);
                            } else if (c === 3 && f.callbacks.onSelectorChange && typeof f.callbacks.onSelectorChange === "function") {
                                f.callbacks.onSelectorChange.call(this);
                            } else if (f.callbacks.onUpdate && typeof f.callbacks.onUpdate === "function") {
                                f.callbacks.onUpdate.call(this);
                            }
                        }
                        U.call(this);
                    }
                });
            },
            /* ---------------------------------------- */
            /* 
			plugin scrollTo method 
			triggers a scrolling event to a specific value
			----------------------------------------
			usage: $(selector).mCustomScrollbar("scrollTo",value,options);
			*/
            scrollTo: function(b, c) {
                /* prevent silly things like $(selector).mCustomScrollbar("scrollTo",undefined); */
                if (typeof b == "undefined" || b == null) {
                    return;
                }
                var d = o.call(this);
                /* validate selector */
                return a(d).each(function() {
                    var d = a(this);
                    if (d.data(e)) {
                        /* check if plugin has initialized */
                        var f = d.data(e), g = f.opt, /* method default options */
                        h = {
                            trigger: "external",
                            /* method is by default triggered externally (e.g. from other scripts) */
                            scrollInertia: g.scrollInertia,
                            /* scrolling inertia (animation duration) */
                            scrollEasing: "mcsEaseInOut",
                            /* animation easing */
                            moveDragger: false,
                            /* move dragger instead of content */
                            timeout: 60,
                            /* scroll-to delay */
                            callbacks: true,
                            /* enable/disable callbacks */
                            onStart: true,
                            onUpdate: true,
                            onComplete: true
                        }, i = a.extend(true, {}, h, c), j = S.call(this, b), k = i.scrollInertia > 0 && i.scrollInertia < 17 ? 17 : i.scrollInertia;
                        /* translate yx values to actual scroll-to positions */
                        j[0] = T.call(this, j[0], "y");
                        j[1] = T.call(this, j[1], "x");
                        /* 
						check if scroll-to value moves the dragger instead of content. 
						Only pixel values apply on dragger (e.g. 100, "100px", "-=100" etc.) 
						*/
                        if (i.moveDragger) {
                            j[0] *= f.scrollRatio.y;
                            j[1] *= f.scrollRatio.x;
                        }
                        i.dur = k;
                        setTimeout(function() {
                            /* do the scrolling */
                            if (j[0] !== null && typeof j[0] !== "undefined" && g.axis !== "x" && f.overflowed[0]) {
                                /* scroll y */
                                i.dir = "y";
                                i.overwrite = "all";
                                X(d, j[0].toString(), i);
                            }
                            if (j[1] !== null && typeof j[1] !== "undefined" && g.axis !== "y" && f.overflowed[1]) {
                                /* scroll x */
                                i.dir = "x";
                                i.overwrite = "none";
                                X(d, j[1].toString(), i);
                            }
                        }, i.timeout);
                    }
                });
            },
            /* ---------------------------------------- */
            /*
			plugin stop method 
			stops scrolling animation
			----------------------------------------
			usage: $(selector).mCustomScrollbar("stop");
			*/
            stop: function() {
                var b = o.call(this);
                /* validate selector */
                return a(b).each(function() {
                    var b = a(this);
                    if (b.data(e)) {
                        /* check if plugin has initialized */
                        W(b);
                    }
                });
            },
            /* ---------------------------------------- */
            /*
			plugin disable method 
			temporarily disables the scrollbar(s) 
			----------------------------------------
			usage: $(selector).mCustomScrollbar("disable",reset); 
			reset (boolean): resets content position to 0 
			*/
            disable: function(b) {
                var c = o.call(this);
                /* validate selector */
                return a(c).each(function() {
                    var c = a(this);
                    if (c.data(e)) {
                        /* check if plugin has initialized */
                        var d = c.data(e);
                        U.call(this, "remove");
                        /* remove automatic updating */
                        E.call(this);
                        /* unbind events */
                        if (b) {
                            C.call(this);
                        }
                        /* reset content position */
                        F.call(this, true);
                        /* show/hide scrollbar(s) */
                        c.addClass(m[3]);
                    }
                });
            },
            /* ---------------------------------------- */
            /*
			plugin destroy method 
			completely removes the scrollbar(s) and returns the element to its original state
			----------------------------------------
			usage: $(selector).mCustomScrollbar("destroy"); 
			*/
            destroy: function() {
                var b = o.call(this);
                /* validate selector */
                return a(b).each(function() {
                    var c = a(this);
                    if (c.data(e)) {
                        /* check if plugin has initialized */
                        var f = c.data(e), g = f.opt, h = a("#mCSB_" + f.idx), i = a("#mCSB_" + f.idx + "_container"), j = a(".mCSB_" + f.idx + "_scrollbar");
                        if (g.live) {
                            q(g.liveSelector || a(b).selector);
                        }
                        /* remove live timers */
                        U.call(this, "remove");
                        /* remove automatic updating */
                        E.call(this);
                        /* unbind events */
                        C.call(this);
                        /* reset content position */
                        c.removeData(e);
                        /* remove plugin data object */
                        _(this, "mcs");
                        /* delete callbacks object */
                        /* remove plugin markup */
                        j.remove();
                        /* remove scrollbar(s) first (those can be either inside or outside plugin's inner wrapper) */
                        i.find("img." + m[2]).removeClass(m[2]);
                        /* remove loaded images flag */
                        h.replaceWith(i.contents());
                        /* replace plugin's inner wrapper with the original content */
                        /* remove plugin classes from the element and add destroy class */
                        c.removeClass(d + " _" + e + "_" + f.idx + " " + m[6] + " " + m[7] + " " + m[5] + " " + m[3]).addClass(m[4]);
                    }
                });
            }
        }, /* 
	----------------------------------------
	FUNCTIONS
	----------------------------------------
	*/
        /* validates selector (if selector is invalid or undefined uses the default one) */
        o = function() {
            return typeof a(this) !== "object" || a(this).length < 1 ? f : this;
        }, /* -------------------- */
        /* changes options according to theme */
        p = function(b) {
            var c = [ "rounded", "rounded-dark", "rounded-dots", "rounded-dots-dark" ], d = [ "rounded-dots", "rounded-dots-dark", "3d", "3d-dark", "3d-thick", "3d-thick-dark", "inset", "inset-dark", "inset-2", "inset-2-dark", "inset-3", "inset-3-dark" ], e = [ "minimal", "minimal-dark" ], f = [ "minimal", "minimal-dark" ], g = [ "minimal", "minimal-dark" ];
            b.autoDraggerLength = a.inArray(b.theme, c) > -1 ? false : b.autoDraggerLength;
            b.autoExpandScrollbar = a.inArray(b.theme, d) > -1 ? false : b.autoExpandScrollbar;
            b.scrollButtons.enable = a.inArray(b.theme, e) > -1 ? false : b.scrollButtons.enable;
            b.autoHideScrollbar = a.inArray(b.theme, f) > -1 ? true : b.autoHideScrollbar;
            b.scrollbarPosition = a.inArray(b.theme, g) > -1 ? "outside" : b.scrollbarPosition;
        }, /* -------------------- */
        /* live option timers removal */
        q = function(a) {
            if (i[a]) {
                clearTimeout(i[a]);
                _(i, a);
            }
        }, /* -------------------- */
        /* normalizes axis option to valid values: "y", "x", "yx" */
        r = function(a) {
            return a === "yx" || a === "xy" || a === "auto" ? "yx" : a === "x" || a === "horizontal" ? "x" : "y";
        }, /* -------------------- */
        /* normalizes scrollButtons.scrollType option to valid values: "stepless", "stepped" */
        s = function(a) {
            return a === "stepped" || a === "pixels" || a === "step" || a === "click" ? "stepped" : "stepless";
        }, /* -------------------- */
        /* generates plugin markup */
        t = function() {
            var b = a(this), c = b.data(e), f = c.opt, g = f.autoExpandScrollbar ? " " + m[1] + "_expand" : "", h = [ "<div id='mCSB_" + c.idx + "_scrollbar_vertical' class='mCSB_scrollTools mCSB_" + c.idx + "_scrollbar mCS-" + f.theme + " mCSB_scrollTools_vertical" + g + "'><div class='" + m[12] + "'><div id='mCSB_" + c.idx + "_dragger_vertical' class='mCSB_dragger' style='position:absolute;' oncontextmenu='return false;'><div class='mCSB_dragger_bar' /></div><div class='mCSB_draggerRail' /></div></div>", "<div id='mCSB_" + c.idx + "_scrollbar_horizontal' class='mCSB_scrollTools mCSB_" + c.idx + "_scrollbar mCS-" + f.theme + " mCSB_scrollTools_horizontal" + g + "'><div class='" + m[12] + "'><div id='mCSB_" + c.idx + "_dragger_horizontal' class='mCSB_dragger' style='position:absolute;' oncontextmenu='return false;'><div class='mCSB_dragger_bar' /></div><div class='mCSB_draggerRail' /></div></div>" ], i = f.axis === "yx" ? "mCSB_vertical_horizontal" : f.axis === "x" ? "mCSB_horizontal" : "mCSB_vertical", j = f.axis === "yx" ? h[0] + h[1] : f.axis === "x" ? h[1] : h[0], k = f.axis === "yx" ? "<div id='mCSB_" + c.idx + "_container_wrapper' class='mCSB_container_wrapper' />" : "", l = f.autoHideScrollbar ? " " + m[6] : "", n = f.axis !== "x" && c.langDir === "rtl" ? " " + m[7] : "";
            if (f.setWidth) {
                b.css("width", f.setWidth);
            }
            /* set element width */
            if (f.setHeight) {
                b.css("height", f.setHeight);
            }
            /* set element height */
            f.setLeft = f.axis !== "y" && c.langDir === "rtl" ? "989999px" : f.setLeft;
            /* adjust left position for rtl direction */
            b.addClass(d + " _" + e + "_" + c.idx + l + n).wrapInner("<div id='mCSB_" + c.idx + "' class='mCustomScrollBox mCS-" + f.theme + " " + i + "'><div id='mCSB_" + c.idx + "_container' class='mCSB_container' style='position:relative; top:" + f.setTop + "; left:" + f.setLeft + ";' dir=" + c.langDir + " /></div>");
            var o = a("#mCSB_" + c.idx), p = a("#mCSB_" + c.idx + "_container");
            if (f.axis !== "y" && !f.advanced.autoExpandHorizontalScroll) {
                p.css("width", u(p.children()));
            }
            if (f.scrollbarPosition === "outside") {
                if (b.css("position") === "static") {
                    /* requires elements with non-static position */
                    b.css("position", "relative");
                }
                b.css("overflow", "visible");
                o.addClass("mCSB_outside").after(j);
            } else {
                o.addClass("mCSB_inside").append(j);
                p.wrap(k);
            }
            w.call(this);
            /* add scrollbar buttons */
            /* minimum dragger length */
            var q = [ a("#mCSB_" + c.idx + "_dragger_vertical"), a("#mCSB_" + c.idx + "_dragger_horizontal") ];
            q[0].css("min-height", q[0].height());
            q[1].css("min-width", q[1].width());
        }, /* -------------------- */
        /* calculates content width */
        u = function(b) {
            return Math.max.apply(Math, b.map(function() {
                return a(this).outerWidth(true);
            }).get());
        }, /* -------------------- */
        /* expands content horizontally */
        v = function() {
            var b = a(this), c = b.data(e), d = c.opt, f = a("#mCSB_" + c.idx + "_container");
            if (d.advanced.autoExpandHorizontalScroll && d.axis !== "y") {
                /* 
				wrap content with an infinite width div and set its position to absolute and width to auto. 
				Setting width to auto before calculating the actual width is important! 
				We must let the browser set the width as browser zoom values are impossible to calculate.
				*/
                f.css({
                    position: "absolute",
                    width: "auto"
                }).wrap("<div class='mCSB_h_wrapper' style='position:relative; left:0; width:999999px;' />").css({
                    /* set actual width, original position and un-wrap */
                    /* 
						get the exact width (with decimals) and then round-up. 
						Using jquery outerWidth() will round the width value which will mess up with inner elements that have non-integer width
						*/
                    width: Math.ceil(f[0].getBoundingClientRect().right + .4) - Math.floor(f[0].getBoundingClientRect().left),
                    position: "relative"
                }).unwrap();
            }
        }, /* -------------------- */
        /* adds scrollbar buttons */
        w = function() {
            var b = a(this), c = b.data(e), d = c.opt, f = a(".mCSB_" + c.idx + "_scrollbar:first"), g = !cb(d.scrollButtons.tabindex) ? "" : "tabindex='" + d.scrollButtons.tabindex + "'", h = [ "<a href='#' class='" + m[13] + "' oncontextmenu='return false;' " + g + " />", "<a href='#' class='" + m[14] + "' oncontextmenu='return false;' " + g + " />", "<a href='#' class='" + m[15] + "' oncontextmenu='return false;' " + g + " />", "<a href='#' class='" + m[16] + "' oncontextmenu='return false;' " + g + " />" ], i = [ d.axis === "x" ? h[2] : h[0], d.axis === "x" ? h[3] : h[1], h[2], h[3] ];
            if (d.scrollButtons.enable) {
                f.prepend(i[0]).append(i[1]).next(".mCSB_scrollTools").prepend(i[2]).append(i[3]);
            }
        }, /* -------------------- */
        /* detects/sets css max-height value */
        x = function() {
            var b = a(this), c = b.data(e), d = a("#mCSB_" + c.idx), f = b.css("max-height") || "none", g = f.indexOf("%") !== -1, h = b.css("box-sizing");
            if (f !== "none") {
                var i = g ? b.parent().height() * parseInt(f) / 100 : parseInt(f);
                /* if element's css box-sizing is "border-box", subtract any paddings and/or borders from max-height value */
                if (h === "border-box") {
                    i -= b.innerHeight() - b.height() + (b.outerHeight() - b.innerHeight());
                }
                d.css("max-height", Math.round(i));
            }
        }, /* -------------------- */
        /* auto-adjusts scrollbar dragger length */
        y = function() {
            var b = a(this), c = b.data(e), d = a("#mCSB_" + c.idx), f = a("#mCSB_" + c.idx + "_container"), g = [ a("#mCSB_" + c.idx + "_dragger_vertical"), a("#mCSB_" + c.idx + "_dragger_horizontal") ], h = [ d.height() / f.outerHeight(false), d.width() / f.outerWidth(false) ], i = [ parseInt(g[0].css("min-height")), Math.round(h[0] * g[0].parent().height()), parseInt(g[1].css("min-width")), Math.round(h[1] * g[1].parent().width()) ], k = j && i[1] < i[0] ? i[0] : i[1], l = j && i[3] < i[2] ? i[2] : i[3];
            g[0].css({
                height: k,
                "max-height": g[0].parent().height() - 10
            }).find(".mCSB_dragger_bar").css({
                "line-height": i[0] + "px"
            });
            g[1].css({
                width: l,
                "max-width": g[1].parent().width() - 10
            });
        }, /* -------------------- */
        /* calculates scrollbar to content ratio */
        z = function() {
            var b = a(this), c = b.data(e), d = a("#mCSB_" + c.idx), f = a("#mCSB_" + c.idx + "_container"), g = [ a("#mCSB_" + c.idx + "_dragger_vertical"), a("#mCSB_" + c.idx + "_dragger_horizontal") ], h = [ f.outerHeight(false) - d.height(), f.outerWidth(false) - d.width() ], i = [ h[0] / (g[0].parent().height() - g[0].height()), h[1] / (g[1].parent().width() - g[1].width()) ];
            c.scrollRatio = {
                y: i[0],
                x: i[1]
            };
        }, /* -------------------- */
        /* toggles scrolling classes */
        A = function(a, b, c) {
            var d = c ? m[0] + "_expanded" : "", e = a.closest(".mCSB_scrollTools");
            if (b === "active") {
                a.toggleClass(m[0] + " " + d);
                e.toggleClass(m[1]);
                a[0]._draggable = a[0]._draggable ? 0 : 1;
            } else {
                if (!a[0]._draggable) {
                    if (b === "hide") {
                        a.removeClass(m[0]);
                        e.removeClass(m[1]);
                    } else {
                        a.addClass(m[0]);
                        e.addClass(m[1]);
                    }
                }
            }
        }, /* -------------------- */
        /* checks if content overflows its container to determine if scrolling is required */
        B = function() {
            var b = a(this), c = b.data(e), d = a("#mCSB_" + c.idx), f = a("#mCSB_" + c.idx + "_container"), g = c.overflowed == null ? f.height() : f.outerHeight(false), h = c.overflowed == null ? f.width() : f.outerWidth(false);
            return [ g > d.height(), h > d.width() ];
        }, /* -------------------- */
        /* resets content position to 0 */
        C = function() {
            var b = a(this), c = b.data(e), d = c.opt, f = a("#mCSB_" + c.idx), g = a("#mCSB_" + c.idx + "_container"), h = [ a("#mCSB_" + c.idx + "_dragger_vertical"), a("#mCSB_" + c.idx + "_dragger_horizontal") ];
            W(b);
            /* stop any current scrolling before resetting */
            if (d.axis !== "x" && !c.overflowed[0] || d.axis === "y" && c.overflowed[0]) {
                /* reset y */
                h[0].add(g).css("top", 0);
                X(b, "_resetY");
            }
            if (d.axis !== "y" && !c.overflowed[1] || d.axis === "x" && c.overflowed[1]) {
                /* reset x */
                var i = dx = 0;
                if (c.langDir === "rtl") {
                    /* adjust left position for rtl direction */
                    i = f.width() - g.outerWidth(false);
                    dx = Math.abs(i / c.scrollRatio.x);
                }
                g.css("left", i);
                h[1].css("left", dx);
                X(b, "_resetX");
            }
        }, /* -------------------- */
        /* binds scrollbar events */
        D = function() {
            var b = a(this), c = b.data(e), d = c.opt;
            if (!c.bindEvents) {
                /* check if events are already bound */
                H.call(this);
                if (d.contentTouchScroll) {
                    I.call(this);
                }
                J.call(this);
                if (d.mouseWheel.enable) {
                    /* bind mousewheel fn when plugin is available */
                    function f() {
                        g = setTimeout(function() {
                            if (!a.event.special.mousewheel) {
                                f();
                            } else {
                                clearTimeout(g);
                                K.call(b[0]);
                            }
                        }, 100);
                    }
                    var g;
                    f();
                }
                M.call(this);
                O.call(this);
                if (d.advanced.autoScrollOnFocus) {
                    N.call(this);
                }
                if (d.scrollButtons.enable) {
                    P.call(this);
                }
                if (d.keyboard.enable) {
                    Q.call(this);
                }
                c.bindEvents = true;
            }
        }, /* -------------------- */
        /* unbinds scrollbar events */
        E = function() {
            var b = a(this), d = b.data(e), f = d.opt, g = e + "_" + d.idx, h = ".mCSB_" + d.idx + "_scrollbar", i = a("#mCSB_" + d.idx + ",#mCSB_" + d.idx + "_container,#mCSB_" + d.idx + "_container_wrapper," + h + " ." + m[12] + ",#mCSB_" + d.idx + "_dragger_vertical,#mCSB_" + d.idx + "_dragger_horizontal," + h + ">a"), j = a("#mCSB_" + d.idx + "_container");
            if (f.advanced.releaseDraggableSelectors) {
                i.add(a(f.advanced.releaseDraggableSelectors));
            }
            if (d.bindEvents) {
                /* check if events are bound */
                /* unbind namespaced events from document/selectors */
                a(c).unbind("." + g);
                i.each(function() {
                    a(this).unbind("." + g);
                });
                /* clear and delete timeouts/objects */
                clearTimeout(b[0]._focusTimeout);
                _(b[0], "_focusTimeout");
                clearTimeout(d.sequential.step);
                _(d.sequential, "step");
                clearTimeout(j[0].onCompleteTimeout);
                _(j[0], "onCompleteTimeout");
                d.bindEvents = false;
            }
        }, /* -------------------- */
        /* toggles scrollbar visibility */
        F = function(b) {
            var c = a(this), d = c.data(e), f = d.opt, g = a("#mCSB_" + d.idx + "_container_wrapper"), h = g.length ? g : a("#mCSB_" + d.idx + "_container"), i = [ a("#mCSB_" + d.idx + "_scrollbar_vertical"), a("#mCSB_" + d.idx + "_scrollbar_horizontal") ], j = [ i[0].find(".mCSB_dragger"), i[1].find(".mCSB_dragger") ];
            if (f.axis !== "x") {
                if (d.overflowed[0] && !b) {
                    i[0].add(j[0]).add(i[0].children("a")).css("display", "block");
                    h.removeClass(m[8] + " " + m[10]);
                } else {
                    if (f.alwaysShowScrollbar) {
                        if (f.alwaysShowScrollbar !== 2) {
                            j[0].css("display", "none");
                        }
                        h.removeClass(m[10]);
                    } else {
                        i[0].css("display", "none");
                        h.addClass(m[10]);
                    }
                    h.addClass(m[8]);
                }
            }
            if (f.axis !== "y") {
                if (d.overflowed[1] && !b) {
                    i[1].add(j[1]).add(i[1].children("a")).css("display", "block");
                    h.removeClass(m[9] + " " + m[11]);
                } else {
                    if (f.alwaysShowScrollbar) {
                        if (f.alwaysShowScrollbar !== 2) {
                            j[1].css("display", "none");
                        }
                        h.removeClass(m[11]);
                    } else {
                        i[1].css("display", "none");
                        h.addClass(m[11]);
                    }
                    h.addClass(m[9]);
                }
            }
            if (!d.overflowed[0] && !d.overflowed[1]) {
                c.addClass(m[5]);
            } else {
                c.removeClass(m[5]);
            }
        }, /* -------------------- */
        /* returns input coordinates of pointer, touch and mouse events (relative to document) */
        G = function(a) {
            var b = a.type;
            switch (b) {
              case "pointerdown":
              case "MSPointerDown":
              case "pointermove":
              case "MSPointerMove":
              case "pointerup":
              case "MSPointerUp":
                return [ a.originalEvent.pageY, a.originalEvent.pageX, false ];
                break;

              case "touchstart":
              case "touchmove":
              case "touchend":
                var c = a.originalEvent.touches[0] || a.originalEvent.changedTouches[0], d = a.originalEvent.touches.length || a.originalEvent.changedTouches.length;
                return [ c.pageY, c.pageX, d > 1 ];
                break;

              default:
                return [ a.pageY, a.pageX, false ];
            }
        }, /* -------------------- */
        /* 
		SCROLLBAR DRAG EVENTS
		scrolls content via scrollbar dragging 
		*/
        H = function() {
            var b = a(this), d = b.data(e), f = d.opt, g = e + "_" + d.idx, h = [ "mCSB_" + d.idx + "_dragger_vertical", "mCSB_" + d.idx + "_dragger_horizontal" ], i = a("#mCSB_" + d.idx + "_container"), l = a("#" + h[0] + ",#" + h[1]), m, n, o, p = f.advanced.releaseDraggableSelectors ? l.add(a(f.advanced.releaseDraggableSelectors)) : l;
            l.bind("mousedown." + g + " touchstart." + g + " pointerdown." + g + " MSPointerDown." + g, function(d) {
                d.stopImmediatePropagation();
                d.preventDefault();
                if (!ab(d)) {
                    return;
                }
                /* left mouse button only */
                k = true;
                if (j) {
                    c.onselectstart = function() {
                        return false;
                    };
                }
                /* disable text selection for IE < 9 */
                q(false);
                /* enable scrollbar dragging over iframes by disabling their events */
                W(b);
                m = a(this);
                var e = m.offset(), g = G(d)[0] - e.top, h = G(d)[1] - e.left, i = m.height() + e.top, l = m.width() + e.left;
                if (g < i && g > 0 && h < l && h > 0) {
                    n = g;
                    o = h;
                }
                A(m, "active", f.autoExpandScrollbar);
            }).bind("touchmove." + g, function(a) {
                a.stopImmediatePropagation();
                a.preventDefault();
                var b = m.offset(), c = G(a)[0] - b.top, d = G(a)[1] - b.left;
                r(n, o, c, d);
            });
            a(c).bind("mousemove." + g + " pointermove." + g + " MSPointerMove." + g, function(a) {
                if (m) {
                    var b = m.offset(), c = G(a)[0] - b.top, d = G(a)[1] - b.left;
                    if (n === c) {
                        return;
                    }
                    /* has it really moved? */
                    r(n, o, c, d);
                }
            }).add(p).bind("mouseup." + g + " touchend." + g + " pointerup." + g + " MSPointerUp." + g, function(a) {
                if (m) {
                    A(m, "active", f.autoExpandScrollbar);
                    m = null;
                }
                k = false;
                if (j) {
                    c.onselectstart = null;
                }
                /* enable text selection for IE < 9 */
                q(true);
            });
            function q(a) {
                var b = i.find("iframe");
                if (!b.length) {
                    return;
                }
                /* check if content contains iframes */
                var c = !a ? "none" : "auto";
                b.css("pointer-events", c);
            }
            function r(a, c, e, g) {
                i[0].idleTimer = f.scrollInertia < 233 ? 250 : 0;
                if (m.attr("id") === h[1]) {
                    var j = "x", k = (m[0].offsetLeft - c + g) * d.scrollRatio.x;
                } else {
                    var j = "y", k = (m[0].offsetTop - a + e) * d.scrollRatio.y;
                }
                X(b, k.toString(), {
                    dir: j,
                    drag: true
                });
            }
        }, /* -------------------- */
        /* 
		TOUCH SWIPE EVENTS
		scrolls content via touch swipe 
		Emulates the native touch-swipe scrolling with momentum found in iOS, Android and WP devices 
		*/
        I = function() {
            var b = a(this), c = b.data(e), d = c.opt, f = e + "_" + c.idx, g = a("#mCSB_" + c.idx), h = a("#mCSB_" + c.idx + "_container"), i = [ a("#mCSB_" + c.idx + "_dragger_vertical"), a("#mCSB_" + c.idx + "_dragger_horizontal") ], j, m, n, o, p = [], q = [], r, s, t, u, v, w, x = 0, y, z = d.axis === "yx" ? "none" : "all", A = [], B, C;
            h.bind("touchstart." + f + " pointerdown." + f + " MSPointerDown." + f, function(a) {
                if (!bb(a) || k || G(a)[2]) {
                    l = 0;
                    return;
                }
                l = 1;
                B = 0;
                C = 0;
                var b = h.offset();
                j = G(a)[0] - b.top;
                m = G(a)[1] - b.left;
                A = [ G(a)[0], G(a)[1] ];
            }).bind("touchmove." + f + " pointermove." + f + " MSPointerMove." + f, function(a) {
                if (!bb(a) || k || G(a)[2]) {
                    return;
                }
                a.stopImmediatePropagation();
                if (C && !B) {
                    return;
                }
                s = Z();
                var b = g.offset(), e = G(a)[0] - b.top, f = G(a)[1] - b.left, l = "mcsLinearOut";
                p.push(e);
                q.push(f);
                A[2] = Math.abs(G(a)[0] - A[0]);
                A[3] = Math.abs(G(a)[1] - A[1]);
                if (c.overflowed[0]) {
                    var n = i[0].parent().height() - i[0].height(), o = j - e > 0 && e - j > -(n * c.scrollRatio.y) && (A[3] * 2 < A[2] || d.axis === "yx");
                }
                if (c.overflowed[1]) {
                    var r = i[1].parent().width() - i[1].width(), t = m - f > 0 && f - m > -(r * c.scrollRatio.x) && (A[2] * 2 < A[3] || d.axis === "yx");
                }
                if (o || t) {
                    a.preventDefault();
                    B = 1;
                } else {
                    C = 1;
                }
                /* prevent native document scrolling */
                w = d.axis === "yx" ? [ j - e, m - f ] : d.axis === "x" ? [ null, m - f ] : [ j - e, null ];
                h[0].idleTimer = 250;
                if (c.overflowed[0]) {
                    E(w[0], x, l, "y", "all", true);
                }
                if (c.overflowed[1]) {
                    E(w[1], x, l, "x", z, true);
                }
            });
            g.bind("touchstart." + f + " pointerdown." + f + " MSPointerDown." + f, function(a) {
                if (!bb(a) || k || G(a)[2]) {
                    l = 0;
                    return;
                }
                l = 1;
                a.stopImmediatePropagation();
                W(b);
                r = Z();
                var c = g.offset();
                n = G(a)[0] - c.top;
                o = G(a)[1] - c.left;
                p = [];
                q = [];
            }).bind("touchend." + f + " pointerup." + f + " MSPointerUp." + f, function(a) {
                if (!bb(a) || k || G(a)[2]) {
                    return;
                }
                a.stopImmediatePropagation();
                B = 0;
                C = 0;
                t = Z();
                var b = g.offset(), e = G(a)[0] - b.top, f = G(a)[1] - b.left;
                if (t - s > 30) {
                    return;
                }
                v = 1e3 / (t - r);
                var i = "mcsEaseOut", j = v < 2.5, l = j ? [ p[p.length - 2], q[q.length - 2] ] : [ 0, 0 ];
                u = j ? [ e - l[0], f - l[1] ] : [ e - n, f - o ];
                var m = [ Math.abs(u[0]), Math.abs(u[1]) ];
                v = j ? [ Math.abs(u[0] / 4), Math.abs(u[1] / 4) ] : [ v, v ];
                var x = [ Math.abs(h[0].offsetTop) - u[0] * D(m[0] / v[0], v[0]), Math.abs(h[0].offsetLeft) - u[1] * D(m[1] / v[1], v[1]) ];
                w = d.axis === "yx" ? [ x[0], x[1] ] : d.axis === "x" ? [ null, x[1] ] : [ x[0], null ];
                y = [ m[0] * 4 + d.scrollInertia, m[1] * 4 + d.scrollInertia ];
                var A = parseInt(d.contentTouchScroll) || 0;
                /* absolute minimum distance required */
                w[0] = m[0] > A ? w[0] : 0;
                w[1] = m[1] > A ? w[1] : 0;
                if (c.overflowed[0]) {
                    E(w[0], y[0], i, "y", z, false);
                }
                if (c.overflowed[1]) {
                    E(w[1], y[1], i, "x", z, false);
                }
            });
            function D(a, b) {
                var c = [ b * 1.5, b * 2, b / 1.5, b / 2 ];
                if (a > 90) {
                    return b > 4 ? c[0] : c[3];
                } else if (a > 60) {
                    return b > 3 ? c[3] : c[2];
                } else if (a > 30) {
                    return b > 8 ? c[1] : b > 6 ? c[0] : b > 4 ? b : c[2];
                } else {
                    return b > 8 ? b : c[3];
                }
            }
            function E(a, c, d, e, f, g) {
                if (!a) {
                    return;
                }
                X(b, a.toString(), {
                    dur: c,
                    scrollEasing: d,
                    dir: e,
                    overwrite: f,
                    drag: g
                });
            }
        }, /* -------------------- */
        /* 
		SELECT TEXT EVENTS 
		scrolls content when text is selected 
		*/
        J = function() {
            var d = a(this), f = d.data(e), g = f.opt, h = f.sequential, i = e + "_" + f.idx, j = a("#mCSB_" + f.idx + "_container"), m = j.parent(), n;
            j.bind("mousedown." + i, function(a) {
                if (l) {
                    return;
                }
                if (!n) {
                    n = 1;
                    k = true;
                }
            }).add(c).bind("mousemove." + i, function(a) {
                if (!l && n && o()) {
                    var b = j.offset(), c = G(a)[0] - b.top + j[0].offsetTop, d = G(a)[1] - b.left + j[0].offsetLeft;
                    if (c > 0 && c < m.height() && d > 0 && d < m.width()) {
                        if (h.step) {
                            p("off", null, "stepped");
                        }
                    } else {
                        if (g.axis !== "x" && f.overflowed[0]) {
                            if (c < 0) {
                                p("on", 38);
                            } else if (c > m.height()) {
                                p("on", 40);
                            }
                        }
                        if (g.axis !== "y" && f.overflowed[1]) {
                            if (d < 0) {
                                p("on", 37);
                            } else if (d > m.width()) {
                                p("on", 39);
                            }
                        }
                    }
                }
            }).bind("mouseup." + i, function(a) {
                if (l) {
                    return;
                }
                if (n) {
                    n = 0;
                    p("off", null);
                }
                k = false;
            });
            function o() {
                return b.getSelection ? b.getSelection().toString() : c.selection && c.selection.type != "Control" ? c.selection.createRange().text : 0;
            }
            function p(a, b, c) {
                h.type = c && n ? "stepped" : "stepless";
                h.scrollAmount = 10;
                R(d, a, b, "mcsLinearOut", c ? 60 : null);
            }
        }, /* -------------------- */
        /* 
		MOUSE WHEEL EVENT
		scrolls content via mouse-wheel 
		via mouse-wheel plugin (https://github.com/brandonaaron/jquery-mousewheel)
		*/
        K = function() {
            var b = a(this), c = b.data(e);
            if (c) {
                /* Check if the scrollbar is ready to use mousewheel events (issue: #185) */
                var d = c.opt, f = e + "_" + c.idx, g = a("#mCSB_" + c.idx), h = [ a("#mCSB_" + c.idx + "_dragger_vertical"), a("#mCSB_" + c.idx + "_dragger_horizontal") ], i = a("#mCSB_" + c.idx + "_container").find("iframe"), k = g;
                /* check for cross domain iframes and bind mousewheel event on them in addition to default mousewheel element selector */
                if (i.length) {
                    i.each(function() {
                        var b = this;
                        if (l(b)) {
                            /* check if iframe can be accessed */
                            k = k.add(a(b).contents().find("body"));
                        }
                    });
                }
                k.bind("mousewheel." + f, function(e, f) {
                    W(b);
                    if (L(b, e.target)) {
                        return;
                    }
                    /* disables mouse-wheel when hovering specific elements */
                    var i = d.mouseWheel.deltaFactor !== "auto" ? parseInt(d.mouseWheel.deltaFactor) : j && e.deltaFactor < 100 ? 100 : e.deltaFactor || 100;
                    if (d.axis === "x" || d.mouseWheel.axis === "x") {
                        var k = "x", l = [ Math.round(i * c.scrollRatio.x), parseInt(d.mouseWheel.scrollAmount) ], m = d.mouseWheel.scrollAmount !== "auto" ? l[1] : l[0] >= g.width() ? g.width() * .9 : l[0], n = Math.abs(a("#mCSB_" + c.idx + "_container")[0].offsetLeft), o = h[1][0].offsetLeft, p = h[1].parent().width() - h[1].width(), q = e.deltaX || e.deltaY || f;
                    } else {
                        var k = "y", l = [ Math.round(i * c.scrollRatio.y), parseInt(d.mouseWheel.scrollAmount) ], m = d.mouseWheel.scrollAmount !== "auto" ? l[1] : l[0] >= g.height() ? g.height() * .9 : l[0], n = Math.abs(a("#mCSB_" + c.idx + "_container")[0].offsetTop), o = h[0][0].offsetTop, p = h[0].parent().height() - h[0].height(), q = e.deltaY || f;
                    }
                    if (k === "y" && !c.overflowed[0] || k === "x" && !c.overflowed[1]) {
                        return;
                    }
                    if (d.mouseWheel.invert) {
                        q = -q;
                    }
                    if (d.mouseWheel.normalizeDelta) {
                        q = q < 0 ? -1 : 1;
                    }
                    if (q > 0 && o !== 0 || q < 0 && o !== p || d.mouseWheel.preventDefault) {
                        e.stopImmediatePropagation();
                        e.preventDefault();
                    }
                    X(b, (n - q * m).toString(), {
                        dir: k
                    });
                });
            }
            /* check if iframe can be accessed */
            function l(a) {
                var b = null;
                try {
                    var c = a.contentDocument || a.contentWindow.document;
                    b = c.body.innerHTML;
                } catch (d) {}
                return b !== null;
            }
        }, /* -------------------- */
        /* disables mouse-wheel when hovering specific elements like select, datalist etc. */
        L = function(b, c) {
            var d = c.nodeName.toLowerCase(), f = b.data(e).opt.mouseWheel.disableOver, /* elements that require focus */
            g = [ "select", "textarea" ];
            return a.inArray(d, f) > -1 && !(a.inArray(d, g) > -1 && !a(c).is(":focus"));
        }, /* -------------------- */
        /* 
		DRAGGER RAIL CLICK EVENT
		scrolls content via dragger rail 
		*/
        M = function() {
            var b = a(this), c = b.data(e), d = e + "_" + c.idx, f = a("#mCSB_" + c.idx + "_container"), g = f.parent(), h = a(".mCSB_" + c.idx + "_scrollbar ." + m[12]);
            h.bind("touchstart." + d + " pointerdown." + d + " MSPointerDown." + d, function(a) {
                k = true;
            }).bind("touchend." + d + " pointerup." + d + " MSPointerUp." + d, function(a) {
                k = false;
            }).bind("click." + d, function(d) {
                if (a(d.target).hasClass(m[12]) || a(d.target).hasClass("mCSB_draggerRail")) {
                    W(b);
                    var e = a(this), h = e.find(".mCSB_dragger");
                    if (e.parent(".mCSB_scrollTools_horizontal").length > 0) {
                        if (!c.overflowed[1]) {
                            return;
                        }
                        var i = "x", j = d.pageX > h.offset().left ? -1 : 1, k = Math.abs(f[0].offsetLeft) - j * (g.width() * .9);
                    } else {
                        if (!c.overflowed[0]) {
                            return;
                        }
                        var i = "y", j = d.pageY > h.offset().top ? -1 : 1, k = Math.abs(f[0].offsetTop) - j * (g.height() * .9);
                    }
                    X(b, k.toString(), {
                        dir: i,
                        scrollEasing: "mcsEaseInOut"
                    });
                }
            });
        }, /* -------------------- */
        /* 
		FOCUS EVENT
		scrolls content via element focus (e.g. clicking an input, pressing TAB key etc.)
		*/
        N = function() {
            var b = a(this), d = b.data(e), f = d.opt, g = e + "_" + d.idx, h = a("#mCSB_" + d.idx + "_container"), i = h.parent();
            h.bind("focusin." + g, function(d) {
                var e = a(c.activeElement), g = h.find(".mCustomScrollBox").length, j = 0;
                if (!e.is(f.advanced.autoScrollOnFocus)) {
                    return;
                }
                W(b);
                clearTimeout(b[0]._focusTimeout);
                b[0]._focusTimer = g ? (j + 17) * g : 0;
                b[0]._focusTimeout = setTimeout(function() {
                    var a = [ db(e)[0], db(e)[1] ], c = [ h[0].offsetTop, h[0].offsetLeft ], d = [ c[0] + a[0] >= 0 && c[0] + a[0] < i.height() - e.outerHeight(false), c[1] + a[1] >= 0 && c[0] + a[1] < i.width() - e.outerWidth(false) ], g = f.axis === "yx" && !d[0] && !d[1] ? "none" : "all";
                    if (f.axis !== "x" && !d[0]) {
                        X(b, a[0].toString(), {
                            dir: "y",
                            scrollEasing: "mcsEaseInOut",
                            overwrite: g,
                            dur: j
                        });
                    }
                    if (f.axis !== "y" && !d[1]) {
                        X(b, a[1].toString(), {
                            dir: "x",
                            scrollEasing: "mcsEaseInOut",
                            overwrite: g,
                            dur: j
                        });
                    }
                }, b[0]._focusTimer);
            });
        }, /* -------------------- */
        /* sets content wrapper scrollTop/scrollLeft always to 0 */
        O = function() {
            var b = a(this), c = b.data(e), d = e + "_" + c.idx, f = a("#mCSB_" + c.idx + "_container").parent();
            f.bind("scroll." + d, function(b) {
                if (f.scrollTop() !== 0 || f.scrollLeft() !== 0) {
                    a(".mCSB_" + c.idx + "_scrollbar").css("visibility", "hidden");
                }
            });
        }, /* -------------------- */
        /* 
		BUTTONS EVENTS
		scrolls content via up, down, left and right buttons 
		*/
        P = function() {
            var b = a(this), c = b.data(e), d = c.opt, f = c.sequential, g = e + "_" + c.idx, h = ".mCSB_" + c.idx + "_scrollbar", i = a(h + ">a");
            i.bind("mousedown." + g + " touchstart." + g + " pointerdown." + g + " MSPointerDown." + g + " mouseup." + g + " touchend." + g + " pointerup." + g + " MSPointerUp." + g + " mouseout." + g + " pointerout." + g + " MSPointerOut." + g + " click." + g, function(e) {
                e.preventDefault();
                if (!ab(e)) {
                    return;
                }
                /* left mouse button only */
                var g = a(this).attr("class");
                f.type = d.scrollButtons.scrollType;
                switch (e.type) {
                  case "mousedown":
                  case "touchstart":
                  case "pointerdown":
                  case "MSPointerDown":
                    if (f.type === "stepped") {
                        return;
                    }
                    k = true;
                    c.tweenRunning = false;
                    h("on", g);
                    break;

                  case "mouseup":
                  case "touchend":
                  case "pointerup":
                  case "MSPointerUp":
                  case "mouseout":
                  case "pointerout":
                  case "MSPointerOut":
                    if (f.type === "stepped") {
                        return;
                    }
                    k = false;
                    if (f.dir) {
                        h("off", g);
                    }
                    break;

                  case "click":
                    if (f.type !== "stepped" || c.tweenRunning) {
                        return;
                    }
                    h("on", g);
                    break;
                }
                function h(a, c) {
                    f.scrollAmount = d.snapAmount || d.scrollButtons.scrollAmount;
                    R(b, a, c);
                }
            });
        }, /* -------------------- */
        /* 
		KEYBOARD EVENTS
		scrolls content via keyboard 
		Keys: up arrow, down arrow, left arrow, right arrow, PgUp, PgDn, Home, End
		*/
        Q = function() {
            var b = a(this), d = b.data(e), f = d.opt, g = d.sequential, h = e + "_" + d.idx, i = a("#mCSB_" + d.idx), j = a("#mCSB_" + d.idx + "_container"), k = j.parent(), l = "input,textarea,select,datalist,keygen,[contenteditable='true']";
            i.attr("tabindex", "0").bind("blur." + h + " keydown." + h + " keyup." + h, function(e) {
                switch (e.type) {
                  case "blur":
                    if (d.tweenRunning && g.dir) {
                        p("off", null);
                    }
                    break;

                  case "keydown":
                  case "keyup":
                    var h = e.keyCode ? e.keyCode : e.which, i = "on";
                    if (f.axis !== "x" && (h === 38 || h === 40) || f.axis !== "y" && (h === 37 || h === 39)) {
                        /* up (38), down (40), left (37), right (39) arrows */
                        if ((h === 38 || h === 40) && !d.overflowed[0] || (h === 37 || h === 39) && !d.overflowed[1]) {
                            return;
                        }
                        if (e.type === "keyup") {
                            i = "off";
                        }
                        if (!a(c.activeElement).is(l)) {
                            e.preventDefault();
                            e.stopImmediatePropagation();
                            p(i, h);
                        }
                    } else if (h === 33 || h === 34) {
                        /* PgUp (33), PgDn (34) */
                        if (d.overflowed[0] || d.overflowed[1]) {
                            e.preventDefault();
                            e.stopImmediatePropagation();
                        }
                        if (e.type === "keyup") {
                            W(b);
                            var m = h === 34 ? -1 : 1;
                            if (f.axis === "x" || f.axis === "yx" && d.overflowed[1] && !d.overflowed[0]) {
                                var n = "x", o = Math.abs(j[0].offsetLeft) - m * (k.width() * .9);
                            } else {
                                var n = "y", o = Math.abs(j[0].offsetTop) - m * (k.height() * .9);
                            }
                            X(b, o.toString(), {
                                dir: n,
                                scrollEasing: "mcsEaseInOut"
                            });
                        }
                    } else if (h === 35 || h === 36) {
                        /* End (35), Home (36) */
                        if (!a(c.activeElement).is(l)) {
                            if (d.overflowed[0] || d.overflowed[1]) {
                                e.preventDefault();
                                e.stopImmediatePropagation();
                            }
                            if (e.type === "keyup") {
                                if (f.axis === "x" || f.axis === "yx" && d.overflowed[1] && !d.overflowed[0]) {
                                    var n = "x", o = h === 35 ? Math.abs(k.width() - j.outerWidth(false)) : 0;
                                } else {
                                    var n = "y", o = h === 35 ? Math.abs(k.height() - j.outerHeight(false)) : 0;
                                }
                                X(b, o.toString(), {
                                    dir: n,
                                    scrollEasing: "mcsEaseInOut"
                                });
                            }
                        }
                    }
                    break;
                }
                function p(a, c) {
                    g.type = f.keyboard.scrollType;
                    g.scrollAmount = f.snapAmount || f.keyboard.scrollAmount;
                    if (g.type === "stepped" && d.tweenRunning) {
                        return;
                    }
                    R(b, a, c);
                }
            });
        }, /* -------------------- */
        /* scrolls content sequentially (used when scrolling via buttons, keyboard arrows etc.) */
        R = function(b, c, d, f, g) {
            var h = b.data(e), i = h.opt, j = h.sequential, k = a("#mCSB_" + h.idx + "_container"), l = j.type === "stepped" ? true : false, n = i.scrollInertia < 26 ? 26 : i.scrollInertia, /* 26/1.5=17 */
            o = i.scrollInertia < 1 ? 17 : i.scrollInertia;
            switch (c) {
              case "on":
                j.dir = [ d === m[16] || d === m[15] || d === 39 || d === 37 ? "x" : "y", d === m[13] || d === m[15] || d === 38 || d === 37 ? -1 : 1 ];
                W(b);
                if (cb(d) && j.type === "stepped") {
                    return;
                }
                p(l);
                break;

              case "off":
                q();
                if (l || h.tweenRunning && j.dir) {
                    p(true);
                }
                break;
            }
            /* starts sequence */
            function p(a) {
                var c = j.type !== "stepped", /* continuous scrolling */
                d = g ? g : !a ? 1e3 / 60 : c ? n / 1.5 : o, /* timer */
                e = !a ? 2.5 : c ? 7.5 : 40, /* multiplier */
                i = [ Math.abs(k[0].offsetTop), Math.abs(k[0].offsetLeft) ], l = [ h.scrollRatio.y > 10 ? 10 : h.scrollRatio.y, h.scrollRatio.x > 10 ? 10 : h.scrollRatio.x ], m = j.dir[0] === "x" ? i[1] + j.dir[1] * (l[1] * e) : i[0] + j.dir[1] * (l[0] * e), q = j.dir[0] === "x" ? i[1] + j.dir[1] * parseInt(j.scrollAmount) : i[0] + j.dir[1] * parseInt(j.scrollAmount), r = j.scrollAmount !== "auto" ? q : m, s = f ? f : !a ? "mcsLinear" : c ? "mcsLinearOut" : "mcsEaseInOut", t = !a ? false : true;
                if (a && d < 17) {
                    r = j.dir[0] === "x" ? i[1] : i[0];
                }
                X(b, r.toString(), {
                    dir: j.dir[0],
                    scrollEasing: s,
                    dur: d,
                    onComplete: t
                });
                if (a) {
                    j.dir = false;
                    return;
                }
                clearTimeout(j.step);
                j.step = setTimeout(function() {
                    p();
                }, d);
            }
            /* stops sequence */
            function q() {
                clearTimeout(j.step);
                _(j, "step");
                W(b);
            }
        }, /* -------------------- */
        /* returns a yx array from value */
        S = function(b) {
            var c = a(this).data(e).opt, d = [];
            if (typeof b === "function") {
                b = b();
            }
            /* check if the value is a single anonymous function */
            /* check if value is object or array, its length and create an array with yx values */
            if (!(b instanceof Array)) {
                /* object value (e.g. {y:"100",x:"100"}, 100 etc.) */
                d[0] = b.y ? b.y : b.x || c.axis === "x" ? null : b;
                d[1] = b.x ? b.x : b.y || c.axis === "y" ? null : b;
            } else {
                /* array value (e.g. [100,100]) */
                d = b.length > 1 ? [ b[0], b[1] ] : c.axis === "x" ? [ null, b[0] ] : [ b[0], null ];
            }
            /* check if array values are anonymous functions */
            if (typeof d[0] === "function") {
                d[0] = d[0]();
            }
            if (typeof d[1] === "function") {
                d[1] = d[1]();
            }
            return d;
        }, /* -------------------- */
        /* translates values (e.g. "top", 100, "100px", "#id") to actual scroll-to positions */
        T = function(b, c) {
            if (b == null || typeof b == "undefined") {
                return;
            }
            var d = a(this), f = d.data(e), g = f.opt, h = a("#mCSB_" + f.idx + "_container"), i = h.parent(), j = typeof b;
            if (!c) {
                c = g.axis === "x" ? "x" : "y";
            }
            var k = c === "x" ? h.outerWidth(false) : h.outerHeight(false), l = c === "x" ? h[0].offsetLeft : h[0].offsetTop, m = c === "x" ? "left" : "top";
            switch (j) {
              case "function":
                /* this currently is not used. Consider removing it */
                return b();
                break;

              case "object":
                /* js/jquery object */
                var o = b.jquery ? b : a(b);
                if (!o.length) {
                    return;
                }
                return c === "x" ? db(o)[1] : db(o)[0];
                break;

              case "string":
              case "number":
                if (cb(b)) {
                    /* numeric value */
                    return Math.abs(b);
                } else if (b.indexOf("%") !== -1) {
                    /* percentage value */
                    return Math.abs(k * parseInt(b) / 100);
                } else if (b.indexOf("-=") !== -1) {
                    /* decrease value */
                    return Math.abs(l - parseInt(b.split("-=")[1]));
                } else if (b.indexOf("+=") !== -1) {
                    /* inrease value */
                    var p = l + parseInt(b.split("+=")[1]);
                    return p >= 0 ? 0 : Math.abs(p);
                } else if (b.indexOf("px") !== -1 && cb(b.split("px")[0])) {
                    /* pixels string value (e.g. "100px") */
                    return Math.abs(b.split("px")[0]);
                } else {
                    if (b === "top" || b === "left") {
                        /* special strings */
                        return 0;
                    } else if (b === "bottom") {
                        return Math.abs(i.height() - h.outerHeight(false));
                    } else if (b === "right") {
                        return Math.abs(i.width() - h.outerWidth(false));
                    } else if (b === "first" || b === "last") {
                        var o = h.find(":" + b);
                        return c === "x" ? db(o)[1] : db(o)[0];
                    } else {
                        if (a(b).length) {
                            /* jquery selector */
                            return c === "x" ? db(a(b))[1] : db(a(b))[0];
                        } else {
                            /* other values (e.g. "100em") */
                            h.css(m, b);
                            n.update.call(null, d[0]);
                            return;
                        }
                    }
                }
                break;
            }
        }, /* -------------------- */
        /* calls the update method automatically */
        U = function(b) {
            var c = a(this), d = c.data(e), f = d.opt, g = a("#mCSB_" + d.idx + "_container");
            if (b) {
                /* 
				removes autoUpdate timer 
				usage: _autoUpdate.call(this,"remove");
				*/
                clearTimeout(g[0].autoUpdate);
                _(g[0], "autoUpdate");
                return;
            }
            var h = g.parent(), i = [ a("#mCSB_" + d.idx + "_scrollbar_vertical"), a("#mCSB_" + d.idx + "_scrollbar_horizontal") ], j = function() {
                return [ i[0].is(":visible") ? i[0].outerHeight(true) : 0, /* returns y-scrollbar height */
                i[1].is(":visible") ? i[1].outerWidth(true) : 0 ];
            }, k = v(), l, o = [ g.outerHeight(false), g.outerWidth(false), h.height(), h.width(), j()[0], j()[1] ], p, q = t(), r;
            s();
            function s() {
                clearTimeout(g[0].autoUpdate);
                g[0].autoUpdate = setTimeout(function() {
                    /* update on specific selector(s) length and size change */
                    if (f.advanced.updateOnSelectorChange) {
                        l = v();
                        if (l !== k) {
                            w(3);
                            k = l;
                            return;
                        }
                    }
                    /* update on main element and scrollbar size changes */
                    if (f.advanced.updateOnContentResize) {
                        p = [ g.outerHeight(false), g.outerWidth(false), h.height(), h.width(), j()[0], j()[1] ];
                        if (p[0] !== o[0] || p[1] !== o[1] || p[2] !== o[2] || p[3] !== o[3] || p[4] !== o[4] || p[5] !== o[5]) {
                            w(p[0] !== o[0] || p[1] !== o[1]);
                            o = p;
                        }
                    }
                    /* update on image load */
                    if (f.advanced.updateOnImageLoad) {
                        r = t();
                        if (r !== q) {
                            g.find("img").each(function() {
                                u(this);
                            });
                            q = r;
                        }
                    }
                    if (f.advanced.updateOnSelectorChange || f.advanced.updateOnContentResize || f.advanced.updateOnImageLoad) {
                        s();
                    }
                }, 60);
            }
            /* returns images amount */
            function t() {
                var a = 0;
                if (f.advanced.updateOnImageLoad) {
                    a = g.find("img").length;
                }
                return a;
            }
            /* a tiny image loader */
            function u(b) {
                if (a(b).hasClass(m[2])) {
                    w();
                    return;
                }
                var c = new Image();
                function d(a, b) {
                    return function() {
                        return b.apply(a, arguments);
                    };
                }
                function e() {
                    this.onload = null;
                    a(b).addClass(m[2]);
                    w(2);
                }
                c.onload = d(c, e);
                c.src = b.src;
            }
            /* returns the total height and width sum of all elements matching the selector */
            function v() {
                if (f.advanced.updateOnSelectorChange === true) {
                    f.advanced.updateOnSelectorChange = "*";
                }
                var b = 0, c = g.find(f.advanced.updateOnSelectorChange);
                if (f.advanced.updateOnSelectorChange && c.length > 0) {
                    c.each(function() {
                        b += a(this).height() + a(this).width();
                    });
                }
                return b;
            }
            /* calls the update method */
            function w(a) {
                clearTimeout(g[0].autoUpdate);
                n.update.call(null, c[0], a);
            }
        }, /* -------------------- */
        /* snaps scrolling to a multiple of a pixels number */
        V = function(a, b, c) {
            return Math.round(a / b) * b - c;
        }, /* -------------------- */
        /* stops content and scrollbar animations */
        W = function(b) {
            var c = b.data(e), d = a("#mCSB_" + c.idx + "_container,#mCSB_" + c.idx + "_container_wrapper,#mCSB_" + c.idx + "_dragger_vertical,#mCSB_" + c.idx + "_dragger_horizontal");
            d.each(function() {
                $.call(this);
            });
        }, /* -------------------- */
        /* 
		ANIMATES CONTENT 
		This is where the actual scrolling happens
		*/
        X = function(b, c, d) {
            var f = b.data(e), g = f.opt, h = {
                trigger: "internal",
                dir: "y",
                scrollEasing: "mcsEaseOut",
                drag: false,
                dur: g.scrollInertia,
                overwrite: "all",
                callbacks: true,
                onStart: true,
                onUpdate: true,
                onComplete: true
            }, d = a.extend(h, d), i = [ d.dur, d.drag ? 0 : d.dur ], j = a("#mCSB_" + f.idx), k = a("#mCSB_" + f.idx + "_container"), l = k.parent(), m = g.callbacks.onTotalScrollOffset ? S.call(b, g.callbacks.onTotalScrollOffset) : [ 0, 0 ], n = g.callbacks.onTotalScrollBackOffset ? S.call(b, g.callbacks.onTotalScrollBackOffset) : [ 0, 0 ];
            f.trigger = d.trigger;
            if (l.scrollTop() !== 0 || l.scrollLeft() !== 0) {
                /* always reset scrollTop/Left */
                a(".mCSB_" + f.idx + "_scrollbar").css("visibility", "visible");
                l.scrollTop(0).scrollLeft(0);
            }
            if (c === "_resetY" && !f.contentReset.y) {
                /* callbacks: onOverflowYNone */
                if (x("onOverflowYNone")) {
                    g.callbacks.onOverflowYNone.call(b[0]);
                }
                f.contentReset.y = 1;
            }
            if (c === "_resetX" && !f.contentReset.x) {
                /* callbacks: onOverflowXNone */
                if (x("onOverflowXNone")) {
                    g.callbacks.onOverflowXNone.call(b[0]);
                }
                f.contentReset.x = 1;
            }
            if (c === "_resetY" || c === "_resetX") {
                return;
            }
            if ((f.contentReset.y || !b[0].mcs) && f.overflowed[0]) {
                /* callbacks: onOverflowY */
                if (x("onOverflowY")) {
                    g.callbacks.onOverflowY.call(b[0]);
                }
                f.contentReset.x = null;
            }
            if ((f.contentReset.x || !b[0].mcs) && f.overflowed[1]) {
                /* callbacks: onOverflowX */
                if (x("onOverflowX")) {
                    g.callbacks.onOverflowX.call(b[0]);
                }
                f.contentReset.x = null;
            }
            if (g.snapAmount) {
                c = V(c, g.snapAmount, g.snapOffset);
            }
            /* scrolling snapping */
            switch (d.dir) {
              case "x":
                var o = a("#mCSB_" + f.idx + "_dragger_horizontal"), p = "left", q = k[0].offsetLeft, r = [ j.width() - k.outerWidth(false), o.parent().width() - o.width() ], s = [ c, c === 0 ? 0 : c / f.scrollRatio.x ], t = m[1], u = n[1], v = t > 0 ? t / f.scrollRatio.x : 0, w = u > 0 ? u / f.scrollRatio.x : 0;
                break;

              case "y":
                var o = a("#mCSB_" + f.idx + "_dragger_vertical"), p = "top", q = k[0].offsetTop, r = [ j.height() - k.outerHeight(false), o.parent().height() - o.height() ], s = [ c, c === 0 ? 0 : c / f.scrollRatio.y ], t = m[0], u = n[0], v = t > 0 ? t / f.scrollRatio.y : 0, w = u > 0 ? u / f.scrollRatio.y : 0;
                break;
            }
            if (s[1] < 0 || s[0] === 0 && s[1] === 0) {
                s = [ 0, 0 ];
            } else if (s[1] >= r[1]) {
                s = [ r[0], r[1] ];
            } else {
                s[0] = -s[0];
            }
            if (!b[0].mcs) {
                z();
                /* init mcs object (once) to make it available before callbacks */
                if (x("onInit")) {
                    g.callbacks.onInit.call(b[0]);
                }
            }
            clearTimeout(k[0].onCompleteTimeout);
            if (!f.tweenRunning && (q === 0 && s[0] >= 0 || q === r[0] && s[0] <= r[0])) {
                return;
            }
            Y(o[0], p, Math.round(s[1]), i[1], d.scrollEasing);
            Y(k[0], p, Math.round(s[0]), i[0], d.scrollEasing, d.overwrite, {
                onStart: function() {
                    if (d.callbacks && d.onStart && !f.tweenRunning) {
                        /* callbacks: onScrollStart */
                        if (x("onScrollStart")) {
                            z();
                            g.callbacks.onScrollStart.call(b[0]);
                        }
                        f.tweenRunning = true;
                        A(o);
                        f.cbOffsets = y();
                    }
                },
                onUpdate: function() {
                    if (d.callbacks && d.onUpdate) {
                        /* callbacks: whileScrolling */
                        if (x("whileScrolling")) {
                            z();
                            g.callbacks.whileScrolling.call(b[0]);
                        }
                    }
                },
                onComplete: function() {
                    if (d.callbacks && d.onComplete) {
                        if (g.axis === "yx") {
                            clearTimeout(k[0].onCompleteTimeout);
                        }
                        var a = k[0].idleTimer || 0;
                        k[0].onCompleteTimeout = setTimeout(function() {
                            /* callbacks: onScroll, onTotalScroll, onTotalScrollBack */
                            if (x("onScroll")) {
                                z();
                                g.callbacks.onScroll.call(b[0]);
                            }
                            if (x("onTotalScroll") && s[1] >= r[1] - v && f.cbOffsets[0]) {
                                z();
                                g.callbacks.onTotalScroll.call(b[0]);
                            }
                            if (x("onTotalScrollBack") && s[1] <= w && f.cbOffsets[1]) {
                                z();
                                g.callbacks.onTotalScrollBack.call(b[0]);
                            }
                            f.tweenRunning = false;
                            k[0].idleTimer = 0;
                            A(o, "hide");
                        }, a);
                    }
                }
            });
            /* checks if callback function exists */
            function x(a) {
                return f && g.callbacks[a] && typeof g.callbacks[a] === "function";
            }
            /* checks whether callback offsets always trigger */
            function y() {
                return [ g.callbacks.alwaysTriggerOffsets || q >= r[0] + t, g.callbacks.alwaysTriggerOffsets || q <= -u ];
            }
            /* 
			populates object with useful values for the user 
			values: 
				content: this.mcs.content
				content top position: this.mcs.top 
				content left position: this.mcs.left 
				dragger top position: this.mcs.draggerTop 
				dragger left position: this.mcs.draggerLeft 
				scrolling y percentage: this.mcs.topPct 
				scrolling x percentage: this.mcs.leftPct 
				scrolling direction: this.mcs.direction
			*/
            function z() {
                var a = [ k[0].offsetTop, k[0].offsetLeft ], /* content position */
                c = [ o[0].offsetTop, o[0].offsetLeft ], /* dragger position */
                e = [ k.outerHeight(false), k.outerWidth(false) ], /* content length */
                f = [ j.height(), j.width() ];
                /* content parent length */
                b[0].mcs = {
                    content: k,
                    /* original content wrapper as jquery object */
                    top: a[0],
                    left: a[1],
                    draggerTop: c[0],
                    draggerLeft: c[1],
                    topPct: Math.round(100 * Math.abs(a[0]) / (Math.abs(e[0]) - f[0])),
                    leftPct: Math.round(100 * Math.abs(a[1]) / (Math.abs(e[1]) - f[1])),
                    direction: d.dir
                };
            }
        }, /* -------------------- */
        /* 
		CUSTOM JAVASCRIPT ANIMATION TWEEN 
		Lighter and faster than jquery animate() and css transitions 
		Animates top/left properties and includes easings 
		*/
        Y = function(a, c, d, e, f, g, h) {
            if (!a._mTween) {
                a._mTween = {
                    top: {},
                    left: {}
                };
            }
            var h = h || {}, i = h.onStart || function() {}, j = h.onUpdate || function() {}, k = h.onComplete || function() {}, l = Z(), m, n = 0, o = a.offsetTop, p = a.style, q, r = a._mTween[c];
            if (c === "left") {
                o = a.offsetLeft;
            }
            var s = d - o;
            r.stop = 0;
            if (g !== "none") {
                w();
            }
            v();
            function t() {
                if (r.stop) {
                    return;
                }
                if (!n) {
                    i.call();
                }
                n = Z() - l;
                u();
                if (n >= r.time) {
                    r.time = n > r.time ? n + m - (n - r.time) : n + m - 1;
                    if (r.time < n + 1) {
                        r.time = n + 1;
                    }
                }
                if (r.time < e) {
                    r.id = q(t);
                } else {
                    k.call();
                }
            }
            function u() {
                if (e > 0) {
                    r.currVal = x(r.time, o, s, e, f);
                    p[c] = Math.round(r.currVal) + "px";
                } else {
                    p[c] = d + "px";
                }
                j.call();
            }
            function v() {
                m = 1e3 / 60;
                r.time = n + m;
                q = !b.requestAnimationFrame ? function(a) {
                    u();
                    return setTimeout(a, .01);
                } : b.requestAnimationFrame;
                r.id = q(t);
            }
            function w() {
                if (r.id == null) {
                    return;
                }
                if (!b.requestAnimationFrame) {
                    clearTimeout(r.id);
                } else {
                    b.cancelAnimationFrame(r.id);
                }
                r.id = null;
            }
            function x(a, b, c, d, e) {
                switch (e) {
                  case "linear":
                  case "mcsLinear":
                    return c * a / d + b;
                    break;

                  case "mcsLinearOut":
                    a /= d;
                    a--;
                    return c * Math.sqrt(1 - a * a) + b;
                    break;

                  case "easeInOutSmooth":
                    a /= d / 2;
                    if (a < 1) return c / 2 * a * a + b;
                    a--;
                    return -c / 2 * (a * (a - 2) - 1) + b;
                    break;

                  case "easeInOutStrong":
                    a /= d / 2;
                    if (a < 1) return c / 2 * Math.pow(2, 10 * (a - 1)) + b;
                    a--;
                    return c / 2 * (-Math.pow(2, -10 * a) + 2) + b;
                    break;

                  case "easeInOut":
                  case "mcsEaseInOut":
                    a /= d / 2;
                    if (a < 1) return c / 2 * a * a * a + b;
                    a -= 2;
                    return c / 2 * (a * a * a + 2) + b;
                    break;

                  case "easeOutSmooth":
                    a /= d;
                    a--;
                    return -c * (a * a * a * a - 1) + b;
                    break;

                  case "easeOutStrong":
                    return c * (-Math.pow(2, -10 * a / d) + 1) + b;
                    break;

                  case "easeOut":
                  case "mcsEaseOut":
                  default:
                    var f = (a /= d) * a, g = f * a;
                    return b + c * (.499999999999997 * g * f + -2.5 * f * f + 5.5 * g + -6.5 * f + 4 * a);
                }
            }
        }, /* -------------------- */
        /* returns current time */
        Z = function() {
            if (b.performance && b.performance.now) {
                return b.performance.now();
            } else {
                if (b.performance && b.performance.webkitNow) {
                    return b.performance.webkitNow();
                } else {
                    if (Date.now) {
                        return Date.now();
                    } else {
                        return new Date().getTime();
                    }
                }
            }
        }, /* -------------------- */
        /* stops a tween */
        $ = function() {
            var a = this;
            if (!a._mTween) {
                a._mTween = {
                    top: {},
                    left: {}
                };
            }
            var c = [ "top", "left" ];
            for (var d = 0; d < c.length; d++) {
                var e = c[d];
                if (a._mTween[e].id) {
                    if (!b.requestAnimationFrame) {
                        clearTimeout(a._mTween[e].id);
                    } else {
                        b.cancelAnimationFrame(a._mTween[e].id);
                    }
                    a._mTween[e].id = null;
                    a._mTween[e].stop = 1;
                }
            }
        }, /* -------------------- */
        /* deletes a property (avoiding the exception thrown by IE) */
        _ = function(a, b) {
            try {
                delete a[b];
            } catch (c) {
                a[b] = null;
            }
        }, /* -------------------- */
        /* detects left mouse button */
        ab = function(a) {
            return !(a.which && a.which !== 1);
        }, /* -------------------- */
        /* detects if pointer type event is touch */
        bb = function(a) {
            var b = a.originalEvent.pointerType;
            return !(b && b !== "touch" && b !== 2);
        }, /* -------------------- */
        /* checks if value is numeric */
        cb = function(a) {
            return !isNaN(parseFloat(a)) && isFinite(a);
        }, /* -------------------- */
        /* returns element position according to content */
        db = function(a) {
            var b = a.parents(".mCSB_container");
            return [ a.offset().top - b.offset().top, a.offset().left - b.offset().left ];
        };
        /* -------------------- */
        /* 
	----------------------------------------
	PLUGIN SETUP 
	----------------------------------------
	*/
        /* plugin constructor functions */
        a.fn[d] = function(b) {
            /* usage: $(selector).mCustomScrollbar(); */
            if (n[b]) {
                return n[b].apply(this, Array.prototype.slice.call(arguments, 1));
            } else if (typeof b === "object" || !b) {
                return n.init.apply(this, arguments);
            } else {
                a.error("Method " + b + " does not exist");
            }
        };
        a[d] = function(b) {
            /* usage: $.mCustomScrollbar(); */
            if (n[b]) {
                return n[b].apply(this, Array.prototype.slice.call(arguments, 1));
            } else if (typeof b === "object" || !b) {
                return n.init.apply(this, arguments);
            } else {
                a.error("Method " + b + " does not exist");
            }
        };
        /* 
	allow setting plugin default options. 
	usage: $.mCustomScrollbar.defaults.scrollInertia=500; 
	to apply any changed default options on default selectors (below), use inside document ready fn 
	e.g.: $(document).ready(function(){ $.mCustomScrollbar.defaults.scrollInertia=500; });
	*/
        a[d].defaults = g;
        /* 
	add window object (window.mCustomScrollbar) 
	usage: if(window.mCustomScrollbar){console.log("custom scrollbar plugin loaded");}
	*/
        b[d] = true;
        a(b).load(function() {
            a(f)[d]();
            /* add scrollbars automatically on default selector */
            /* extend jQuery expressions */
            a.extend(a.expr[":"], {
                /* checks if element is within scrollable viewport */
                mcsInView: a.expr[":"].mcsInView || function(b) {
                    var c = a(b), d = c.parents(".mCSB_container"), e, f;
                    if (!d.length) {
                        return;
                    }
                    e = d.parent();
                    f = [ d[0].offsetTop, d[0].offsetLeft ];
                    return f[0] + db(c)[0] >= 0 && f[0] + db(c)[0] < e.height() - c.outerHeight(false) && f[1] + db(c)[1] >= 0 && f[1] + db(c)[1] < e.width() - c.outerWidth(false);
                },
                /* checks if element is overflowed having visible scrollbar(s) */
                mcsOverflow: a.expr[":"].mcsOverflow || function(b) {
                    var c = a(b).data(e);
                    if (!c) {
                        return;
                    }
                    return c.overflowed[0] || c.overflowed[1];
                }
            });
        });
    });
})(jQuery, window, document);