///<reference path="../types.d.ts"/>
/// <amd-dependency path="plugins/bs-wizard">

import $ = require('jquery');
import packadic = require('packadic');
import {defined,def,cre} from 'app/util';


class FormsWizardDemo {
    private app:packadic.App;

    constructor(app:packadic.App) {
        this.app = app;
    }

    public init() {
        $(function () {
            this.initWizard();
        }.bind(this));
    }

    protected initWizard() {
        var opts:WizardOptions = {
            onNext: function (tab:any, navigation:any, index:number):boolean {
                var $name:JQuery = $('#name');
                if (index == 2) {
                    // Make sure we entered the name
                    if (!$name.val()) {
                        alert('You must enter your name');
                        $name.focus();
                        return false;
                    }
                }

                // Set the name for the next tab
                $('#tab3').html('Hello, ' + $name.val());

            },
            onTabShow: function (tab:any, navigation:any, index:number):boolean {
                var $total = navigation.find('li').length;
                var $current = index + 1;
                var $percent = ($current / $total) * 100;
                $('#rootwizard').find('.bar').css({width: $percent + '%'});
                return true;
            }
        };
        $('#rootwizard').bootstrapWizard(opts);
    }
}
export = FormsWizardDemo
