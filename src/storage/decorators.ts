import Entity from './Entity';
import Table from './Table';

export function tableName (name: string) {
    return function (target: Function) {
        (<any>target).TABLE_NAME = name;
    }
};

export function tableType (entity: Function) {
    return function (target: Function) {
        (<any>target).TABLE_ENTITY = entity;
    }
};

export namespace TableHelper {
    export function getName (instance: Table<Entity>): string {
        return (<any>instance.constructor).TABLE_NAME;
    }
    export function getType(instance: Table<Entity>): new () => Entity  {
        return (<any>instance.constructor).TABLE_ENTITY;
    }
}

interface TypeOptions {
    type?: Function
    serialize?: Function
    deserialize?: Function
}

class ColumnInfo {
    constructor (public property: string, public typeOptions: TypeOptions) {

    }
    serialize (instance: Entity, options?: { withPlainTextFormat: boolean }) {
        let val = instance[this.property];
        if (val == null || val === '') {
            return '';
        }
        let opts = this.typeOptions;
        if (opts == null) {
            return val;
        }
        if (opts.serialize) {
            return opts.serialize(val, instance);
        }

        switch (opts.type) {
            case Boolean:
                return val ? val : '';            
            case String:
                if (options != null && options.withPlainTextFormat === false) {
                    return val;
                }
                return "'" + val;

            default:
                return val;
        }
    }
    deserialize (instance: Entity, val: string, values: any[]) {
        instance[this.property] = this.parse(instance, val, values);
    }
    private parse (instance: Entity, val: string, values: any[]) {
        let opts = this.typeOptions;
        if (opts == null) {
            return val;
        }
        if (opts.deserialize) {
            return opts.deserialize(val, instance, values);
        }
        switch (opts.type) {
            case Boolean:
                return TypeUtils.Bool.parse(val);
            case Number:            
                return TypeUtils.Num.parse(val);
            case Date:
                return TypeUtils.DateUtil.parse(val);
            default:
                return val;
        }
    }
}

export function tableColumns (arr: any[][]) {
    return function (Entity: Function) {
        let columns = arr.map(x => {
            let [ property, typeOptions] = x;
            return new ColumnInfo(property, typeOptions);
        });

        Entity.prototype.COLUMNS = columns;
    }
};

export namespace EntityHelper {
    export function serialize (instance: Entity, options?: any): any[] {
        let columns = (<any>instance).COLUMNS  as ColumnInfo[];
        if (columns == null) {
            throw Error('No COLUMNS declaration. Use @tableColumn decorator on properties to set the infos')
        }
        return columns.map(column => column.serialize(instance, options));
    }
    export function deserialize(Entity: new () => Entity, values: any) {
        let columns = Entity.prototype.COLUMNS as ColumnInfo[];
        if (columns == null) {
            throw Error('No COLUMNS declaration. Use @tableColumn decorator on properties to set the infos')
        }
        let entity = new Entity();
        columns.forEach((column, i) => column.deserialize(entity, values[i], values));
        return entity;
    }
    export function getColumn(Entity: Function, property: string): number {
        let columns = Entity.prototype.COLUMNS as ColumnInfo[];
        if (columns == null) {
            throw Error('No COLUMNS declaration. Use @tableColumn decorator on properties to set the infos')
        }
        var i = -1, imax = columns.length;
        while(++i < imax) {
            if (columns[i].property === property) {
                return i + 1;
            }
        }
        return -1;
    }
}

namespace TypeUtils {
    
    export namespace Bool {
        export function parse (val: any) {
            if (val == null) {
                return false;
            }
            switch (typeof val) {
                case 'string':
                    return /^true$/i.test(val) || '1' === val;
                case 'number':
                    return val === 0 ? false : true;
            }
            return Boolean(val);
        }
    }
    export namespace Num {
        export function parse (val: any) {
            if (val == null || val === '') {
                return 0;
            }
            switch (typeof val) {
                case 'string':
                    return parseFloat(val);
                case 'number':
                    return val;
            }
            return Number(val) || 0;
        }
    }
    export namespace DateUtil {
        export function parse (val: any) {
            if (val == null || val === '') {
                return null;
            }
            return new Date(val);
        }
    }
}