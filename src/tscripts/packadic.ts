///<reference path="types.d.ts"/>
import {Application} from 'app/application';


module packadic {
    export class App extends Application {

        public ready(cb:any){
            cb()
        }

        public when(){
            var event    = arguments[0],
                modules  = _.isFunction(arguments[1]) ? [] : arguments[1],
                callback = _.isFunction(arguments[1]) ? arguments[1] : arguments[2];

            window['App'].ready(function () {
                window['App'].on(event, function () {
                    if(modules.length > 0) {
                        require(modules, callback);
                    } else {
                        callback()
                    }
                });
            });
        }
    }
}
export = packadic;
