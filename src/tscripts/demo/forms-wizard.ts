///<reference path="../types.d.ts"/>
/// <amd-dependency path="plugins/bs-wizard">
/// <amd-dependency path="plugins/jquery-validate">

import $ = require('jquery');
import packadic = require('packadic');
import {defined,def,cre} from 'app/util';
import spawner = require('../spawner');

class FormsWizardDemo {
    private app:packadic.App;

    constructor(app:packadic.App) {
        this.app = app;
    }

    public init() {
        $(function () {
            this.initWizards();
        }.bind(this));
    }


    protected initWizards(){

        /*
         Wizard #1
         */
        var $w1finish = $('#w1').find('ul.pager li.finish'),
            $w1validator = $("#w1 form").validate({
                highlight: function(element) {
                    $(element).closest('.form-group').removeClass('has-success').addClass('has-error');
                },
                success: function(element) {
                    $(element).closest('.form-group').removeClass('has-error');
                    $(element).remove();
                },
                errorPlacement: function( error, element ) {
                    element.parent().append( error );
                }
            });

        $w1finish.on('click', function( ev ) {
            ev.preventDefault();
            var validated:boolean = $('#w1 form').valid();
            if ( validated ) {
                spawner.toastr('success', 'You completed the wizard', 'Your done!');
            }
        });

        $('#w1').bootstrapWizard(<any>{
            tabClass: 'wizard-steps',
            nextSelector: 'ul.pager li.next',
            previousSelector: 'ul.pager li.previous',
            firstSelector: null,
            lastSelector: null,
            onNext: function (tab: any, navigation: any, index: number): boolean {
                var validated = $('#w1 form').valid();
                if (!validated) {
                    $w1validator.focusInvalid();
                    return false;
                }
            },
            onTabClick: function (tab:any, navigation:any, index:any, newindex:any) {
                if (newindex == index + 1) {
                    return this.onNext(tab, navigation, index, newindex);
                } else if (newindex > index + 1) {
                    return false;
                } else {
                    return true;
                }
            },
            onTabChange: function (tab, navigation, index, newindex) {
                var totalTabs = navigation.find('li').size() - 1;
                $w1finish[newindex != totalTabs ? 'addClass' : 'removeClass']('hidden');
                $('#w1').find(this.nextSelector)[newindex == totalTabs ? 'addClass' : 'removeClass']('hidden');
            }
        });

        /*
         Wizard #2
         */
        var $w2finish = $('#w2').find('ul.pager li.finish'),
            $w2validator = $("#w2 form").validate({
                highlight: function(element) {
                    $(element).closest('.form-group').removeClass('has-success').addClass('has-error');
                },
                success: function(element) {
                    $(element).closest('.form-group').removeClass('has-error');
                    $(element).remove();
                },
                errorPlacement: function( error, element ) {
                    element.parent().append( error );
                }
            });

        $w2finish.on('click', function( ev ) {
            ev.preventDefault();
            var validated = $('#w2 form').valid();
            if ( validated ) {
                spawner.toastr('success', 'You completed the wizard', 'Your done!');
            }
        });

        $('#w2').bootstrapWizard(<any>{
            tabClass: 'wizard-steps',
            nextSelector: 'ul.pager li.next',
            previousSelector: 'ul.pager li.previous',
            firstSelector: null,
            lastSelector: null,
            onNext: function( tab, navigation, index, newindex ) {
                var validated = $('#w2 form').valid();
                if( !validated ) {
                    $w2validator.focusInvalid();
                    return false;
                }
            },
            onTabClick: function( tab, navigation, index, newindex ) {
                if ( newindex == index + 1 ) {
                    return this.onNext( tab, navigation, index, newindex);
                } else if ( newindex > index + 1 ) {
                    return false;
                } else {
                    return true;
                }
            },
            onTabChange: function( tab, navigation, index, newindex ) {
                var totalTabs = navigation.find('li').size() - 1;
                $w2finish[ newindex != totalTabs ? 'addClass' : 'removeClass' ]( 'hidden' );
                $('#w2').find(this.nextSelector)[ newindex == totalTabs ? 'addClass' : 'removeClass' ]( 'hidden' );
            }
        });

        /*
         Wizard #3
         */
        var $w3finish = $('#w3').find('ul.pager li.finish'),
            $w3validator = $("#w3 form").validate({
                highlight: function(element) {
                    $(element).closest('.form-group').removeClass('has-success').addClass('has-error');
                },
                success: function(element) {
                    $(element).closest('.form-group').removeClass('has-error');
                    $(element).remove();
                },
                errorPlacement: function( error, element ) {
                    element.parent().append( error );
                }
            });

        $w3finish.on('click', function( ev ) {
            ev.preventDefault();
            var validated = $('#w3 form').valid();
            if ( validated ) {
                spawner.toastr('success', 'You completed the wizard', 'Your done!');
            }
        });

        $('#w3').bootstrapWizard(<any>{
            tabClass: 'wizard-steps',
            nextSelector: 'ul.pager li.next',
            previousSelector: 'ul.pager li.previous',
            firstSelector: null,
            lastSelector: null,
            onNext: function( tab, navigation, index, newindex ) {
                var validated = $('#w3 form').valid();
                if( !validated ) {
                    $w3validator.focusInvalid();
                    return false;
                }
            },
            onTabClick: function( tab, navigation, index, newindex ) {
                if ( newindex == index + 1 ) {
                    return this.onNext( tab, navigation, index, newindex);
                } else if ( newindex > index + 1 ) {
                    return false;
                } else {
                    return true;
                }
            },
            onTabChange: function( tab, navigation, index, newindex ) {
                var $total = navigation.find('li').size() - 1;
                $w3finish[ newindex != $total ? 'addClass' : 'removeClass' ]( 'hidden' );
                $('#w3').find(this.nextSelector)[ newindex == $total ? 'addClass' : 'removeClass' ]( 'hidden' );
            },
            onTabShow: function( tab, navigation, index ) {
                var $total = navigation.find('li').length - 1;
                var $current = index;
                var $percent = Math.floor(( $current / $total ) * 100);
                $('#w3').find('.progress-indicator').css({ 'width': $percent + '%' });
                tab.prevAll().addClass('completed');
                tab.nextAll().removeClass('completed');
            }
        });

    }
}
export = FormsWizardDemo
