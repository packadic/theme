define([ 'jquery'       ,'plugins/select2', 'plugins/bs-datepicker', 'plugins/bs-maxlength', 'plugins/bs-touchspin' ],
    function( $ ){

        'use strict';
        var data = [{ id: 0, textFormat: 'enhancement' }, { id: 1, textFormat: 'bug' }, { id: 2, textFormat: 'duplicate' }, { id: 3, textFormat: 'invalid' }, { id: 4, textFormat: 'wontfix' }];

        $('.form-demo-select2-tags').select2({
            data: data,
            tags: true,
            tokenSeparators: [',', ' ']
        });

        $('.form-demo-select2').select2({
            data: data
        });

        $('.form-demo-datepicker-inline').datepicker({
            todayBtn: true,
            clearBtn: true,
            calendarWeeks: true
        });

        $('.form-demo-datepicker-input').datepicker();


        $('.form-demo-maxlength').maxlength();

        $('.form-demo-touchspin').TouchSpin({

        });
    });
