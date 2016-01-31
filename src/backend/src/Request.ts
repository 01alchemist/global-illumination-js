export function status(response:Response) {
    if (parseInt(response.status) >= 200 && parseInt(response.status) < 300) {
        return Promise.resolve(response);
    }
    return response.text().then(function(text) {
        throw new Error(text);
    });
}

export function text(response:Response):Promise<string> {
    return response.text();
}

export function json(response:Response):Promise<Object> {
    return response.json();
}

export function xml(response:Response) {
    var parser = new DOMParser();
    return response.text().then(function(text) {
        return parser.parseFromString(text,"application/xml");
    });
}
export function arrayBuffer(response:Response):Promise<ArrayBuffer> {
    return response.arrayBuffer();
}