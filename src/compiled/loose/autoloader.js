define(["require", "exports", 'core/util', 'async'], function (require, exports, util_1, async) {
    function getDefaultDefinitions(App) {
        var defaultDefinitions = {
            simple: [
                ['box', '.box', ['widgets'], 'packadicBox'],
                ['slider', 'input.slider', ['plugins/bs-slider'], 'slider'],
                ['filestyle', 'input[type="file"]', ['plugins/bs-filestyle'], 'filestyle'],
                ['selectpicker', '.selectpicker', ['plugins/bs-select'], 'selectpicker'],
                ['tooltip', '[data-toggle="tooltip"]', ['plugins/bootstrap'], 'bs.tooltip', App.config('plugins.tooltip')],
                ['popover', '[data-toggle="popover"]', ['plugins/bootstrap'], 'bs.popover', App.config('plugins.popover'), function ($el) {
                        $el.on('click', function (e) {
                            e.preventDefault();
                        });
                    }],
                ['progressbar', '.progress .progress-bar', ['plugins/bs-progressbar'], 'bs.progressbar', {}, function ($el, data) {
                        data.options.display_text = $el.data('display-text') || 'none';
                        data.options.use_percentage = $el.data('use-percentage') || false;
                        return data;
                    }],
                ['confirmation', '[data-toggle="confirmation"]', ['plugins/bs-confirmation'], 'bs.confirmation', App.config('plugins.confirmation')],
                ['select2', 'select.select2', ['plugins/select2'], 'select2'],
                ['bootstrapSwitch', 'input.switch', ['plugins/bs-switch'], 'bootstrapSwitch'],
                ['datepicker', '.datepicker-inline', ['plugins/bs-datepicker'], 'datepicker', {
                        todayBtn: true,
                        clearBtn: true,
                        calendarWeeks: true
                    }],
                ['datepicker', '[data-toggle="datepicker"]', ['plugins/bs-datepicker'], 'datepicker'],
                ['maxlength', '.maxLength', ['plugins/bs-maxlength']]
            ],
            custom: [
                function ($el) {
                    $el.find('input[type="checkbox"], input[type="radio"]').not('.switch').not('.no-icheck').each(function () {
                        var $target = $(this);
                        if (util_1.defined($target.data('iCheck'))) {
                            return;
                        }
                        require(['plugins/icheck'], function () {
                            $target.iCheck(App.config('plugins.iCheck'));
                        });
                    });
                    if ($el.find('form.form-material').length > 0) {
                        require(['plugins/bs-material'], function () {
                            $.material.options = _.merge($.material.options, App.config('plugins.material'));
                            $.material.init();
                        });
                    }
                },
                function ($el) {
                    var $charts = $el.find('.easy-pie-chart');
                    if ($charts.length > 0) {
                        require(['jquery', 'jq/general', 'plugins/easypiechart'], function ($) {
                            $charts.each(function () {
                                var $chart = $(this);
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
                                var $percentage = util_1.cre().addClass('percentage').attr('data-percent', data['percent']);
                                $percentage.append(util_1.cre('span').text(data['percent'])).append('%');
                                $chart.append($percentage);
                                if (util_1.defined(data['label'])) {
                                    $chart.append(util_1.cre().addClass('label').text(data['label']));
                                    delete data['label'];
                                }
                                delete data['percent'];
                                App.colorizeDataOption(data, ['barColor', 'trackColor', 'scaleColor']);
                                $percentage.easyPieChart(data).css({ 'margin': '0px 15px' });
                            });
                        });
                    }
                },
                function ($el) {
                    var $scrollable = $el.find('.scrollable');
                    require(['theme'], function (theme) {
                        theme.destroySlimScroll($scrollable);
                        theme.initSlimScroll($scrollable);
                    });
                }
            ]
        };
        return defaultDefinitions;
    }
    exports.getDefaultDefinitions = getDefaultDefinitions;
    var Autoload = (function () {
        function Autoload() {
            this._simple = [];
            this._custom = [];
        }
        Autoload.prototype.add = function (fnName, selector, requires, dataName, options, preInitFn) {
            this._simple.push({
                fnName: fnName,
                selector: selector,
                requires: requires,
                dataName: util_1.def(dataName, fnName),
                options: util_1.def(options, {}),
                preInitFn: preInitFn
            });
            return this;
        };
        Autoload.prototype.addSimple = function (definition) {
            var args = [];
            for (var o in definition) {
                args.push(definition[o]);
            }
            this.add.apply(this, args);
            return this;
        };
        Autoload.prototype.addCustom = function (customFn) {
            this._custom.push(customFn);
            return this;
        };
        Autoload.prototype.addDefaultDefinitions = function (App) {
            var self = this;
            $.each(getDefaultDefinitions(App).simple, function (index, definition) {
                self.addSimple(definition);
            });
            $.each(getDefaultDefinitions(App).custom, function (index, customFn) {
                self.addCustom(customFn);
            });
            return this;
        };
        Autoload.prototype.scan = function ($el, callback) {
            var self = this;
            var detected = [];
            require(['jquery'], function ($) {
                $.each(self._simple, function (index, data) {
                    $el.find(data.selector).each(function () {
                        var $target = $(this);
                        if (util_1.defined($target.data(data.dataName))) {
                            return;
                        }
                        detected.push(function (cb) {
                            require(data.requires, function () {
                                if (typeof data.preInitFn === 'function') {
                                    var retval = data.preInitFn($target, data);
                                    if (util_1.defined(retval))
                                        data = retval;
                                }
                                $target[data.fnName](data.options);
                                cb(null);
                            });
                        });
                    });
                });
                $.each(self._custom, function (index, customFn) {
                    detected.push(function (cb) {
                        customFn($el);
                        cb();
                    });
                });
                if (detected.length > 0) {
                    async.parallel(detected, function (err, results) {
                        if (util_1.defined(callback)) {
                            callback(err, results);
                        }
                    });
                }
                else {
                    if (util_1.defined(callback)) {
                        callback(null, {});
                    }
                }
            });
        };
        return Autoload;
    })();
    exports.Autoload = Autoload;
});
