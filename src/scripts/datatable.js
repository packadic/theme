define([ 'jquery', 'defined', 'cre', 'theme', 'datatables', 'vendor/dataTables.bootstrap', 'plugins/select2' ],
    function( $, defined, cre, theme ){
        'use strict';

        var dt = {};

        (function render(){
            /**
             * Get default Server Side Processing vars
             */
            dt.getDefaultSSPVars = function( overrides ){
                overrides = overrides || {};
                var defaults = {
                    "bPaginate"    : true,
                    "bLengthChange": true,
                    "bFilter"      : true,
                    "bSort"        : true,
                    "bInfo"        : true,
                    "bAutoWidth"   : false,
                    "bStateSave"   : true,
                    "lengthMenu"   : [
                        [ 10, 20, 50, 100, 150, -1 ],
                        [ 10, 20, 50, 100, 150, "All" ]
                    ],
                    "pageLength"   : 10,
                    "processing"   : true,
                    "serverSide"   : true
                };
                return _.merge(defaults, overrides);
            };

            dt.create = function( $targetElement, templateVars, datatableVars, callback ){
                theme.getTemplate('table', function( template ){
                    var defaultTemplateVars = {table: {cols: [], rows: []}};
                    templateVars = templateVars || defaultTemplateVars;

                    var tableHtml = template(templateVars);
                    $targetElement.html(tableHtml)
                        .find('> table')
                        .first()
                        .dataTable(datatableVars)
                        .find('.dataTables_length select').select2();

                    callback($targetElement);
                });

            }
        }.call());

        return dt;
    });
