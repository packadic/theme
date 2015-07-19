///<reference path="types.d.ts"/>
import $ = require('jquery');
import {Application} from 'app/application';


class Demo {
    protected app:Application;

    public init(app:Application) {
        this.app = app;
        this.present('.demo-modal', 'modals');
        this.present('.demo-popover', 'popover');
        this.present('#packadic-themer', 'themer');
        this.present('.demo-button-editor', 'button-icon-showcase');
        this.present('#gtreetable', 'gtreetable');
        this.present('.show-class', 'show-class');
        this.present('.show-html', 'show-html');
        this.present('#demo-plugins-docs', 'plugins-docs');
        this.present('.plugin-markdown', 'plugin-markdown');
        this.present('.demo-jq-impromptu', 'jq-impromptu');
        this.present('#demo-forms', 'forms');
        this.present('#charts-demo', 'flots');
        this.present('#charts-demo', 'charts');
        this.present('#demo-forms-xeditor', 'forms-xeditor');


        this.demoClass('#dashboard-demo', 'dashboard');
        this.demoClass('#demo-treeview', 'treeview');
        this.demoClass('#demo-forms-editors', 'forms-editors');
        this.demoClass('#demo-forms-wizard', 'forms-wizard');
        this.demoClass('#demo-charts-amcharts', 'charts-amcharts');
    }

    protected demoClass(selector, module) {
        var self:Demo = this;
        var $els = $(selector);
        if ($els.length > 0) {
            require(['demo/' + module], function (mod) {
                var instance:any = new mod(self.app);
                instance.init();
            });
        }
    }

    protected present(selector, module) {
        var $els = $(selector);
        if ($els.length > 0) {
            require(['demo/' + module], function (mod) {
                if (typeof mod === 'function') {
                    mod($els);
                }
            });
        }
    }
}


var demo:Demo = new Demo();
export = demo;
