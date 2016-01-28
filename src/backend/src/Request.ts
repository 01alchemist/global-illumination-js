export function status(response:Response) {
    if (response.status >= 200 && response.status < 300) {
        return Promise.resolve(response);
    }
    return response.text().then(function(text) {
        throw new Error(text);
    });
}

export function text(response:Response) {
    return response.text();
}

export function json(response:Response) {
    return response.json();
}

export function xml(response:Response) {
    var parser = new DOMParser();
    return response.text().then(function(text) {
        return parser.parseFromString(text,"application/xml");
    });
}
export function arrayBuffer(response:Response):Promise {
    return response.arrayBuffer();
}