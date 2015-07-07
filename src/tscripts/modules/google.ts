///<reference path="../types.d.ts"/>
import $ = require('jquery')
import {Application} from 'app/application';

declare var App:Application;

export class Google {

    protected clientId:string;
    protected apiKey:string;
    protected scopes:string;
    protected authButton:JQuery;
    public apiCall:Function = function () {
        console.log('apiCall');
    };

    constructor($target:JQuery) {
        this.authButton = $(document.createElement('button')).css({
            visibility: 'hidden'
        }).text('Authorize').appendTo($target);
    }

    protected handleAuthClick(event):boolean {
        gapi.auth.authorize({client_id: this.clientId, scope: this.scopes, immediate: false}, this.handleAuthResult.bind(this));
        return false;
    }

    protected handleAuthResult(authResult:GoogleApiOAuth2TokenObject) {
        if (authResult && !authResult.error) {
            this.authButton.css({visibility: 'hidden'});
            this.apiCall();
        } else {
            this.authButton.css({visibility: ''});
            this.authButton.on('click', this.handleAuthClick.bind(this));
        }
    }

    protected checkAuth() {
        gapi.auth.authorize({
            client_id: this.clientId,
            scope: this.scopes,
            immediate: true,
        }, this.handleAuthResult.bind(this))
    }

    public getHandler(clientId:string|number, apiKey:string, scopes:any) {
        var self:Google = this;

        this.clientId = clientId.toString();
        this.apiKey = apiKey;
        this.scopes = scopes;

        return function () {
            gapi.client.setApiKey(apiKey);
            window.setTimeout(self.checkAuth.bind(self), 1)
        }
    }

    public loadClientLibrary(callbackName:string){
        if($('script#google-client-library').length > 0){
            return;
        }
        $(document.createElement('script')).attr({
            id: 'google-client-library',
            src: 'https://apis.google.com/js/client.js?onload=' + callbackName
        }).appendTo($('head'));

    }
}
