///<reference path="../types.d.ts"/>
import {def, defined, cre} from 'app/util'
import {Application} from 'app/application'
import async = require('async');


export function getDefaultDefinitions(App:Application):any {
    var defaultDefinitions:any = {
        simple: [
            ['box', '.box', ['widgets/box'], 'packadicBox'],
            // BS SLIDER
            ['slider', 'input.slider', ['plugins/bs-slider'], 'slider'],
            // BS FILESTYLE
            ['filestyle', 'input[type="file"]', ['plugins/bs-filestyle'], 'filestyle'],
            // SELECTPICKER
            ['selectpicker', '.selectpicker', ['plugins/bs-select'], 'selectpicker'],
            // TOOLTIP
            ['tooltip', '[data-toggle="tooltip"]', ['plugins/bootstrap'], 'bs.tooltip', App.config('plugins.tooltip')],
            // POPOVER
            ['popover', '[data-toggle="popover"]', ['plugins/bootstrap'], 'bs.popover', App.config('plugins.popover'), function ($el) {
                $el.on('click', function (e:JQueryEventObject) {
                    e.preventDefault();
                });
            }],
            // PROGRESSBAR
            ['progressbar', '.progress .progress-bar', ['widgets/progressbar'], 'packadic.progressbar', {}],
            // CONFIRMATION
            ['confirmation', '[data-toggle="confirmation"]', ['plugins/bs-confirmation'], 'bs.confirmation', App.config('plugins.confirmation')],
            // SELECT 2
            ['select2', 'select.select2', ['plugins/select2'], 'select2'],
            // BOOTSTRAP SWITCH
            ['bootstrapSwitch', 'input.switch', ['plugins/bs-switch'], 'bootstrapSwitch'],
            // DATEPICKER INLINE
            ['datepicker', '.datepicker-inline', ['plugins/bs-datepicker'], 'datepicker', {
                todayBtn: true,
                clearBtn: true,
                calendarWeeks: true
            }],
            // DATEPICKER
            ['datepicker', '[data-toggle="datepicker"]', ['plugins/bs-datepicker'], 'datepicker'],
            // MAXLENGTH
            ['maxlength', '.maxLength', ['plugins/bs-maxlength']] // has no data :<
        ],
        custom: [
            function ($el) {
                $el.find('code.hljs').each(function () {
                    var that:HTMLElement = this;
                    var $this:JQuery = $(this);
                    var data:any = $this.data();
                    if (defined(data['hljsInitialized']) && data['hljsInitialized'] == true) {
                        return;
                    }
                    require(['plugins/highlightjs'], function (highlightjs:HighlightJS) {
                        var classes = that.classList;
                        var lang = null;
                        $.each(classes, function (i, className) {
                            if (className.indexOf("lang-") !== -1) {
                                lang = className.replace('lang-', '');
                            }
                        });
                        var highlighted;
                        if(lang !== null && highlightjs.listLanguages().indexOf(lang) !== -1) {
                            highlighted = highlightjs.highlight(lang, that.textContent).value;
                        } else {
                            highlighted = highlightjs.highlightAuto(that.textContent).value;
                        }

                        $this.html(highlighted);
                        $this.attr('data-hljs-initialized', 'true');
                    })
                })
            },
            function ($el) {
                $el.find('input[type="checkbox"], input[type="radio"]').not('.switch').not('.no-icheck').each(function () {
                    var $target = $(this);
                    if (defined($target.data('iCheck'))) {
                        return;
                    }
                    require(['plugins/icheck'], function () {
                        $target.iCheck(App.config('plugins.iCheck'))
                    })
                });

                if ($el.find('form.form-material').length > 0) {
                    require(['plugins/bs-material'], function () {


                        $.material.options = _.merge($.material.options, App.config('plugins.material'));
                        $.material.init();
                    })
                }
            },
            function ($el) {
                var $charts = $el.find('.easy-pie-chart');
                if ($charts.length > 0) {
                    require(['jquery', 'jq/general', 'plugins/easypiechart'], function ($) {
                        $charts.each(function () {
                            var $chart = $(this);
                            if($chart.find('> .easyPieChart').length !== 0) return;
                            var classes = $chart.get(0).classList;
                            var data = _.merge({
                                animate: 1000,
                                size: 85,
                                onStep: function (value) {
                                    $(this).find('span').text(~~value);
                                },
                                barColor: App.colors['blue']
                            }, $chart.data());
                            data = _.merge(data, App.config('plugins.easyPieChart'));
                            var $percentage = cre().addClass('percentage').attr('data-percent', data['percent']);
                            $percentage.append(cre('span').text(data['percent'])).append('%');
                            $chart.append($percentage);

                            if (defined(data['label'])) {
                                $chart.append(
                                    cre().addClass('label').text(data['label'])
                                );
                                delete data['label'];
                            }

                            delete data['percent'];
                            App.colorizeDataOption(data, ['barColor', 'trackColor', 'scaleColor']);
                            $percentage.easyPieChart(data).css({'margin': '0px 15px'});
                        });
                    });
                }
            },
            function ($el) {
                var $scrollable = $el.find('.scrollable');
                require(['spawner', 'plugins/jquery-slimscroll'], function (spawner) {
                    if (!$(this).parent().hasClass('slimScrollDiv')) {
                        spawner.initSlimScroll($scrollable);
                    }
                });
            }
        ]
    };

    return defaultDefinitions;
}

