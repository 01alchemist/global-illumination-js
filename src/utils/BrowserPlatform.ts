/**
 * Created by Nidin Vinayakan on 27/1/2016.
 */
export class BrowserPlatform {

    static saveFile(fileName:string, data:any, type:string = "application/octet-binary") {
        var blob = new Blob([data], { type: type });
        var url:string = URL.createObjectURL(blob);
        var save_link:HTMLAnchorElement = <HTMLAnchorElement>document.createElementNS("http://www.w3.org/1999/xhtml", "a");
        save_link.href = url;
        save_link.name = fileName;
        var event = document.createEvent("MouseEvents");
        event.initMouseEvent("click", true, false, null, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
        save_link.dispatchEvent(event);
    }
}