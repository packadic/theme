///<reference path="typings/tsd.d.ts"/>
///<reference path="types.d.ts"/>
import {Application} from 'app/application';


module packadic {
    export class App extends Application {
        public ready(cb:any){
            cb()
        }
    }
}
export = packadic;
