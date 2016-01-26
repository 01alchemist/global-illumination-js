import {DataCache} from "./DataCache";
/**
 * Created by Nidin Vinayakan on 26/1/2016.
 */
export class DataLoader {

    constructor() {

    }
    load(url:string, onLoad:Function, onProgress:Function, onError:Function ):XMLHttpRequest {

        var cached = DataCache.getItem( url );

        if ( cached !== undefined ) {

            onLoad( cached );
            return;

        }

        var xhr:XMLHttpRequest = new XMLHttpRequest();
        xhr.open('GET', url, true);

        xhr.addEventListener( 'load', function ( event ) {

            DataCache.add( url, xhr.response );

            if (onLoad) {
                onLoad(xhr.response);
            }

        }, false );

        if ( onProgress !== undefined ) {

            xhr.addEventListener( 'progress', function ( event ) {

                onProgress( event );

            }, false );

        }

        if ( onError !== undefined ) {

            xhr.addEventListener( 'error', function ( event ) {

                onError( event );

            }, false );

        }

        xhr.send(null);

        return xhr;
    }
}