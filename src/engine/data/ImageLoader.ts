import {DataCache} from "./DataCache";
import {CONFIG} from "../../backend/src/config/config";
import {BufferedImage} from "../image/BufferedImage";
import {HDRPipe} from "./parser/HDRParser";
import {TGAPipe} from "./parser/TGAParser";
/**
 * Created by Nidin Vinayakan on 10-01-2016.
 */
export class ImageLoader {

    static crossOrigin:string = "*";

    constructor() {

    }

    static load(url:string, isLinear:boolean=false, onLoad?:Function, onProgress?:Function, onError?:Function):Promise {

        return new Promise(function (resolve, reject) {


            var extension:string = url.substring(url.lastIndexOf("."), url.length).toLowerCase();
            if (CONFIG.supportedImageFormats.indexOf(extension) == -1) {
                console.error("Unsupported image format:" + extension);
                reject("Unsupported image format:" + extension);
            }

            var cached = DataCache.getItem(url);

            if (cached !== undefined) {
                onLoad(cached);
                resolve(cached);
            }

            var fetchOptions = {
                method: 'GET',
                headers: {
                    'Accept': 'application/octet-stream',
                    'Content-Type': 'application/octet-stream'
                }
            };

            function onSuccess(image){
                if (onLoad) onLoad(image);
                DataCache.add(url, image);
                resolve(image);
            }
            function onFail(error){
                console.log(error.message);
                if (onError)onError(error);
                reject(error);
            }

            if (extension === ".hdr") {
                // load radiance rgbe file
                fetch(url, fetchOptions)
                    .then(HDRPipe(isLinear))
                    .then((hdrImage) => {
                        onSuccess(hdrImage);
                    })
                    .catch((error) => {
                        onFail(error);
                    });

            } else if (extension === ".tga") {
                fetch(url, fetchOptions)
                    .then(TGAPipe)
                    .then((tgaImage) => {
                        onSuccess(tgaImage);
                    })
                    .catch((error) => {
                        onFail(error);
                    });
            } else {

                var image = document.createElement('img');
                image.addEventListener('load', function (event) {
                    onSuccess(this);
                }, false);

                if (onProgress !== undefined) {
                    image.addEventListener('progress', function (event) {
                        onProgress(event);
                    }, false);
                }

                if (onError !== undefined) {
                    image.addEventListener('error', function (event) {
                        onFail({message:"Error! Loading image failed"})
                    }, false);
                }

                if (ImageLoader.crossOrigin !== undefined) image.crossOrigin = ImageLoader.crossOrigin;

                image.src = url;
            }
        });
    }
}
