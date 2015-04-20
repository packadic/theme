define([ 'jquery', 'defined', 'cre', 'theme', 'datatables', 'datatables/plugins/integration/bootstrap/3/dataTables.bootstrap.min' ],
    function( $, defined, cre, theme ){
        'use strict';

        var dt = {};

        (function render(){
            dt.create = function($targetElement, templateVars, datatableVars, callback){
                theme.getTemplate('table', function(template){
                    var tableHtml = template(templateVars);
                    $targetElement.html(tableHtml)
                        .find('> table')
                        .first()
                        .dataTable(datatableVars);
                    callback($targetElement)
                });

            }
        }.call());

        return dt;
    });
