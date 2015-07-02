///<reference path="types.d.ts"/>
import $ = require('jquery');
import {defined, def, cre} from 'app/util';

var App = window['App'];

export function scrollable($el) {
    require(['plugins/mscrollbar'], function () {
        $.mCustomScrollbar.defaults.theme = 'dark';
        $el.addClass('mCustomScrollbar').mCustomScrollbar();
    });
}

export function toastr(fnName, message, title) {
    require(['plugins/toastr'], function (toastr) {
        toastr[fnName].apply(toastr, [message, title]);
    });
}

export function alert(opt:any) {
    var type:string = def(opt.type, 'success'),
        message:string = def(opt.message, ''),
        delay:number = def(opt.delay, 3000),
        title:string | boolean = def(opt.title, false),
        target:string = def(opt.target, 'main > div.content'),
        insertFnName:string = def(opt.insertFnName, 'prepend');

    var $alert:JQuery = cre('div');
    var $close:JQuery = cre('button');

    $alert
        .addClass('alert alert-' + type + ' alert-dismissible')
        .append($close
            .attr('type', 'button')
            .attr('data-dismiss', 'alert')
            .attr('aria-label', 'Close')
            .addClass('close')
            .html('<span aria-hidden="true">×</span>'));

    if (title !== false) {
        $alert.append(cre('strong').text(title));
    }

    $alert.append(cre('p').text(message));

    $('main > div.content').first()[insertFnName]($alert);
    setTimeout(function () {
        $alert.hide('slow');
        $alert.fadeOut('slow');
    }, delay);
}


export function initSlimScroll(el, opts) {
    require(['plugins/jquery-slimscroll'], function () {
        $(el).each(function () {
            if ($(this).attr("data-initialized")) {
                return; // exit
            }
            var height = $(this).attr("data-height") ? $(this).attr("data-height") : $(this).css('height');
            if (!defined(opts)) {
                opts = {};
            }
            var data = _.merge(App.config('plugins.slimScroll'), $(this).data());
            $(this).slimScroll(_.merge(data, opts));
            $(this).attr("data-initialized", "1");
        });
    });
}

export function destroySlimScroll(el) {
    $(el).each(function () {
        if ($(this).attr("data-initialized") === "1") { // destroy existing instance before updating the height
            $(this).removeAttr("data-initialized");
            $(this).removeAttr("style");

            var attrList = {};

            // store the custom attribures so later we will reassign.
            if ($(this).attr("data-handle-color")) {
                attrList["data-handle-color"] = $(this).attr("data-handle-color");
            }
            if ($(this).attr("data-wrapper-class")) {
                attrList["data-wrapper-class"] = $(this).attr("data-wrapper-class");
            }
            if ($(this).attr("data-rail-color")) {
                attrList["data-rail-color"] = $(this).attr("data-rail-color");
            }
            if ($(this).attr("data-always-visible")) {
                attrList["data-always-visible"] = $(this).attr("data-always-visible");
            }
            if ($(this).attr("data-rail-visible")) {
                attrList["data-rail-visible"] = $(this).attr("data-rail-visible");
            }

            $(this).slimScroll({
                wrapperClass: ($(this).attr("data-wrapper-class") ? $(this).attr("data-wrapper-class") : 'slimScrollDiv'),
                destroy: true
            });

            var the = $(this);

            // reassign custom attributes
            $.each(attrList, function (key, value) {
                the.attr(key, value);
            });
        }
    });
}
