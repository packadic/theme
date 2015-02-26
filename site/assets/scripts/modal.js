define([ 'jquery', 'lodash', 'templates/modal', 'plugins/bootstrap' ],
    function( $, _, template ){
        'use strict';

        var _super = $.fn.modal;

        // add custom defaults
        $.extend(_super.defaults, {
            foo : 'bar',
            john: 'doe'
        });

        console.log('packadicModal loaded', 'template', template);
        // create a new constructor
        var Modal = function( element, options ){
            // Default options inherited from parent
            this.options = options;
            this.$body = $(document.body);
            this.$element = $(element);
            this.$backdrop =
            this.isShown = null;
            this.scrollbarWidth = 0;

            // do custom constructor stuff here

            // call the original constructor
            _super.Constructor.apply(this, arguments);

        };


        // extend prototypes and add a super function
        Modal.prototype = $.extend({}, _super.Constructor.prototype, {
            constructor: Modal,
            _super     : function(){
                var args = $.makeArray(arguments);
                _super.Constructor.prototype[ args.shift() ].apply(this, args);
            },
            show       : function(){

                // do custom method stuff

                // call the original method
                this._super('show');
            }
        });


        // MODAL PLUGIN DEFINITION
        // =======================

        function Plugin( option, _relatedTarget ){
            return this.each(function(){
                var $this = $(this);
                var data = $this.data('bs.modal');
                var options = $.extend({}, Modal.DEFAULTS, $this.data(), typeof option == 'object' && option)

                if( !data ){
                    $this.data('bs.modal', (data = new Modal(this, options)))
                }
                if( typeof option == 'string' ){
                    data[ option ](_relatedTarget)
                } else if( options.show ){
                    data.show(_relatedTarget)
                }
            })
        }

        var old = $.fn.packadicModal;

        $.fn.packadicModal = Plugin;
        $.fn.packadicModal.Constructor = Modal;


        // MODAL NO CONFLICT
        // =================

        $.fn.packadicModal.noConflict = function(){
            $.fn.packadicModal = old;
            return this
        };


        // MODAL DATA-API
        // ==============

        $(document).on('click.bs.modal.data-api', '[data-toggle="packadic-modal"]', function( e ){
            var $this = $(this);
            var href = $this.attr('href');
            var $target = $($this.attr('data-target') || (href && href.replace(/.*(?=#[^\s]+$)/, '')));// strip for ie7
            var option = $target.data('bs.modal') ? 'toggle' : $.extend({remote: !/#/.test(href) && href}, $target.data(), $this.data());

            if( $this.is('a') ){
                e.preventDefault()
            }

            $target.one('show.bs.modal', function( showEvent ){
                if( showEvent.isDefaultPrevented() ){
                    return
                } // only register focus restorer if modal will actually get shown
                $target.one('hidden.bs.modal', function(){
                    $this.is(':visible') && $this.trigger('focus')
                })
            });
            Plugin.call($target, option, this)
        })

    });
