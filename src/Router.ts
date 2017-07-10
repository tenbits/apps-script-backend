import Application from './Application';
import HttpError from './class/HttpError'

export interface IAction {
    process: (request: any, app:Application) => object
}
export interface IRouteCollection {
    [path: string]: IAction
}

export default class Router {
    get: IRouteCollection
    post: IRouteCollection
    constructor (public app: Application, routes: IRouteCollection) {
        this.get = {}
        this.post = {};
        for (let path in routes) {
            if (path[0] === '$') {
                let i = path.indexOf(' ');
                let method = path.substring(1, i).toLowerCase();
                this[method][path.substring(i + 1)] = routes[path];
                continue;
            }
            this.get[path] = routes[path];
        }
    }
    process (method: 'get'|'post', request) {
        let data = request.parameter;
        let action = data.action || '/';
        let handler = this[method][action];
        if (handler == null) {
            throw new HttpError('Action not found', 404); 
        }
        return handler.process(request, this.app);
    }
}
