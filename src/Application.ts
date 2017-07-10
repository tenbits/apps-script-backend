import { sendJson } from './helpers/http';
import Router, { IRouteCollection } from './Router'
import StorageService, { IStorageService } from './storage/StorageService'
import { Timestamp } from './secure/Timestamp'
import Timer from './performance/RequestTimer'


interface IConfiguration {
    secure?: {
        date: Date
        prime: number
    }
    routes: IRouteCollection
    spreadsheetId: string
    shouldMeaserTimings?: boolean
    logLevel?: string
    [key: string]: any
}
export default class Application {
    config: IConfiguration

    private router: Router
    private spreadsheetId: string
    private storage: IStorageService
    private timer: Timer;
    constructor (config: IConfiguration) {
        if (config.secure) {
            Timestamp.configurate(config.secure);
        }

        this.config = config;
        this.router = new Router(this, config.routes);
        this.spreadsheetId = config.spreadsheetId;        
    }

    process (method: 'get' | 'post', request) {
        this.timer = this.config.shouldMeaserTimings 
            ? new Timer(this.getStorage(), method) 
            : null;
        
        let result;
        try {
            result = this.router.process(method, request);
        } 
        catch (error) {
            if (error.name !== 'HttpError') {                
                console.error(error + ' ' + JSON.stringify(request.parameter));                
            } else if (this.config.logLevel === 'warn') {
                console.warn(error.message + ' ' + JSON.stringify(request.parameter));
            }
            if (this.timer != null) {
                this.timer.trackError(error);
            }
            result = { 
                error: error.message,
                stack: error.stack,
                status: error.status,
                name: error.name
            };
        }
                
        if (this.timer != null) {
            this.timer.end();
        }
        return this.sendJson(result);
    }

    getStorage (): IStorageService {
        return this.storage || (this.storage = new StorageService(this.spreadsheetId));
    }

    sendJson (resp) {
        let json = resp;
        //#if (!TEST)
        json = JSON.stringify(resp);
        //#endif
        return sendJson(json);
    }
}