define([
    'jquery', 'fn/defined', 'fn/default', 'fn/cre', 'plugins/async'
], function ($, defined, def, cre, async) {
    "use strict";

    var packadic = (window.packadic = window.packadic || {});


    /**
     * Scans the DOM for autoloading plugins/modules
     * @exports autoload
     */
    var autoload = {};

    autoload._plugins = [];
    autoload._custom = [];

    /**
     * Add a autoloader to the stack.
     * @param {string} fnName       - The plugin function name to call
     * @param {string} selector     - The selector(s) to search for, if found, the plugin will be loaded into it
     * @param {Array} requires      - If the plugin is found, before calling the function it will first requirejs the given modules
     * @param {string} dataName     - The name of the jq data properties. Will be used to check if the plugin is already loaded on the element or not
     * @param {object} [options]    - Plugin configuration options
     * @param {function} [preInitFn] - Optional function can be passed, will be called before initialisation
     * @returns {{}}
     * @example
     * autoload.add('tooltip', '[data-toggle="tooltip"]', ['plugins/bootstrap'], 'bs.tooltip', {container: 'body'});
     * autoload.scan($('body'));
     */
    autoload.add = function (fnName, selector, requires, dataName, options, preInitFn) {
        autoload._plugins.push({
            fnName   : fnName,
            selector : selector,
            requires : requires,
            dataName : def(dataName, fnName),
            options  : def(options, {}),
            preInitFn: preInitFn
        });
        return autoload;
    };

    /**
     * Add a autoloader with custom logic
     * @param customFn
     * @returns {{}}
     * @example
     *  autoloader.addCustom(function ($el) {
     *      var $charts = $el.find('.easy-pie-chart');
     *      if ( $charts.length > 0 ) {
     *          require(['jquery', 'plugins/easypiechart'], function ($) {
     *              $el.easyPieChart();
     *          });
     *      }
     *  });
     */
    autoload.addCustom = function (customFn) {
        autoload._custom.push(customFn);
        return autoload;
    };

    /**
     * Scan the given element recursively and load any non-loaded plugins
     * @param {object} $el - The jQuery element object
     * @param {function} [callback] - The callback, will be executed after all operations are done
     */
    autoload.scan = function ($el, callback) {


        var detected = [];

        $.each(autoload._plugins, function (index, data) {
            $el.find(data.selector).each(function () {
                var $target = $(this);

                // skip if already initialized
                if ( defined($target.data(data.dataName)) ) {
                    return;
                }

                // allow strings, will be transformed to array
                var requires = typeof data.requires === 'string' ? [data.requires] : data.requires;

                detected.push(function (cb) {
                    // require the plugin
                    require(requires, function () {
                        // If defined, call the pre init function that allows altering the target before initialisation
                        if ( typeof data.preInitFn === 'function' ) {
                            var retval = data.preInitFn($target, data);
                            if ( defined(retval) ) data = retval;
                        }

                        // and initialize target element with the plugin
                        $target[data.fnName](data.options);
                        cb(null);
                    });
                });
            });
        });

        $.each(autoload._custom, function (index, customFn) {
            customFn($el);
        });

        if ( detected.length > 0 ) {
            async.parallel(detected, function (err, results) {
                if ( defined(callback) ) {
                    callback(err, results);
                }
            })
        } else {
            if ( defined(callback) ) {
                callback(null, {});
            }
        }
    };

    (function addCustoms() {

        autoload
            // FORM STUFF
            .addCustom(function ($el) {
                $el.find('form').not(".form-material").find(" input[type='file']").not('.switch').not('.no-uniform').each(function () {
                    return; // OFF
                    var $target = $(this);
                    if ( defined($target.data('uniformed')) ) {
                        return;
                    }
                    require(['plugins/uniform'], function () {
                        $target.uniform();
                    })
                });

                $el.find('input[type="checkbox"], input[type="radio"]').not('.switch').not('.no-icheck').each(function(){
                    var $target = $(this);
                    if ( defined($target.data('iCheck')) ) {
                        return;
                    }
                    require(['plugins/icheck'],function(){
                        $target.iCheck({
                            checkboxClass: 'icheckbox_square-blue',
                            radioClass: 'iradio_square-blue',
                            //increaseArea: '20%' // optional
                        })
                    })
                });

                if ( $el.find('form.form-material').length > 0 ) {
                    require(['plugins/bs-material'], function () {
                        $.material.options = _.merge($.material.options, {
                            "ripples": false,
                            "withRipples"         : [
                                "a:not(.withoutripple)",
                                "button:not(.withoutripple)",
                                ".btn:not(.btn-link)",
                                ".card-image",
                                ".navbar a:not(.withoutripple)",
                                ".dropdown-menu a",
                                ".nav-tabs a:not(.withoutripple)",
                                ".withripple"
                            ].join(","),
                            autofill              : true,
                            "inputElements"       : "form.form-material input.form-control, form.form-material textarea.form-control, form.form-material select.form-control",
                            "checkboxElements"    : "form.form-material .checkbox > label > input[type=checkbox]",
                            "togglebuttonElements": "form.form-material .togglebutton > label > input[type=checkbox]",
                            "radioElements"       : "form.form-material .radio > label > input[type=radio]"
                        });
                        $.material.init();
                    })
                }

            })

            .addCustom(function ($el) {
                var $charts = $el.find('.easy-pie-chart');
                if ( $charts.length > 0 ) {
                    require(['theme', 'jq/general', 'plugins/easypiechart'], function (theme) {
                        $charts.each(function () {
                            var $chart = $(this);
                            var classes = $chart.get(0).classList;
                            var data = _.merge({
                                animate : 1000,
                                onStep  : function (value) {
                                    this.$el.find('span').text(~ ~ value);
                                },
                                barColor: theme.colors['blue'],
                                size    : 85
                            }, $chart.data());

                            var $percentage = cre()
                                .addClass('percentage')
                                .attr('data-percent', data['percent'])
                                .append(cre('span').text(data['percent']))
                                .append('%');

                            $chart.append($percentage);

                            if ( defined(data['label']) ) {
                                $chart.append(
                                    cre().addClass('label').text(data['label'])
                                );
                                delete data['label'];
                            }

                            delete data['percent'];

                            function colorizeDataOption(dataObj, keys){
                                if(typeof(keys) === 'string') {
                                    keys = [keys];
                                }
                                $.each(keys, function(i, name){
                                    if(defined(dataObj[name])) {
                                        dataObj[name] = theme.colors[dataObj[name]];
                                    }
                                });
                                return dataObj;
                            }

                            colorizeDataOption(data, ['barColor', 'trackColor', 'scaleColor']);

                            $percentage.easyPieChart(data).css({ 'margin': '0px 15px' });
                        });
                    });
                }
            })

            .addCustom(function($el){
                var $scrollable = $el.find('.scrollable');
                require(['theme'], function(theme){
                    theme.destroySlimScroll($scrollable);
                    theme.initSlimScroll($scrollable);
                });
            });


    }.call());

    (function addPlugins() {
        autoload
            // BS SLIDER
            .add('slider', 'input.slider', ['plugins/bs-slider'], 'slider')
            // BS FILESTYLE
            .add('filestyle', 'input[type="file"]', ['plugins/bs-filestyle'], 'filestyle')
            // SELECTPICKER
            .add('selectpicker', '.selectpicker', ['plugins/bs-select'], 'selectpicker')

            // M CUSTOM SCROLLLBAR
            //.add('mCustomScrollbar', '.scrollable', [ 'plugins/mscrollbar' ], 'mCS', {theme: 'dark'}, function( $el ){
            //    $el.addClass('mCustomScrollbar');
            //})

            //.add('box', '.box', ['jq/box'], 'packadicBox')

            // TOOLTIP
            .add('tooltip', '[data-toggle="tooltip"]', ['plugins/bootstrap'], 'bs.tooltip', {container: 'body'})

            // POPOVER
            .add('popover', '[data-toggle="popover"]', ['plugins/bootstrap'], 'bs.popover', {container: 'body'}, function ($el) {
                $el.on('click', function (e) {
                    e.preventDefault();
                });
            })

            .add('progressbar', '.progress .progress-bar', ['plugins/bs-progressbar'], 'bs.progressbar', {}, function ($el, data) {
                data.options.display_text = $el.data('display-text') || 'none';
                data.options.use_percentage = $el.data('use-percentage') || false;
                return data;
            })

            // CONFIRMATION
            .add('confirmation', '[data-toggle="confirmation"]', ['plugins/bs-confirmation'], 'bs.confirmation', {
                container     : 'body',
                btnCancelIcon : 'fa fa-remove',
                btnOkIcon     : 'fa fa-check',
                btnOkClass    : 'btn-xs btn-info',
                btnCancelClass: 'btn-xs btn-primary'
            })

            // SELECT 2
            .add('select2', 'select.select2', ['plugins/select2'], 'select2')

            // BOOTSTRAP SWITCH
            .add('bootstrapSwitch', 'input.switch', ['plugins/bs-switch'], 'bootstrapSwitch')

            // DATEPICKER INLINE
            .add('datepicker', '.datepicker-inline', ['plugins/bs-datepicker'], 'datepicker', {
                todayBtn     : true,
                clearBtn     : true,
                calendarWeeks: true
            })

            // DATEPICKER
            .add('datepicker', '[data-toggle="datepicker"]', ['plugins/bs-datepicker'], 'datepicker')

            // MAXLENGTH
            .add('maxlength', '.maxLength', ['plugins/bs-maxlength']); // has no data :<

        //
        //.add();


    }.call());

    return autoload;
});
