export class CONFIG {
    static endpoints = {
        convertImage: '/convertImage/'
    };

    static supportedImageFormats:string[] = [".jpg", ".jpeg", ".png", ".hdr", ".tga"];

    static isSupportedTexture(fileName:string):boolean {
        var extension:string = fileName.substring(fileName.lastIndexOf("."),fileName.length).toLowerCase();
        return CONFIG.supportedImageFormats.indexOf(extension) > -1;
    }
}