export interface IAutoloaderDefinition {
    fnName:string;
    selector:string;
    requires:Array<string>;
    dataName?:string;
    options?:Object;
    preInitFn?:Function
}

export class Autoload {

    private _simple:Array<IAutoloaderDefinition>;
    private _custom:Array<Object>;

    constructor() {
        this._simple = [];
        this._custom = [];
    }

    public add(fnName:string, selector:string, requires:Array<string>, dataName?:string, options?:Object, preInitFn?:Function):Autoload {
        this._simple.push({
            fnName: fnName,
            selector: selector,
            requires: requires,
            dataName: def(dataName, fnName),
            options: def(options, {}),
            preInitFn: preInitFn
        });

        return this;
    }

    public addSimple(definition:IAutoloaderDefinition):Autoload {
        var args = [];
        for (var o in definition) {
            args.push(definition[o]);
        }
        this.add.apply(this, args);
        return this;
    }

    public addCustom(customFn:Function):Autoload {
        this._custom.push(customFn);
        return this
    }

    public addDefaultDefinitions(App:Application):Autoload {

        var self:Autoload = this;
        require(['jquery'], function ($) {
            $.each(getDefaultDefinitions(App).simple, function (index:number, definition:IAutoloaderDefinition) {
                self.addSimple(definition);
            });
            $.each(getDefaultDefinitions(App).custom, function (index:number, customFn:Function) {
                self.addCustom(customFn);
            });
        });
        return this;
    }


    public scan($el:JQuery, callback?:Function) {

        var self:Autoload = this;
        var detected = [];

        require(['jquery'], function ($) {
            $.each(self._simple, function (index, data) {
                $el.find(data.selector).each(function () {
                    var $target = $(this);

                    // skip if already initialized
                    if (defined($target.data(data.dataName))) {
                        return;
                    }

                    // allow strings, will be transformed to array
                    //var requires:Array<any> = typeof data.requires !== 'array' ? [data.requires] : data.requires;

                    detected.push(function (cb) {
                        // require the plugin
                        require(data.requires, function () {
                            // If defined, call the pre init function that allows altering the target before initialisation
                            if (typeof data.preInitFn === 'function') {
                                var retval = data.preInitFn($target, data);
                                if (defined(retval)) data = retval;
                            }

                            // and initialize target element with the plugin
                            $target[data.fnName](data.options);
                            cb(null);
                        });
                    });
                });
            });

            $.each(self._custom, function (index:number, customFn:Function) {
                detected.push(function (cb) {
                    customFn($el);
                    cb();
                })
            });
            if (detected.length > 0) {
                async.parallel(detected, function (err:any, results:Object) {
                    if (defined(callback)) {
                        callback(err, results);
                    }
                })
            } else {
                if (defined(callback)) {
                    callback(null, {});
                }
            }
        });

    }
}
