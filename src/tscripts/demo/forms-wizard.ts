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

        });
    }
}
export = FormsWizardDemo
