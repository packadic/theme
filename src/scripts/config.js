/*
 * CONFIG
 */
(function Config() {

    var jqui = ['accordion', 'autocomplete', 'button', 'core', 'datepicker', 'dialog', 'draggable', 'droppable', 'effect-blind', 'effect-bounce', 'effect-clip', 'effect-drop', 'effect-explode', 'effect-fade', 'effect-fold', 'effect-highlight', 'effect', 'effect-puff', 'effect-pulsate', 'effect-scale', 'effect-shake', 'effect-size', 'effect-slide', 'effect-transfer', 'menu', 'mouse', 'position', 'progressbar', 'resizable', 'selectable', 'selectmenu', 'slider', 'sortable', 'spinner', 'tabs', 'tooltip', 'widget'];
    var tweendeps = ['plugins/gsap/css']; //, 'plugins/gsap/ease', 'plugins/gsap/attr', 'plugins/gsap/scroll' ];

    var config = {
        debug                 : false,
        pageLoadedOnAutoloaded: true,
        plugins               : {
            blockUI          : {
                message: '<img src="<%= paths.images %>/loaders/spiffygif_104x104.gif" style="height: 30px; width: 30px;">'
            },
            confirmation     : {
                container     : 'body',
                btnCancelIcon : 'fa fa-remove',
                btnOkIcon     : 'fa fa-check',
                btnOkClass    : 'btn-xs btn-info',
                btnCancelClass: 'btn-xs btn-primary'
            },
            iCheck           : {
                checkboxClass: 'icheckbox_square-blue',
                radioClass   : 'iradio_square-blue',
                //increaseArea: '20%' // optional
            },
            material         : {
                "ripples"             : false,
                autofill              : true,
                "inputElements"       : "form.form-material input.form-control, form.form-material textarea.form-control, form.form-material select.form-control",
                "checkboxElements"    : "form.form-material .checkbox > label > input[type=checkbox]",
                "togglebuttonElements": "form.form-material .togglebutton > label > input[type=checkbox]",
                "radioElements"       : "form.form-material .radio > label > input[type=radio]"
            },
            easyPieChart     : {
                animate: 1000,
                size   : 85
            },
            tooltip          : {container: 'body'},
            popover          : {container: 'body'},
            slimScroll       : {
                allowPageScroll: true,
                size           : '6px',
                color          : '#000',
                wrapperClass   : 'slimScrollDiv',
                railColor      : '#222',
                position       : 'right',
                height         : '200px',
                alwaysVisible  : false,
                railVisible    : true,
                disableFadeOut : true
            },
            toastr           : {
                "closeButton"      : true,
                "debug"            : false,
                "newestOnTop"      : false,
                "progressBar"      : true,
                "positionClass"    : "toast-top-right",
                "preventDuplicates": false,
                "onclick"          : null,
                "showDuration"     : "300",
                "hideDuration"     : "1000",
                "timeOut"          : "5000",
                "extendedTimeOut"  : "1000",
                "showEasing"       : "swing",
                "hideEasing"       : "linear",
                "showMethod"       : "fadeIn",
                "hideMethod"       : "fadeOut"
            },
            summernote       : { // http://summernote.org/jsduck/source/settings.html#settings-property-options
                defaultFontName: 'Verdana',
                tabsize        : 4,
                codemirror     : {
                    theme: 'monokai'
                }
            },
            'jquery-validate': {
                errorElement  : 'span',
                errorClass    : 'help-block help-block-error',
                focusInvalid  : false,
                highlight     : function (element) {
                    var $el = $(element);
                    $el.closest(
                        $el.parent(".input-group").size() > 0 ? '.input-group' : '.form-group'
                    ).addClass('has-error');
                },
                unhighlight   : function (element) {
                    var $el = $(element);
                    $el.closest(
                        $el.parent(".input-group").size() > 0 ? '.input-group' : '.form-group'
                    ).removeClass('has-error');
                },
                success       : function (label) {
                    label.closest('.form-group').removeClass('has-error');
                },
                errorPlacement: function (error, element) {
                    if ( element.parent(".input-group").size() > 0 ) {
                        $('<div>').addClass('has-error').insertAfter(element.parent(".input-group")).append(error);
                    } else if ( element.attr("data-error-container") ) {
                        error.appendTo(element.attr("data-error-container"));
                    } else if ( element.parents('.radio-list').size() > 0 ) {
                        error.appendTo(element.parents('.radio-list').attr("data-error-container"));
                    } else if ( element.parents('.radio-inline').size() > 0 ) {
                        error.appendTo(element.parents('.radio-inline').attr("data-error-container"));
                    } else if ( element.parents('.checkbox-list').size() > 0 ) {
                        error.appendTo(element.parents('.checkbox-list').attr("data-error-container"));
                    } else if ( element.parents('.checkbox-inline').size() > 0 ) {
                        error.appendTo(element.parents('.checkbox-inline').attr("data-error-container"));
                    } else if(element.data('pwstrengthBootstrap')){
                        error.appendTo(element.parent());
                    } else {
                        error.insertAfter(element); // for other inputs, just perform default behavior
                    }
                }
            }
        },
        paths                 : {
            assets : '/assets',
            images : '<%= paths.assets %>/images',
            scripts: '<%= paths.assets %>/scripts',
            fonts  : '<%= paths.assets %>/fonts',
            styles : '<%= paths.assets %>/styles'
        },
        scss                  : {},
        layout                : {
            mode   : 'fluid',// fluid, boxed
            bottom : 'fixed', // normal, hidden, fixed
            top    : 'normal', // normal, fixed
            sidebar: {
                enabled : true,
                mode    : 'accordion', // accordion, hover
                position: 'left',
                style   : 'dark',
                fixed   : false // normal, fixed
            }

        },
        widgets               : {
            box    : {},
            sidebar: {
                hidden           : false,
                items            : null,
                resolveActive    : true,
                openCloseDuration: 600,
                openedWidth      : 235,
                closedWidth      : 45,
                autoScroll       : true,
                slideSpeed       : 200,
                keepExpanded     : false,
                toggler          : '.sidebar-toggler'
            }
        },
        requireJS             : {
            baseUrl: '<%= paths.scripts %>',

            paths: {
                'cjs'              : 'plugins/cjs/cjs',
                'amd-loader'       : 'plugins/amd-loader/amd-loader',
                // custom build with jsbuild
                'jquery'           : 'plugins/jquery/dist/jquery.min',
                'plugins/bootstrap': 'plugins/bootstrap.custom.min',
                'jquery-ui'        : 'plugins/jquery-ui/ui',

                // dont prefix jade, template amd loader require it, same as jquery
                'jade'       : 'plugins/jade/runtime',
                'string'     : 'plugins/underscore.string/dist/underscore.string.min',
                'code-mirror': 'plugins/requirejs-codemirror/src/code-mirror',
                'ace'        : 'plugins/ace/lib/ace',
                'ace-build'  : 'plugins/ace-builds/src-min',
                'Q'          : 'plugins/q/q',

                'jsonp': 'plugins/browser-jsonp/lib/jsonp.min',

                // custom uglified and moved
                'plugins/bootbox'   : 'plugins/bootbox',
                'plugins/modernizr' : 'plugins/modernizr',
                'plugins/mscrollbar': 'plugins/mscrollbar',

                // default vendor paths
                'plugins/async'                  : 'plugins/async/lib/async',
                'plugins/svg'                    : 'plugins/svg.js/dist/svg',
                'plugins/moment'                 : 'plugins/moment/min/moment.min',
                'plugins/select2'                : 'plugins/select2/select2.min',
                'plugins/marked'                 : 'plugins/marked/marked.min',
                'plugins/highlightjs'            : 'plugins/highlightjs/highlight.pack',
                'plugins/cryptojs'               : 'plugins/cryptojslib/components',
                'plugins/toastr'                 : 'plugins/toastr/toastr',
                'plugins/events'                 : 'plugins/eventEmitter/EventEmitter.min',
                'plugins/github-api'             : 'plugins/github-api/github',
                'plugins/oauth2'                 : 'plugins/javascript-oauth2/oauth2/oauth2',
                'plugins/oauth-io'               : 'plugins/oauth.io/dist/oauth.min',
                'plugins/md5'                    : 'plugins/blueimp-md5/js/md5.min',
                'plugins/pace'                   : 'plugins/pace/pace.min',
                'plugins/speakingurl'            : 'plugins/speakingurl/speakingurl.min',
                'plugins/icheck'                 : 'plugins/iCheck/icheck.min',
                'plugins/blockui'                : 'plugins/blockui/jquery.blockUI',
                'plugins/jstree'                 : 'plugins/jstree/dist/jstree.min',
                // jquery
                'plugins/jquery-rest'            : 'plugins/jquery.rest/dist/1/jquery.rest.min',
                'plugins/jquery-migrate'         : 'plugins/jquery-migrate/jquery-migrate',
                'plugins/jquery-slimscroll'      : 'plugins/jquery-slimscroll/jquery.slimscroll.min',
                'plugins/jquery-slugify'         : 'plugins/jquery-slugify/dist/slugify.min',
                'plugins/jquery-validate'        : 'plugins/jquery.validate/dist/jquery.validate.min',
                'plugins/mousewheel'             : 'plugins/jquery-mousewheel/jquery.mousewheel.min',
                'plugins/uniform'                : 'plugins/jquery.uniform/jquery.uniform.min',
                'plugins/impromptu'              : 'plugins/jquery-impromptu/dist/jquery-impromptu.min',
                'plugins/cookie'                 : 'plugins/jquery-cookie/jquery.cookie',
                'plugins/validation'             : 'plugins/jquery-form-validator/form-validator/jquery.form-validator.min',
                'plugins/tag-it'                 : 'plugins/tag-it/js/tag-it.min',
                'plugins/jquery-hotkeys'         : 'plugins/jQuery.Hotkeys/jquery.hotkeys',
                'plugins/jquery-mockjax'         : 'plugins/jquery-mockajax/dist/jquery.mockjax.min',
                'plugins/jquery-serialize-object': 'plugins/jquery-serialize-object/dist/jquery.serialize-object.min',
                'plugins/jquery-form': 'plugins/jquery-form/jquery.form',

                // flotcharts
                'flot'             : 'plugins/flotcharts/jquery.flot',
                'flot.pie'         : 'plugins/flotcharts/jquery.flot.pie',
                'flot.events'      : 'plugins/flotcharts/jquery.flot.events',
                'flot.selection'   : 'plugins/flotcharts/jquery.flot.selection',
                'flot.stack'       : 'plugins/flotcharts/jquery.flot.stack',
                'flot.stackpercent': 'plugins/flotcharts/jquery.flot.stackpercent',
                'flot.time'        : 'plugins/flotcharts/jquery.flot.time',
                'flot.byte'        : 'plugins/flotcharts/jquery.flot.byte',
                'flot.orderBars'   : 'plugins/flotcharts/jquery.flot.orderBars',

                'plugins/chartjs'     : 'plugins/chartjs/Chart.min',
                'plugins/easypiechart': 'vendor/jquery.easypiechart',
                'plugins/sparkline'   : 'plugins/jquery-sparkline/dist/jquery.sparkline.min',
                'plugins/highcharts'  : 'plugins/highcharts',
                'plugins/d3'          : 'plugins/d3/d3.min',
                'plugins/nvd3'        : 'plugins/nvd3/build/nv.d3.min',
                'plugins/rickshaw'    : 'plugins/rickshaw/rickshaw.min',
                'plugins/vega'        : 'plugins/vega/vega.min',
                'plugins/topojson'    : 'plugins/topojson/topojson',
                'amcharts'            : 'plugins/amcharts/dist/amcharts',

                // bootstrap
                'plugins/bs-datepicker'        : 'plugins/bootstrap-datepicker/js/bootstrap-datepicker',
                'plugins/bs-progressbar'       : 'plugins/bootstrap-progressbar/bootstrap-progressbar',
                'plugins/bs-modal'             : 'plugins/bootstrap-modal/js/bootstrap-modal',
                'plugins/bs-modal-manager'     : 'plugins/bootstrap-modal/js/bootstrap-modalmanager',
                'plugins/bs-switch'            : 'plugins/bootstrap-switch/dist/js/bootstrap-switch.min',
                'plugins/bs-select'            : 'plugins/bootstrap-select/dist/js/bootstrap-select.min',
                'plugins/bs-confirmation'      : 'plugins/bootstrap-confirmation2/bootstrap-confirmation',
                'plugins/bs-maxlength'         : 'plugins/bootstrap-maxlength/bootstrap-maxlength.min',
                'plugins/bs-material'          : 'vendor/material',
                'plugins/bs-material-ripples'  : 'plugins/bootstrap-material-design/scripts/ripples',
                'plugins/contextmenu'          : 'plugins/bootstrap-contextmenu/bootstrap-contextmenu',
                'plugins/gtreetable'           : "plugins/bootstrap-gtreetable/dist/bootstrap-gtreetable",
                'plugins/bs-filestyle'         : 'plugins/bootstrap-filestyle/src/bootstrap-filestyle',
                'plugins/bs-slider'            : 'plugins/bootstrap-slider/bootstrap-slider',
                'plugins/bs-touchspin'         : 'plugins/bootstrap-touchspin/dist/jquery.bootstrap-touchspin.min',
                'plugins/bs-wysiwyg'           : 'plugins/bootstrap-wysiwyg/bootstrap-wysiwyg',
                'plugins/bs-markdown-editor'   : 'plugins/bootstrap-markdown-editor/dist/js/bootstrap-markdown-editor',
                'plugins/summernote'           : 'plugins/summernote/dist/summernote',
                'plugins/summernote-codemirror': 'plugins/summernote/dist/summernote',
                'plugins/medium-editor'        : 'plugins/medium-editor/dist/js/medium-editor.min',
                'plugins/x-editable'           : 'plugins/x-editable/dist/bootstrap3-editable/js/bootstrap-editable.min',
                'plugins/bs-wizard'            : 'plugins/twitter-bootstrap-wizard/jquery.bootstrap.wizard.min',
                'plugins/bs-pwstrength'        : 'plugins/pwstrength-bootstrap/dist/pwstrength-bootstrap-1.2.7.min',

                // gsap
                'plugins/gsap/lite'       : 'plugins/gsap/src/minified/TweenLite.min',
                'plugins/gsap/max'        : 'plugins/gsap/src/minified/TweenMax.min',
                'plugins/gsap/ease'       : 'plugins/gsap/src/minified/easing/EasePack.min',
                'plugins/gsap/css'        : 'plugins/gsap/src/minified/plugins/CSSPlugin.min',
                'plugins/gsap/attr'       : 'plugins/gsap/src/minified/plugins/AttrPlugin.min',
                'plugins/gsap/color'      : 'plugins/gsap/src/minified/plugins/ColorPropsPlugin.min',
                'plugins/gsap/scroll'     : 'plugins/gsap/src/minified/plugins/ScrollToPlugin.min',
                'plugins/gsap/text'       : 'plugins/gsap/src/minified/plugins/TextPlugin.min',
                'plugins/gsap/jquery-lite': 'plugins/gsap/src/minified/jquery.gsap.min',
                'plugins/gsap/jquery-max' : 'plugins/gsap/src/minified/jquery.gsap.min',


                // Datatables
                'datatables'           : 'plugins/datatables/media/js/jquery.dataTables.min',
                'datatables/plugins'   : 'plugins/datatables-plugins',
                'datatables/bs-plugins': 'plugins/datatables-plugins',

                // stylesheets
                'plugins/x-editablecss' : 'plugins/x-editable/dist/bootstrap3-editable/css/bootstrap-editable',
                'plugins/select2css'    : '../styles/components/select2',
                'plugins/highlightjscss': 'plugins/highlightjs/styles/github'
            },


            map: {
                '*': {
                    'css'       : 'plugins/require-css/css',
                    'd3'        : 'plugins/d3',
                    'topojson'  : 'plugins/topojson',
                    'CodeMirror': 'code-mirror!htmlmixed'
                }
            },


            shim: {
                // stand-alone and exports
                'plugins/svg'                  : {exports: 'SVG'},
                'jade'                         : {exports: 'jade'},
                'string'                       : {exports: '_s'},
                'plugins/github-api'           : {exports: 'Github'},
                'plugins/oauth2'               : {exports: 'oauth2'},
                'plugins/oauth-io'             : {exports: 'OAuth'},
                'plugins/d3'                   : {exports: 'd3'},
                'CodeMirror'                   : {exports: 'CodeMirror'},
                'code-mirror'                  : {exports: 'CodeMirror'},
                'plugins/medium-editor'        : {exports: 'MediumEditor'},
                'plugins/summernote-codemirror': {
                    deps: ['CodeMirror'],
                    init: function () {
                        this.jQuery.summernote.options = this.App.config('plugins.summernote')
                    }
                },

                'amcharts/amcharts'    : {exports: 'AmCharts'},
                'amcharts/serial'      : ['amcharts/amcharts'],
                'amcharts/themes/light': ['amcharts/amcharts'],


                // 'ace-build/ace': {exports: 'ace'},

                // jquery
                'jquery': {
                    exports: '$',
                    init   : function () {
                        this.jquery.noConflict();
                    }
                },

                'plugins/jquery-migrate'         : ['jquery'],
                'jquery-ui'                      : ['jquery'], //, 'jquery-migrate'],
                'plugins/jquery-slugify'         : ['jquery', 'plugins/speakingurl'],
                'plugins/tag-it'                 : ['jquery-ui/core', 'jquery-ui/widget', 'jquery-ui/position', 'jquery-ui/menu', 'jquery-ui/autocomplete'],
                'plugins/jquery-hotkeys'         : ['jquery'],
                'plugins/jquery-serialize-object': ['jquery'],

                // bootstrap
                'plugins/bootstrap'         : ['jquery'],
                'plugins/gtreetable'        : ['plugins/jquery-migrate', 'plugins/jquery-ui/core', 'plugins/jquery-ui/draggable', 'plugins/jquery-ui/droppable'],
                'plugins/mscrollbar'        : ['plugins/bootstrap', 'plugins/mousewheel'],
                'plugins/bs-modal'          : ['plugins/bootstrap', 'plugins/bs-modal-manager'],
                'plugins/bs-material'       : ['plugins/bootstrap', 'plugins/bs-material-ripples'],
                'plugins/bs-confirmation'   : ['plugins/bootstrap'],
                'plugins/bs-wysiwyg'        : ['plugins/jquery-hotkeys'],
                'plugins/bs-markdown-editor': ['ace-build/ace', 'jquery', 'plugins/bootstrap'],
                'plugins/bootbox'           : ['plugins/bs-modal'],
                'plugins/bs-pwstrength'     : ['plugins/bootstrap'],

                // flots

                'flot'             : ['jquery'],
                'flot.byte'        : ['jquery', 'flot'],
                'flot.orderBars'   : ['jquery', 'flot'],
                'flot.pie'         : ['jquery', 'flot'],
                'flot.events'      : ['jquery', 'flot'],
                'flot.selection'   : ['jquery', 'flot'],
                'flot.stack'       : ['jquery', 'flot'],
                'flot.stackpercent': ['jquery', 'flot'],
                'flot.time'        : ['jquery', 'flot'],

                'plugins/easypiechart': ['jquery'],
                'plugins/sparkline'   : ['jquery'],
                'plugins/nvd3'        : {exports: 'nv', deps: ['plugins/d3']},
                'plugins/vega'        : {exports: 'vg', deps: ['plugins/d3', 'plugins/topojson']},
                'plugins/rickshaw'    : {exports: 'Rickshaw', deps: ['plugins/d3']},

                // misc
                'plugins/gsap/lite'       : ['plugins/gsap/scroll'],
                'plugins/gsap/max'        : {exports: 'TweenMax', deps: ['plugins/gsap/scroll']},
                'plugins/gsap/jquery-lite': ['jquery', 'plugins/gsap/lite'],
                'plugins/gsap/jquery-max' : ['jquery', 'plugins/gsap/max'],

                'vendor/dataTables.bootstrap': ['datatables'],

                // style loading
                'plugins/select2'    : ['css!plugins/select2css'],
                'plugins/highlightjs': ['css!plugins/highlightjscss'],
                'plugins/x-editable' : ['css!plugins/x-editablecss'],

                // packadic scripts
                'config'    : ['jquery'],
                'eventer'   : ['jquery', 'plugins/events'],
                //'autoload'           : ['jquery'],
                'packadic'  : ['plugins/bootstrap'], //, 'plugins/events'],
                'demo'      : ['packadic'],
                'autoloader': {exports: 'autoloader', deps: ['jquery']}
            },



            waitSeconds: 5,

            config: {
                debug: true
            },

            cm: {
                // baseUrl to CodeMirror dir
                baseUrl: 'plugins/codemirror/',
                // path to CodeMirror lib
                path   : 'lib/codemirror',
                // path to CodeMirror css file
                css    : '<%= paths.scripts %>/plugins/codemirror/lib/codemirror.css',
                // define themes
                themes : {
                    monokai : '<%= paths.scripts %>/plugins/codemirror/theme/monokai.css',
                    ambiance: '<%= paths.scripts %>/plugins/codemirror/theme/ambiance.css',
                    zenburn : '<%= paths.scripts %>/plugins/codemirror/theme/zenburn.css',
                    eclipse : '<%= paths.scripts %>/plugins/codemirror/theme/eclipse.css'
                },
                modes  : {
                    // modes dir structure
                    path: 'mode/{mode}/{mode}'
                }
            }


        },
        jQueryUI              : jqui,
        chartjsGlobal         : {
            // Boolean - Whether to animate the chart
            animation: true,

            // Number - Number of animation steps
            animationSteps: 60,

            // String - Animation easing effect
            // Possible effects are:
            // [easeInOutQuart, linear, easeOutBounce, easeInBack, easeInOutQuad,
            //  easeOutQuart, easeOutQuad, easeInOutBounce, easeOutSine, easeInOutCubic,
            //  easeInExpo, easeInOutBack, easeInCirc, easeInOutElastic, easeOutBack,
            //  easeInQuad, easeInOutExpo, easeInQuart, easeOutQuint, easeInOutCirc,
            //  easeInSine, easeOutExpo, easeOutCirc, easeOutCubic, easeInQuint,
            //  easeInElastic, easeInOutSine, easeInOutQuint, easeInBounce,
            //  easeOutElastic, easeInCubic]
            animationEasing: "easeOutQuart",

            // Boolean - If we should show the scale at all
            showScale: true,

            // Boolean - If we want to override with a hard coded scale
            scaleOverride: false,

            // ** Required if scaleOverride is true **
            // Number - The number of steps in a hard coded scale
            scaleSteps     : null,
            // Number - The value jump in the hard coded scale
            scaleStepWidth : null,
            // Number - The scale starting value
            scaleStartValue: null,

            // String - Colour of the scale line
            scaleLineColor: "rgba(0,0,0,.1)",

            // Number - Pixel width of the scale line
            scaleLineWidth: 1,

            // Boolean - Whether to show labels on the scale
            scaleShowLabels: true,

            // Interpolated JS string - can access value
            scaleLabel: "<%=value%>",

            // Boolean - Whether the scale should stick to integers, not floats even if drawing space is there
            scaleIntegersOnly: true,

            // Boolean - Whether the scale should start at zero, or an order of magnitude down from the lowest value
            scaleBeginAtZero: false,

            // String - Scale label font declaration for the scale label
            scaleFontFamily: null, // if still null @ boot, the boot script will auto set it correctly //"'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",

            // Number - Scale label font size in pixels
            scaleFontSize: 12,

            // String - Scale label font weight style
            scaleFontStyle: "normal",

            // String - Scale label font colour
            scaleFontColor: "#666",

            // Boolean - whether or not the chart should be responsive and resize when the browser does.
            responsive: true,

            // Boolean - whether to maintain the starting aspect ratio or not when responsive, if set to false, will take up entire container
            maintainAspectRatio: true,

            // Boolean - Determines whether to draw tooltips on the canvas or not
            showTooltips: true,

            // Function - Determines whether to execute the customTooltips function instead of drawing the built in tooltips (See [Advanced - External Tooltips](#advanced-usage-custom-tooltips))
            customTooltips: false,

            // Array - Array of string names to attach tooltip events
            tooltipEvents: ["mousemove", "touchstart", "touchmove"],

            // String - Tooltip background colour
            tooltipFillColor: "rgba(0,0,0,0.8)",

            // String - Tooltip label font declaration for the scale label
            tooltipFontFamily: null, // if still null @ boot, the boot script will auto set it correctly //"'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",

            // Number - Tooltip label font size in pixels
            tooltipFontSize: 14,

            // String - Tooltip font weight style
            tooltipFontStyle: "normal",

            // String - Tooltip label font colour
            tooltipFontColor: "#fff",

            // String - Tooltip title font declaration for the scale label
            tooltipTitleFontFamily: null, // if still null @ boot, the boot script will auto set it correctly //"'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",

            // Number - Tooltip title font size in pixels
            tooltipTitleFontSize: 14,

            // String - Tooltip title font weight style
            tooltipTitleFontStyle: "bold",

            // String - Tooltip title font colour
            tooltipTitleFontColor: "#fff",

            // Number - pixel width of padding around tooltip text
            tooltipYPadding: 6,

            // Number - pixel width of padding around tooltip text
            tooltipXPadding: 6,

            // Number - Size of the caret on the tooltip
            tooltipCaretSize: 8,

            // Number - Pixel radius of the tooltip border
            tooltipCornerRadius: 6,

            // Number - Pixel offset from point x to tooltip edge
            tooltipXOffset: 10,

            // String - Template string for single tooltips
            tooltipTemplate: "<%if (label){%><%=label%>: <%}%><%= value %>",

            // String - Template string for multiple tooltips
            multiTooltipTemplate: "<%= value %>",

            // Function - Will fire on animation progression.
            onAnimationProgress: function () {
            },

            // Function - Will fire on animation completion.
            onAnimationComplete: function () {
            }
        }
    };

    /*
     {
     sidebarDisabled     : false,
     'layout-option'     : 'fluid',
     'sidebar-option'    : 'default',
     'sidebar-menu'      : 'accordion',
     'sidebar-pos-option': 'left',
     'sidebar-style'     : 'default',
     'section-bottom'    : 'fixed',
     'section-top'       : 'normal'
     }
     */
    jqui.forEach(function (name) {
        config.requireJS.paths['plugins/jquery-ui/' + name] = 'plugins/jquery-ui/ui/minified/' + name + '.min'
    });


    App.ready(function () {
        App.init(config);
    });


}.call());
