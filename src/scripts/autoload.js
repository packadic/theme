define([
    'jquery', 'fn/defined', 'fn/default', 'fn/cre', 'plugins/async'
], function( $, defined, def, cre, async ){
    "use strict";

    var packadic = (window.packadic = window.packadic || {});
    var autoload = {};

    autoload._plugins = [];
    autoload._custom = [];

    autoload.add = function( fnName, selector, requires, dataName, options, preInitFn ){
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

    autoload.addCustom = function( customFn ){
        autoload._custom.push(customFn);
        return autoload;
    };

    autoload.scan = function( $el, callback ){


        var detected = [];

        $.each(autoload._plugins, function( index, data ){
            $el.find(data.selector).each(function(){
                var $target = $(this);

                // skip if already initialized
                if( defined($target.data(data.dataName)) ){
                    return;
                }

                // allow strings, will be transformed to array
                var requires = typeof data.requires === 'string' ? [ data.requires ] : data.requires;

                detected.push(function( cb ){
                    // require the plugin
                    require(requires, function(){
                        // If defined, call the pre init function that allows altering the target before initialisation
                        if( typeof data.preInitFn === 'function' ){
                            var retval = data.preInitFn($target, data);
                            if( defined(retval) ) data = retval;
                        }

                        // and initialize target element with the plugin
                        $target[ data.fnName ](data.options);
                        cb(null);
                    });
                });
            });
        });

        $.each(autoload._custom, function( index, customFn ){
            customFn($el);
        });

        if( detected.length > 0 ){
            async.parallel(detected, function( err, results ){
                if( defined(callback) ){
                    callback(err, results);
                }
            })
        } else {
            if( defined(callback) ){
                callback(null, {});
            }
        }
    };

    (function addCustoms(){

        autoload
            // UNIFORM
            .addCustom(function( $el ){
                $el.find('form').not(".form-material").find("input[type='checkbox'], input[type='file'], input[type='radio']").not('.switch').each(function(){
                    var $target = $(this);
                    if( defined($target.data('uniformed')) ){
                        return;
                    }
                    require([ 'plugins/uniform' ], function(){
                        $target.uniform();
                    })
                });

                if($el.find('form.form-material').length > 0)
                {
                    require(['plugins/bs-material'], function(){
                        $.material.init({
                            "withRipples": [
                                "a:not(.withoutripple)",
                                "button:not(.withoutripple)",
                                ".btn:not(.btn-link)",
                                ".card-image",
                                ".navbar a:not(.withoutripple)",
                                ".dropdown-menu a",
                                ".nav-tabs a:not(.withoutripple)",
                                ".withripple"
                            ].join(","),
                            autofill: true,
                            "inputElements": "form.form-material input.form-control, form.form-material textarea.form-control, form.form-material select.form-control",
                            "checkboxElements": "form.form-material .checkbox > label > input[type=checkbox]",
                            "togglebuttonElements": "form.form-material .togglebutton > label > input[type=checkbox]",
                            "radioElements": "form.form-material .radio > label > input[type=radio]"
                        });
                    })
                }

            });


    }.call());

    (function addPlugins(){
        autoload
            // SELECTPICKER
            .add('selectpicker', '.selectpicker', [ 'plugins/bs-select' ], 'selectpicker')

            // M CUSTOM SCROLLLBAR
            //.add('mCustomScrollbar', '.scrollable', [ 'plugins/mscrollbar' ], 'mCS', {theme: 'dark'}, function( $el ){
            //    $el.addClass('mCustomScrollbar');
            //})

            // TOOLTIP
            .add('tooltip', '[data-toggle="tooltip"]', [ 'plugins/bootstrap' ], 'bs.tooltip', {container: 'body'})

            // POPOVER
            .add('popover', '[data-toggle="popover"]', [ 'plugins/bootstrap' ], 'bs.popover', {container: 'body'}, function( $el ){
                $el.on('click', function( e ){
                    e.preventDefault();
                });
            })

            .add('progressbar', '.progress .progress-bar', ['plugins/bs-progressbar'], 'bs.progressbar', {}, function($el, data){
                data.options.display_text = $el.data('display-text') || 'none';
                data.options.use_percentage = $el.data('use-percentage') || false;
                return data;
            })

            // CONFIRMATION
            .add('confirmation', '[data-toggle="confirmation"]', [ 'plugins/bs-confirmation' ], 'bs.confirmation', {
                container     : 'body',
                btnCancelIcon : 'fa fa-remove',
                btnOkIcon     : 'fa fa-check',
                btnOkClass    : 'btn-xs btn-info',
                btnCancelClass: 'btn-xs btn-primary'
            })

            // SELECT 2
            .add('select2', 'select.select2', [ 'plugins/select2' ], 'select2')

            // BOOTSTRAP SWITCH
            .add('bootstrapSwitch', 'input.switch', [ 'plugins/bs-switch' ], 'bootstrapSwitch')

            // DATEPICKER INLINE
            .add('datepicker', '.datepicker-inline', [ 'plugins/bs-datepicker' ], 'datepicker', {
                todayBtn     : true,
                clearBtn     : true,
                calendarWeeks: true
            })

            // DATEPICKER
            .add('datepicker', '[data-toggle="datepicker"]', [ 'plugins/bs-datepicker' ], 'datepicker')

            // MAXLENGTH
            .add('maxlength', '.maxLength', [ 'plugins/bs-maxlength' ]); // has no data :<

        //
        //.add();


    }.call());

    return autoload;
});
