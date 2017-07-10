import { IStorageService } from '../storage/StorageService'
import Entity from '../storage/Entity'
import Table from '../storage/Table'
import { tableColumns, tableName, tableType } from '../storage/decorators'

export default class RequestTimer {
    private start: number
    public warnings = 0
    public errors = 0
    constructor (protected storage: IStorageService, public httpMethod: 'get' | 'post') {
        this.start = Date.now();
    }
    end () {
        this.storage.lock();
        try {
            this.flush()
        }
        finally {
            this.storage.unlock();
        }
    }
    trackError (error) {
        if (error.name === 'HttpError') {
            this.warnings++;
            return;
        }
        this.errors++;
    }

    static getLast (storage: IStorageService) {
        return CacheHelper.get() || TableHelper.get(storage) || StatEntity.create();
    }
    static forceFlush (storage: IStorageService) {
        const stat = RequestTimer.getLast(storage);
        TableHelper.save(storage, stat);
        CacheHelper.save(stat);
        return stat;
    }
    private flush () {
        let duration = Date.now() - this.start;
        let stat = CacheHelper.get();
        if (stat == null) {
            stat = TableHelper.get(this.storage);
            if (stat == null) {
                stat = StatEntity.create();
            }
        } 
        if (StatEntity.isCurrent(stat) === false) {
            TableHelper.save(this.storage, stat);
            stat = StatEntity.create();
        }
    
        stat.updateWithRequest(duration, this);

        // if (StatEntity.shouldPersist(stat)) {
        //     TableHelper.save(this.storage, stat);
        // }

        CacheHelper.save(stat);
    }
    
}

namespace CacheHelper {
    const KEY = 'script-timer-v3';
    export function get () {
        let cache = CacheService.getScriptCache();
        let str = cache.get(KEY);
        if (str == null) {
            return null;
        }
        let values = str.split(';');
        return StatEntity.deserialize(values) as StatEntity;
    }
    export function save(entity: StatEntity) {
        let cache = CacheService.getScriptCache();
        cache.put(KEY, entity.serialize({withPlainTextFormat: false}).join(';'), 21600);
    }
}
namespace TableHelper {
    let table_: StatsTable;

    export function get (storage: IStorageService, dateKey: string = StatEntity.createKey()) {
        let table = getTable(storage);
        return table.find('date', dateKey);        
    }
    export function save(storage: IStorageService, entity: StatEntity) {
        entity.lastSaveDate = new Date();
        let table = getTable(storage);
        
        if (entity.row < 1) {
            entity.row = table.findRow('date', entity.date);
        }
        table.upsert(entity);
    }
    function getTable(storage: IStorageService) {
        return table_ || (table_ = new StatsTable(storage));
    }
}


@tableColumns([
    ['date', { type: String}], 
    ['postRequests', { type: Number }],
    ['postAverageTime', { type: Number }],
    ['postTotalTime', { type: Number }],
    ['postMinTime',  { type: Number }],
    ['postMaxTime', { type: Number }],

    ['getRequests', { type: Number }],        
    ['getAverageTime', { type: Number }],
    ['getTotalTime', { type: Number }],
    ['getMinTime', { type: Number }], 
    ['getMaxTime', { type: Number }],

    ['warnings', { type: Number }],
    ['errors', { type: Number }],
    ['lastSaveDate', { type: Date }]
])
class StatEntity extends Entity {
    date: string
    postRequests = 0
    postAverageTime = 0
    postTotalTime = 0
    postMinTime = 0
    postMaxTime = 0

    getRequests = 0
    getAverageTime = 0
    getTotalTime = 0
    getMinTime = 0
    getMaxTime = 0

    warnings: number = 0
    errors: number = 0
    
    lastSaveDate: Date

    updateWithRequest (duration: number, req: RequestTimer) {
        
        this.warnings += req.warnings;
        this.errors += req.errors;
        switch (req.httpMethod) {
            case 'get': {
                let average = ((this.getAverageTime * this.getRequests) + duration) / (this.getRequests + 1);
                this.getAverageTime = average;
                this.getRequests += 1;
                this.getTotalTime += duration / 1000;
                if (req.warnings === 0 && req.errors === 0) {
                    if (this.getMinTime === 0 || this.getMinTime > duration) {
                        this.getMinTime = duration;
                    }    
                    if (this.getMaxTime < duration) {
                        this.getMaxTime = duration;
                    }
                }
                break;
            }
            case 'post': {
                let average = ((this.postAverageTime * this.postRequests) + duration) / (this.postRequests + 1);
                this.postAverageTime = average;
                this.postRequests += 1;
                this.postTotalTime += duration / 1000;
                if (req.warnings === 0 && req.errors === 0) {
                    if (this.postMinTime === 0 || this.postMinTime > duration) {
                        this.postMinTime = duration;
                    }    
                    if (this.postMaxTime < duration) {
                        this.postMaxTime = duration;
                    }
                }
                break;    
            }       
        }
    }

    static create (): StatEntity {
        let cache = new StatEntity;
        cache.date = StatEntity.createKey();
        return cache;      
    }

    static createKey (): string {
        let now = new Date();
        return now.getFullYear() +'-' + (now.getMonth() + 1) + '-' + now.getDate() + ':' + now.getHours();  
    }

    static isCurrent (x: StatEntity): boolean {
        return x.date === StatEntity.createKey();
    }
    static shouldPersist (x: StatEntity): boolean {
        let lastSave = x.lastSaveDate;
        if (lastSave == null) {
            return true;
        }
        let diff = Date.now() - lastSave.valueOf();
        const MINUTES = 30;
        return diff > MINUTES * 60 * 1000;
    }
}

@tableName('ServerStats')
@tableType(StatEntity)
class StatsTable extends Table<StatEntity> {
	
}